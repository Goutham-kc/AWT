import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { executeRazorpayPayment } from '../utils/razorpay';

export const Cart = () => {
  const { cart, user, token, removeFromCart, updateUserCredits, setIsLoginOpen } = useApp();
  const navigate = useNavigate();

  const [useReferralCredits, setUseReferralCredits] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState('idle'); // idle | validating | processing | paying
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // Cart summary calculations
  const subtotalSum = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const depositSum = cart.reduce((sum, item) => sum + item.deposit, 0);
  const serviceFeeSum = cart.reduce((sum, item) => sum + item.serviceFee, 0);

  // Referral discount
  const userCredits = user?.referralCredits || 0;
  const referralDiscount = useReferralCredits 
    ? Math.min(userCredits, subtotalSum, 50) 
    : 0;

  const grandTotal = Math.max(0, subtotalSum + depositSum + serviceFeeSum - referralDiscount);

  const handleMessageLister = async (listingId) => {
    if (!token) {
      setIsLoginOpen(true);
      return;
    }
    try {
      const resListing = await fetch(`/api/listings/${listingId}`);
      if (resListing.ok) {
        const listingData = await resListing.json();
        if (listingData?.lister?._id) {
          const resConv = await fetch('/api/chats/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              recipientId: listingData.lister._id,
              listingId
            })
          });
          const dataConv = await resConv.json();
          if (resConv.ok) {
            navigate('/conversations', { state: { conversationId: dataConv._id } });
            return;
          }
        }
      }
    } catch (err) {
      console.log('Error opening chat from cart:', err);
    }
    navigate('/conversations');
  };

  const handleCheckout = async () => {
    if (!token) {
      setIsLoginOpen(true);
      return;
    }
    setCheckoutStatus('validating');
    setErrorMsg('');

    try {
      // 1. Validate Cart items against blocked dates
      const validateRes = await fetch('/api/bookings/cart/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: cart })
      });
      const validateData = await validateRes.json();
      if (!validateData.valid) {
        throw new Error(validateData.errors ? validateData.errors.join(', ') : 'Cart validation failed');
      }

      setCheckoutStatus('processing');
      let isFirstItem = true;
      const successfulListingIds = [];
      const createdBookingIds = [];
      let lastError = '';

      // 2. Submit Booking Requests to create Booking records
      for (const item of cart) {
        try {
          const res = await fetch('/api/bookings/request', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              listingId: item.listingId,
              startDate: item.startDate,
              endDate: item.endDate,
              useReferralCredits: isFirstItem ? useReferralCredits : false
            })
          });
          const data = await res.json();
          
          if (!res.ok) {
            throw new Error(data.message || 'Failed to request booking');
          }
          successfulListingIds.push(item.listingId);
          if (data.booking?._id) {
            createdBookingIds.push(data.booking._id);
          }
          isFirstItem = false;
        } catch (itemErr) {
          lastError = itemErr.message || 'Failed to request booking for some items';
          break;
        }
      }

      if (createdBookingIds.length === 0) {
        throw new Error(lastError || 'Could not initiate bookings.');
      }

      // Deduct credits locally if used and booking request succeeded
      if (useReferralCredits && successfulListingIds.length > 0) {
        updateUserCredits(Math.max(0, userCredits - referralDiscount));
      }

      // 3. Launch Razorpay Payment for the bookings
      setCheckoutStatus('paying');

      await executeRazorpayPayment({
        token,
        user,
        bookingIds: createdBookingIds,
        amount: grandTotal,
        onSuccess: (verifyData, paymentId, isSimulated) => {
          // Remove successful items from cart
          successfulListingIds.forEach(id => removeFromCart(id));
          setCheckoutStatus('idle');
          setPaymentSuccessData({
            paymentId,
            isSimulated,
            amount: grandTotal
          });
        },
        onError: (err) => {
          setErrorMsg(err.message || 'Payment processing error');
          // Still remove successfully requested bookings from cart
          successfulListingIds.forEach(id => removeFromCart(id));
          setCheckoutStatus('idle');
        },
        onDismiss: () => {
          // Modal dismissed: bookings are created but unpaid
          successfulListingIds.forEach(id => removeFromCart(id));
          setCheckoutStatus('idle');
          alert('Razorpay payment modal closed. Your booking request has been submitted as pending.');
          navigate('/conversations');
        }
      });
    } catch (err) {
      setErrorMsg(err.message || 'Checkout failed');
      setCheckoutStatus('idle');
    }
  };

  if (paymentSuccessData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-container-low min-h-[500px]">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-outline-variant shadow-lg space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          
          <div>
            <h2 className="font-headline text-2xl font-extrabold text-on-surface">Payment Successful!</h2>
            <p className="text-xs text-on-surface-variant mt-1">Processed securely through Razorpay</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid:</span>
              <strong className="text-primary font-bold text-sm">₹{paymentSuccessData.amount}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment ID:</span>
              <span className="font-mono text-slate-700">{paymentSuccessData.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Method:</span>
              <span className="font-semibold text-slate-700">UPI / Razorpay Escrow</span>
            </div>
            {paymentSuccessData.isSimulated && (
              <div className="pt-2 border-t border-slate-200 text-[11px] text-amber-700 font-medium">
                *Demo/Test Payment Verification mode active.
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigate('/conversations')}
              className="w-full py-2.5 bg-primary text-white text-sm rounded-xl hover:bg-primary-container font-bold shadow-sm transition-all cursor-pointer"
            >
              Open Chat to Coordinate Pickup
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-full py-2 border border-slate-300 text-slate-700 text-xs rounded-xl hover:bg-slate-50 font-semibold transition-all cursor-pointer"
            >
              View My Rentals in Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-container-low min-h-[500px]">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <span className="material-symbols-outlined text-5xl text-outline">shopping_cart</span>
          <h3 className="font-headline text-2xl font-bold text-on-surface">Your Cart is Empty</h3>
          <p className="text-on-surface-variant text-sm">Rent textbooks, calculators, cycles, and other campus gear from fellow students.</p>
          <button 
            onClick={() => navigate('/marketplace')} 
            className="px-6 py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-container font-bold shadow-sm transition-all cursor-pointer"
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
      
      {/* Left: Cart Items List */}
      <div className="flex-1 space-y-4">
        <h2 className="font-headline text-2xl font-bold text-primary mb-2">Shopping Cart ({cart.length})</h2>
        
        {errorMsg && (
          <div className="bg-error-container/20 border border-error-red text-error-red p-3 rounded-lg text-sm font-semibold flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="text-xs font-bold underline ml-2">Dismiss</button>
          </div>
        )}

        <div className="space-y-4">
          {cart.map((item) => (
            <div 
              key={item.listingId} 
              className="bg-white p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-primary/50 transition-colors"
            >
              <div>
                <h4 className="font-headline font-bold text-on-surface text-base">{item.title}</h4>
                <p className="text-xs text-outline font-semibold mt-0.5">
                  Dates: {new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()} ({item.days} days)
                </p>
                <div className="flex gap-4 mt-2 text-xs text-on-surface-variant font-semibold">
                  <div>Price: <span className="text-primary font-bold">₹{item.pricePerDay} / day</span></div>
                  <div>Refundable Deposit: <span className="text-primary font-bold">₹{item.deposit}</span></div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-outline-variant">
                <div className="text-right">
                  <div className="text-sm font-semibold text-outline">Subtotal</div>
                  <div className="text-lg font-bold text-primary">₹{item.subtotal}</div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMessageLister(item.listingId)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                    title="Message Lister / Ask Question"
                  >
                    <span className="material-symbols-outlined">forum</span>
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.listingId)} 
                    className="p-2 text-error-red hover:bg-error-container/10 rounded-full transition-colors"
                    title="Remove from Cart"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Order Summary with Razorpay */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm space-y-4 sticky top-[90px]">
          <h3 className="font-headline text-lg font-bold text-on-surface">Order Summary</h3>
          
          <div className="space-y-2 text-sm text-on-surface-variant border-b border-outline-variant pb-4">
            <div className="flex justify-between">
              <span>Rental Subtotal</span>
              <span className="font-semibold">₹{subtotalSum}</span>
            </div>
            <div className="flex justify-between">
              <span>Security Deposit (Refundable)</span>
              <span className="font-semibold">₹{depositSum}</span>
            </div>
            <div className="flex justify-between">
              <span>Campus Service Fees (5%)</span>
              <span className="font-semibold">₹{serviceFeeSum}</span>
            </div>

            {/* Referral Credits toggle */}
            {userCredits > 0 && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="referralToggle"
                    checked={useReferralCredits}
                    onChange={() => setUseReferralCredits(!useReferralCredits)}
                    className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded cursor-pointer"
                  />
                  <label htmlFor="referralToggle" className="text-xs font-bold text-primary cursor-pointer">
                    Apply Referral Credits (₹{userCredits} bal)
                  </label>
                </div>
                {useReferralCredits && (
                  <span className="text-xs font-bold text-green-700">-₹{referralDiscount}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between border-t border-outline-variant pt-2 font-bold text-primary text-xl">
            <span>Grand Total</span>
            <span>₹{grandTotal}</span>
          </div>

          {/* Razorpay Checkout Button */}
          <button 
            onClick={handleCheckout}
            disabled={checkoutStatus !== 'idle'}
            className="w-full py-3 bg-primary text-white text-sm rounded-xl hover:bg-primary-container font-extrabold shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">lock</span>
            {checkoutStatus === 'validating'
              ? 'Validating Items...'
              : checkoutStatus === 'processing'
              ? 'Initiating Bookings...'
              : checkoutStatus === 'paying'
              ? 'Connecting to Razorpay...'
              : `Pay ₹${grandTotal} with Razorpay`}
          </button>

          {/* Razorpay Trust & Payment Methods Strip */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <span className="material-symbols-outlined text-green-600 text-sm">verified_user</span>
              <span>Secured by <strong>Razorpay</strong> Gateway</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-500 font-semibold">
              <span className="px-2 py-0.5 bg-slate-100 rounded">UPI (GPay / PhonePe / Paytm)</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded">Cards</span>
              <span className="px-2 py-0.5 bg-slate-100 rounded">NetBanking</span>
            </div>
          </div>

          <p className="text-[11px] text-outline text-center leading-relaxed">
            *Security deposits are refundable upon verified safe return of item on campus.
          </p>
        </div>
      </div>

    </div>
  );
};
