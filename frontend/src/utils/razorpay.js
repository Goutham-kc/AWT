/**
 * Razorpay Payment Integration Utility
 * Supports live Razorpay Checkout modal (UPI, Cards, NetBanking, Wallets)
 * and seamless fallback verification.
 */

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('[Razorpay] Script loading failed from CDN');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const executeRazorpayPayment = async ({
  token,
  user,
  bookingIds,
  amount,
  onSuccess,
  onError,
  onDismiss
}) => {
  try {
    // 1. Request Order creation from backend
    const res = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bookingIds, amount })
    });
    const orderData = await res.json();
    if (!res.ok) {
      throw new Error(orderData.message || 'Failed to create Razorpay order');
    }

    // 2. Check if running in simulated fallback mode
    if (orderData.isSimulated || !orderData.keyId || orderData.keyId.includes('placeholder')) {
      // Execute simulated test payment verification
      const simPaymentId = `pay_sim_${Date.now()}`;
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: simPaymentId,
          razorpay_signature: 'simulated_test_signature',
          bookingIds,
          isSimulated: true
        })
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.message || 'Simulated verification failed');

      if (onSuccess) onSuccess(verifyData, simPaymentId, true);
      return { success: true, paymentId: simPaymentId, isSimulated: true };
    }

    // 3. Load Razorpay CDN script if not already present
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded || !window.Razorpay) {
      throw new Error('Razorpay SDK could not be loaded. Check your internet connection.');
    }

    // 4. Launch Official Razorpay Checkout Modal
    return new Promise((resolve) => {
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Academica Exchange',
        description: `Campus Equipment Rental Payment (₹${amount})`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        notes: {
          bookingIds: bookingIds.join(',')
        },
        theme: {
          color: '#1e3a8a' // Navy brand theme
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingIds,
                isSimulated: false
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              if (onSuccess) onSuccess(verifyData, response.razorpay_payment_id, false);
              resolve({ success: true, paymentId: response.razorpay_payment_id, isSimulated: false });
            } else {
              const err = new Error(verifyData.message || 'Razorpay signature verification failed');
              if (onError) onError(err);
              resolve({ success: false, error: err.message });
            }
          } catch (verErr) {
            if (onError) onError(verErr);
            resolve({ success: false, error: verErr.message });
          }
        },
        modal: {
          ondismiss: function () {
            if (onDismiss) onDismiss();
            resolve({ success: false, dismissed: true });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        const errorMsg = response.error?.description || 'Payment failed';
        if (onError) onError(new Error(errorMsg));
        resolve({ success: false, error: errorMsg });
      });
      rzp.open();
    });
  } catch (err) {
    if (onError) onError(err);
    throw err;
  }
};
