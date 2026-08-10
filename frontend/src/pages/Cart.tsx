import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Cart: React.FC = () => {
  const { cart, user, token, removeFromCart, updateUserCredits } = useApp();
  const navigate = useNavigate();

  const [useReferralCredits, setUseReferralCredits] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'validating' | 'processing'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Cart summary calculations
  const subtotalSum = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const depositSum = cart.reduce((sum, item) => sum + item.deposit, 0);
  const serviceFeeSum = cart.reduce((sum, item) => sum + item.serviceFee, 0);

  // Referral discount
  const userCredits = user?.referralCredits || 0;
  const referralDiscount = useReferralCredits 
    ? Math.min(userCredits, subtotalSum, 50) 
    : 0;

  const grandTotal = subtotalSum + depositSum + serviceFeeSum - referralDiscount;

  const handleCheckout = async () => {
    if (!token) return;
    setCheckoutStatus('validating');
    setErrorMsg('');

    try {
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
      const successfulListings: string[] = [];
      let lastError = '';

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
          successfulListings.push(item.listingId);
          isFirstItem = false;
        } catch (itemErr: any) {
          lastError = itemErr.message || 'Failed to request booking for some items';
          break; // Stop further processing if one fails
        }
      }

      // Deduct credits locally if used and at least one booking succeeded
      if (useReferralCredits && successfulListings.length > 0) {
        updateUserCredits(Math.max(0, userCredits - referralDiscount));
      }

      // Remove successful items from cart
      successfulListings.forEach(id => removeFromCart(id));

      if (lastError) {
        throw new Error(lastError);
      } else {
        alert('Booking requests sent successfully! Redirecting to messages to coordinate pickup.');
        navigate('/conversations');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Checkout failed');
    } finally {
      setCheckoutStatus('idle');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-container-low">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <span className="material-symbols-outlined text-5xl text-outline">shopping_cart</span>
          <h3 className="font-headline text-2xl font-bold text-on-surface">Your Cart is Empty</h3>
          <p className="text-on-surface-variant text-sm">Rent textbooks, calculators, cycles, and other campus gears from fellow students.</p>
          <button 
            onClick={() => navigate('/marketplace')} 
            className="px-6 py-2.5 bg-primary text-white font-label-md text-label-md rounded-lg hover:bg-primary-container font-bold shadow-sm transition-all"
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-container-margin py-stack-lg flex flex-col lg:flex-row gap-stack-lg">
      
      {/* Left: Cart Items List */}
      <div className="flex-1 space-y-stack-md">
        <h2 className="font-headline text-2xl font-bold text-primary mb-2">Shopping Cart</h2>
        
        {errorMsg && (
          <div className="bg-error-container/20 border border-error-red text-error-red p-3 rounded-lg text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          {cart.map((item) => (
            <div 
              key={item.listingId} 
              className="bg-white p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
            >
              <div>
                <h4 className="font-headline font-bold text-on-surface text-base">{item.title}</h4>
                <p className="text-xs text-outline font-semibold mt-0.5">
                  Dates: {new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()} ({item.days} days)
                </p>
                <div className="flex gap-4 mt-2 text-xs text-on-surface-variant font-semibold">
                  <div>Price: <span className="text-primary">{item.pricePerDay} credits/day</span></div>
                  <div>Deposit: <span className="text-primary">{item.deposit} credits</span></div>
                </div>
              </div>

              <div className="flex items-center gap-stack-md w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-outline-variant">
                <div className="text-right">
                  <div className="text-sm font-semibold text-outline">Subtotal</div>
                  <div className="text-lg font-bold text-primary">{item.subtotal} credits</div>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.listingId)} 
                  className="p-2 text-error-red hover:bg-error-container/10 rounded-full transition-colors"
                  title="Remove from Cart"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Order Summary */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm space-y-4 sticky top-[90px]">
          <h3 className="font-headline text-lg font-bold text-on-surface">Order Summary</h3>
          
          <div className="space-y-2 text-sm text-on-surface-variant border-b border-outline-variant pb-4">
            <div className="flex justify-between">
              <span>Rental Subtotal</span>
              <span>{subtotalSum} credits</span>
            </div>
            <div className="flex justify-between">
              <span>Security Deposits</span>
              <span>{depositSum} credits</span>
            </div>
            <div className="flex justify-between">
              <span>Campus Service Fees (5%)</span>
              <span>{serviceFeeSum} credits</span>
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
                    className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded"
                  />
                  <label htmlFor="referralToggle" className="text-xs font-bold text-primary cursor-pointer">
                    Apply Referral Credits (Bal: {userCredits})
                  </label>
                </div>
                {useReferralCredits && (
                  <span className="text-xs font-bold text-success-green">-{referralDiscount} credits</span>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between border-t border-outline-variant pt-2 font-bold text-primary text-lg">
            <span>Grand Total</span>
            <span>{grandTotal} credits</span>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={checkoutStatus !== 'idle'}
            className="w-full py-2.5 bg-primary text-white font-label-md text-label-md rounded-lg hover:bg-primary-container font-bold shadow-sm transition-all disabled:opacity-50"
          >
            {checkoutStatus === 'validating' ? 'Validating...' : checkoutStatus === 'processing' ? 'Processing...' : 'Request Booking'}
          </button>

          <p className="text-[11px] text-outline text-center">
            *Rental requests do not charge credits immediately. Lister must approve before rental transaction is booked.
          </p>
        </div>
      </div>

    </div>
  );
};
