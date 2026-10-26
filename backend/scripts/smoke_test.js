const BASE_URL = 'http://127.0.0.1:5000';

const runSmokeTest = async () => {
  console.log('====================================================');
  console.log('  ACADEMICA EXCHANGE — END-TO-END WORKFLOW SMOKE TEST');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      process.stdout.write(`• Testing: ${name}... `);
      await fn();
      console.log('✓ PASS');
      passed++;
    } catch (err) {
      console.log(`✗ FAIL: ${err.message}`);
      failed++;
    }
  };

  // State across tests
  let renterToken = null;
  let listerToken = null;
  let testListingId = null;
  let testBookingId = null;
  let testConversationId = null;

  const timestamp = Date.now();
  const renterEmail = `smoke.renter.${timestamp}@tkmce.ac.in`;
  const listerEmail = `smoke.lister.${timestamp}@tkmce.ac.in`;

  // 1. Health check
  await test('Server Health Check (GET /health)', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.status !== 200 || data.status !== 'ok') {
      throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
    }
  });

  // 2. Public listings retrieval
  await test('Get Public Listings (GET /api/listings)', async () => {
    const res = await fetch(`${BASE_URL}/api/listings`);
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('Expected array of listings');
    }
    if (data.length > 0) {
      testListingId = data[0]._id;
    }
  });

  // 3. User Registration (Renter)
  await test('Renter Signup (POST /api/auth/signup)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Smoke Test Renter',
        email: renterEmail,
        password: 'password123',
        institution: 'TKM College of Engineering',
        homeCampus: 'TKMCE Kollam'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');
  });

  // 4. User Registration (Lister)
  await test('Lister Signup (POST /api/auth/signup)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Smoke Test Lister',
        email: listerEmail,
        password: 'password123',
        institution: 'TKM College of Engineering',
        homeCampus: 'TKMCE Kollam'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');
  });

  // 5. Query OTP from DB and Verify for Renter
  await test('Verify Renter OTP & Auto-Login (POST /api/auth/verify-otp)', async () => {
    // We can use a node script to fetch the pending OTP directly or via seed helper
    // In our auth controller, let's verify via verify-otp
    const mongoose = (await import('mongoose')).default;
    await mongoose.connect('mongodb://127.0.0.1:27017/student_rental');
    const User = (await import('../models/User.js')).default;
    const rUser = await User.findOne({ email: renterEmail });
    if (!rUser || !rUser.verificationOTP) throw new Error('OTP not generated in DB');

    const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: renterEmail,
        otp: rUser.verificationOTP
      })
    });
    const data = await res.json();
    if (!res.ok || !data.token) throw new Error(data.message || 'Verification failed');
    renterToken = data.token;

    // Verify Lister too
    const lUser = await User.findOne({ email: listerEmail });
    const resL = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: listerEmail,
        otp: lUser.verificationOTP
      })
    });
    const dataL = await resL.json();
    listerToken = dataL.token;
    await mongoose.disconnect();
  });

  // 6. Profile fetching & updating
  await test('Get & Update Profile (GET & PUT /api/auth/profile)', async () => {
    const getRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${renterToken}` }
    });
    const profile = await getRes.json();
    if (!getRes.ok || profile.email !== renterEmail) throw new Error('Failed to get profile');

    const putRes = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${renterToken}`
      },
      body: JSON.stringify({
        name: 'Smoke Test Renter Updated',
        bio: 'ECE Student at TKMCE',
        phone: '9876543210'
      })
    });
    const updated = await putRes.json();
    if (!putRes.ok || updated.user.name !== 'Smoke Test Renter Updated') {
      throw new Error(updated.message || 'Failed to update profile');
    }
  });

  // 7. Lister creates a new listing with payment options
  await test('Create New Listing with Payment Method (POST /api/listings)', async () => {
    const res = await fetch(`${BASE_URL}/api/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${listerToken}`
      },
      body: JSON.stringify({
        title: `Smoke Test Arduino Kit ${timestamp}`,
        description: 'Complete Arduino Uno starter kit with sensors and breadboard',
        category: 'electronics',
        condition: 'Like New',
        pricePerDay: 25,
        deposit: 150,
        imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600',
        location: 'Electronics Block 2nd Floor',
        campus: 'TKMCE Kollam',
        allowDirectBooking: true,
        paymentMethod: 'UPI',
        paymentDetails: 'lister@okhdfcbank'
      })
    });
    const data = await res.json();
    if (!res.ok || !data._id) throw new Error(data.message || 'Failed to create listing');
    testListingId = data._id;
  });

  // 8. Lister checks their own listings
  await test('Get Lister Owned Listings (GET /api/listings/mine)', async () => {
    const res = await fetch(`${BASE_URL}/api/listings/mine`, {
      headers: { 'Authorization': `Bearer ${listerToken}` }
    });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data) || data.length === 0) {
      throw new Error('Mine listings returned empty or invalid');
    }
  });

  // 9. Cart Validation
  await test('Validate Cart Items (POST /api/bookings/cart/validate)', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings/cart/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${renterToken}`
      },
      body: JSON.stringify({
        items: [{
          listingId: testListingId,
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 86400000 * 3).toISOString()
        }]
      })
    });
    const data = await res.json();
    if (!res.ok || !data.valid) throw new Error(data.errors?.join(', ') || 'Cart validation failed');
  });

  // 10. Booking Request & P2P Thread creation
  await test('Create Booking Request & P2P Thread (POST /api/bookings/request)', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${renterToken}`
      },
      body: JSON.stringify({
        listingId: testListingId,
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 3).toISOString()
      })
    });
    const data = await res.json();
    if (!res.ok || !data.booking) throw new Error(data.message || 'Booking request failed');
    testBookingId = data.booking._id;
    testConversationId = data.conversationId;
  });

  // 11. Razorpay Order Creation
  await test('Create Razorpay Order (POST /api/payments/create-order)', async () => {
    const res = await fetch(`${BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${renterToken}`
      },
      body: JSON.stringify({
        bookingIds: [testBookingId],
        amount: 228.75
      })
    });
    const data = await res.json();
    if (!res.ok || !data.orderId) throw new Error(data.message || 'Razorpay order creation failed');
  });

  // 12. Razorpay Payment Verification
  await test('Verify Razorpay Payment (POST /api/payments/verify)', async () => {
    const res = await fetch(`${BASE_URL}/api/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${renterToken}`
      },
      body: JSON.stringify({
        razorpay_order_id: `order_test_${timestamp}`,
        razorpay_payment_id: `pay_test_${timestamp}`,
        razorpay_signature: 'simulated_sig',
        bookingIds: [testBookingId],
        isSimulated: true
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Payment verification failed');
  });

  // 13. Lister Approves Booking
  await test('Lister Approves Booking (PUT /api/bookings/:id/status)', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings/${testBookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${listerToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    const data = await res.json();
    if (!res.ok || data.booking?.status !== 'approved') {
      throw new Error(data.message || 'Approval failed');
    }
  });

  // 14. P2P Messaging
  await test('Send & Receive P2P Chat Messages (POST & GET /api/chats)', async () => {
    // Send message as renter
    const sendRes = await fetch(`${BASE_URL}/api/chats/conversations/${testConversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${renterToken}`
      },
      body: JSON.stringify({
        content: 'Hi! I have completed the payment via Razorpay. Can we meet at the Central Library Lobby?'
      })
    });
    const sendData = await sendRes.json();
    if (!sendRes.ok || !sendData.content) throw new Error('Failed to send message');

    // Retrieve messages as lister
    const getRes = await fetch(`${BASE_URL}/api/chats/conversations/${testConversationId}/messages`, {
      headers: { 'Authorization': `Bearer ${listerToken}` }
    });
    const messages = await getRes.json();
    if (!getRes.ok || !Array.isArray(messages) || messages.length < 2) {
      throw new Error('Failed to retrieve messages list');
    }
  });

  // 15. Referrals Summary
  await test('Referral Tracking Summary (GET /api/referrals/summary)', async () => {
    const res = await fetch(`${BASE_URL}/api/referrals/summary`, {
      headers: { 'Authorization': `Bearer ${renterToken}` }
    });
    const data = await res.json();
    if (!res.ok || data.referralCredits === undefined) {
      throw new Error('Failed to get referral summary');
    }
  });

  // 16. Mutual Trust Score Review: Buyer rates Seller
  await test('Buyer Rates Seller Satisfaction & Updates Lister Trust Score (POST /api/bookings/:id/rate)', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings/${testBookingId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${renterToken}`
      },
      body: JSON.stringify({
        satisfied: true,
        rating: 5,
        feedback: 'Item was in mint condition, seller was on time at library!'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Rating failed');
    if (data.newTrustScore !== 55) {
      throw new Error(`Expected lister trust score 55, got ${data.newTrustScore}`);
    }
  });

  // 17. Mutual Trust Score Review: Seller rates Buyer
  await test('Seller Rates Buyer Satisfaction & Updates Renter Trust Score (POST /api/bookings/:id/rate)', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings/${testBookingId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${listerToken}`
      },
      body: JSON.stringify({
        satisfied: true,
        rating: 5,
        feedback: 'Responsible borrower, returned gear cleanly.'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Rating failed');
    if (data.newTrustScore !== 55) {
      throw new Error(`Expected renter trust score 55, got ${data.newTrustScore}`);
    }
  });

  // 18. Duplicate Rating Prevention
  await test('Prevent Duplicate Rating on Same Exchange (POST /api/bookings/:id/rate)', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings/${testBookingId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${renterToken}`
      },
      body: JSON.stringify({
        satisfied: true,
        rating: 5
      })
    });
    if (res.status !== 400) {
      throw new Error(`Expected status 400 for duplicate rating, received ${res.status}`);
    }
  });

  // 19. Verify Updated User Profile Trust Scores (GET /api/auth/me)
  await test('Verify Updated User Trust Scores in /api/auth/me', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${renterToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to fetch renter profile');
    if (data.trustScore !== 55 || data.positiveRatingsCount !== 1 || data.completedRentalsAsRenter !== 1) {
      throw new Error(`Unexpected renter metrics: trustScore=${data.trustScore}, positiveRatingsCount=${data.positiveRatingsCount}`);
    }
  });

  console.log('\n====================================================');
  console.log(`  SMOKE TEST COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');
  process.exit(failed > 0 ? 1 : 0);
};

runSmokeTest().catch(err => {
  console.error('Fatal Smoke Test Error:', err);
  process.exit(1);
});
