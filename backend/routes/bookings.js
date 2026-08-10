import express from 'express';
import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to compute number of days
const getRentalDays = (start, end) => {
  const diffTime = Math.abs(new Date(end) - new Date(start));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 0 ? 1 : diffDays;
};

// Helper to check date overlap
const isOverlapping = (start1, end1, start2, end2) => {
  return new Date(start1) <= new Date(end2) && new Date(start2) <= new Date(end1);
};

// @desc    Validate cart items for overlaps, availability and recalculate prices
// @route   POST /api/bookings/cart/validate
// @access  Private
router.post('/cart/validate', protect, async (req, res) => {
  const { items } = req.body; // Array of { listingId, startDate, endDate }

  try {
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    const validatedItems = [];
    let cartErrors = [];

    for (const item of items) {
      const listing = await Listing.findById(item.listingId).populate('lister', 'name');
      if (!listing) {
        cartErrors.push(`Listing ID ${item.listingId} not found`);
        continue;
      }

      if (listing.availabilityStatus === 'paused') {
        cartErrors.push(`"${listing.title}" has been paused by the owner`);
        continue;
      }

      // Check date conflicts against listing blocked dates
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      
      const hasConflict = listing.blockedDates.some(blockedDate => {
        const bd = new Date(blockedDate);
        return bd >= start && bd <= end;
      });

      if (hasConflict) {
        cartErrors.push(`"${listing.title}" is already booked/unavailable for the selected dates`);
        continue;
      }

      const days = getRentalDays(start, end);
      const subtotal = days * listing.pricePerDay;
      const serviceFee = Number((subtotal * 0.05).toFixed(2));
      const grandTotal = subtotal + listing.deposit + serviceFee;

      validatedItems.push({
        listingId: listing._id,
        title: listing.title,
        pricePerDay: listing.pricePerDay,
        deposit: listing.deposit,
        days,
        subtotal,
        serviceFee,
        grandTotal,
        startDate: start,
        endDate: end
      });
    }

    res.json({
      valid: cartErrors.length === 0,
      errors: cartErrors,
      items: validatedItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new Booking request and initiate conversation
// @route   POST /api/bookings/request
// @access  Private
router.post('/request', protect, async (req, res) => {
  const { listingId, startDate, endDate, useReferralCredits } = req.body;

  try {
    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ message: 'listingId, startDate, and endDate are required' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.availabilityStatus === 'paused') {
      return res.status(400).json({ message: 'Listing is currently paused' });
    }

    // Check date overlaps
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hasConflict = listing.blockedDates.some(blockedDate => {
      const bd = new Date(blockedDate);
      return bd >= start && bd <= end;
    });

    if (hasConflict) {
      return res.status(400).json({ message: 'Item is not available for chosen dates' });
    }

    if (listing.lister.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot rent your own item' });
    }

    // Calculate rates
    const days = getRentalDays(start, end);
    const subtotal = days * listing.pricePerDay;
    const serviceFee = Number((subtotal * 0.05).toFixed(2));
    
    // Process referral credits discount
    let referralDiscountApplied = 0;
    if (useReferralCredits && req.user.referralCredits > 0) {
      // Limit discount to total subtotal or available credits (max 50 credits per booking)
      const maxDiscount = Math.min(req.user.referralCredits, subtotal, 50);
      referralDiscountApplied = maxDiscount;
      
      // Deduct credits from user
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { referralCredits: -maxDiscount }
      });
    }

    const grandTotal = subtotal + listing.deposit + serviceFee - referralDiscountApplied;

    const booking = await Booking.create({
      listing: listingId,
      renter: req.user._id,
      lister: listing.lister,
      startDate: start,
      endDate: end,
      subtotal,
      deposit: listing.deposit,
      serviceFee,
      referralDiscountApplied,
      grandTotal,
      status: 'pending'
    });

    // P2P Chat Thread Automation: Check if conversation already exists for this user pair + listing
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, listing.lister] },
      associatedListing: listingId
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, listing.lister],
        associatedListing: listingId
      });
    }

    // Post system message in conversation notifying of the request
    const sysMsgText = `System: ${req.user.name} requested to rent "${listing.title}" from ${start.toLocaleDateString()} to ${end.toLocaleDateString()} for a grand total of ${grandTotal} credits (including deposit).`;
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content: sysMsgText,
      type: 'text'
    });

    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    res.status(201).json({
      message: 'Booking request sent successfully.',
      booking,
      conversationId: conversation._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Lister approves or rejects booking
// @route   PUT /api/bookings/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update. Must be "approved" or "rejected".' });
    }

    const booking = await Booking.findById(req.params.id).populate('listing');
    if (!booking) {
      return res.status(404).json({ message: 'Booking request not found' });
    }

    // Verify ownership
    if (booking.lister.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to change status on this booking request' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot change status. Booking is already ${booking.status}` });
    }

    booking.status = status;
    await booking.save();

    // If approved, push dates into listing blocked dates list
    if (status === 'approved') {
      const listing = await Listing.findById(booking.listing._id);
      
      // Block dates from startDate to endDate (inclusive)
      let current = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      while (current <= end) {
        listing.blockedDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      
      await listing.save();
    }

    // Post notification update in associated chat
    const conversation = await Conversation.findOne({
      participants: { $all: [booking.renter, booking.lister] },
      associatedListing: booking.listing._id
    });

    if (conversation) {
      const updateMsgText = `System: Lister ${req.user.name} has ${status} the booking request for "${booking.listing.title}".`;
      const message = await Message.create({
        conversation: conversation._id,
        sender: req.user._id,
        content: updateMsgText,
        type: 'text'
      });
      conversation.lastMessage = message._id;
      conversation.updatedAt = new Date();
      await conversation.save();
    }

    res.json({
      message: `Booking request successfully ${status}`,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get bookings created by the renter (my active rentals)
// @route   GET /api/bookings/my-rentals
// @access  Private
router.get('/my-rentals', protect, async (req, res) => {
  try {
    const rentals = await Booking.find({ renter: req.user._id })
      .populate('listing')
      .populate('lister', 'name email homeCampus')
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get booking requests received by the lister
// @route   GET /api/bookings/my-bookings
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ lister: req.user._id })
      .populate('listing')
      .populate('renter', 'name email homeCampus')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
