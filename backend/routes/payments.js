import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Booking from '../models/Booking.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to instantiate Razorpay client if keys are present
const getRazorpayClient = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || key_id.includes('placeholder') || key_secret.includes('placeholder')) {
    return null;
  }

  try {
    return new Razorpay({ key_id, key_secret });
  } catch (err) {
    console.error('[RAZORPAY INIT ERROR]:', err.message);
    return null;
  }
};

// @desc    Get Razorpay Public Configuration
// @route   GET /api/payments/config
// @access  Public
router.get('/config', (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const isConfigured = Boolean(keyId && !keyId.includes('placeholder'));
  res.json({
    keyId: isConfigured ? keyId : 'rzp_test_placeholder',
    isConfigured
  });
});

// @desc    Create Razorpay Order for Booking(s)
// @route   POST /api/payments/create-order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  const { bookingIds, amount } = req.body;

  try {
    if ((!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) && !amount) {
      return res.status(400).json({ message: 'bookingIds array or amount is required' });
    }

    let totalAmount = 0;
    let verifiedBookingIds = [];

    if (bookingIds && bookingIds.length > 0) {
      const bookings = await Booking.find({
        _id: { $in: bookingIds },
        renter: req.user._id
      });

      if (bookings.length === 0) {
        return res.status(404).json({ message: 'No valid bookings found for this user' });
      }

      totalAmount = bookings.reduce((sum, b) => sum + b.grandTotal, 0);
      verifiedBookingIds = bookings.map(b => b._id.toString());
    } else {
      totalAmount = Number(amount);
    }

    if (totalAmount <= 0) {
      return res.status(400).json({ message: 'Total amount must be greater than zero' });
    }

    const amountInPaise = Math.round(totalAmount * 100);
    const receipt = `rcpt_${Date.now().toString().slice(-8)}`;

    const rzp = getRazorpayClient();

    if (rzp) {
      // Create real Razorpay order
      const order = await rzp.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: {
          renterId: req.user._id.toString(),
          bookingIds: verifiedBookingIds.join(',')
        }
      });

      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        isSimulated: false
      });
    }

    // Fallback: Simulated Test Order (Allows full UI testing before live Razorpay API keys are configured)
    const simulatedOrderId = `order_sim_${Date.now()}`;
    return res.json({
      success: true,
      orderId: simulatedOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: 'rzp_test_placeholder',
      isSimulated: true,
      message: 'Simulated Razorpay order created. Configure RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env for live gateway.'
    });
  } catch (error) {
    console.error('[RAZORPAY CREATE ORDER ERROR]:', error);
    res.status(500).json({ message: error.message || 'Failed to create Razorpay order' });
  }
});

// @desc    Verify Razorpay Payment Signature and update bookings
// @route   POST /api/payments/verify
// @access  Private
router.post('/verify', protect, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingIds,
    isSimulated
  } = req.body;

  try {
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ message: 'Missing order_id or payment_id' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const rzp = getRazorpayClient();

    // Verify signature if running with real Razorpay keys
    if (rzp && keySecret && !isSimulated) {
      if (!razorpay_signature) {
        return res.status(400).json({ message: 'Payment signature is required' });
      }

      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid Razorpay payment signature verification failed' });
      }
    }

    // Update Bookings as paid
    if (bookingIds && Array.isArray(bookingIds) && bookingIds.length > 0) {
      const bookings = await Booking.find({
        _id: { $in: bookingIds },
        renter: req.user._id
      }).populate('listing');

      for (const booking of bookings) {
        booking.paymentStatus = 'paid';
        booking.paymentMethod = 'Razorpay';
        booking.razorpayOrderId = razorpay_order_id;
        booking.razorpayPaymentId = razorpay_payment_id;
        booking.razorpaySignature = razorpay_signature || 'simulated_sig';
        booking.paidAt = new Date();
        await booking.save();

        // Notify in associated P2P chat thread
        const conversation = await Conversation.findOne({
          participants: { $all: [booking.renter, booking.lister] },
          associatedListing: booking.listing._id
        });

        if (conversation) {
          const sysMsg = `System: Payment of ₹${booking.grandTotal} successfully completed via Razorpay (Payment ID: ${razorpay_payment_id}). Renter & Lister can now coordinate pickup!`;
          const msg = await Message.create({
            conversation: conversation._id,
            sender: req.user._id,
            content: sysMsg,
            type: 'text'
          });
          conversation.lastMessage = msg._id;
          conversation.updatedAt = new Date();
          await conversation.save();
        }
      }
    }

    res.json({
      success: true,
      message: 'Razorpay payment successfully verified and recorded!',
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error('[RAZORPAY VERIFY ERROR]:', error);
    res.status(500).json({ message: error.message || 'Payment verification failed' });
  }
});

export default router;
