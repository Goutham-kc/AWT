import mongoose from 'mongoose';
import { io as Client } from 'socket.io-client';
import { server } from '../server.js'; // Starts the server and connects to DB
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const PORT = 5000;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('--- STARTING BACKEND INTEGRATION TESTS ---');
  
  // Wait a short moment to ensure DB connection is ready
  await delay(2000);

  try {
    // 1. Database Cleanup
    console.log('\n[1/10] Cleaning up Database collections...');
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Booking.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    console.log('Database cleaned successfully.');

    // 2. Signup & Verification Flow for Lister (Andrew)
    console.log('\n[2/10] Testing signup & verification for Lister...');
    const listerSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Andrew John',
        email: 'andrew@mit.edu',
        password: 'password123',
        institution: 'MIT',
        homeCampus: 'Main Campus'
      })
    });
    
    const listerSignupData = await listerSignupRes.json();
    if (listerSignupRes.status !== 201) {
      throw new Error(`Lister signup failed: ${listerSignupData.message}`);
    }
    console.log(`Lister signup OK. Received OTP: ${listerSignupData.otp}`);

    const listerVerifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'andrew@mit.edu',
        otp: listerSignupData.otp
      })
    });
    
    const listerVerifyData = await listerVerifyRes.json();
    if (listerVerifyRes.status !== 200) {
      throw new Error(`Lister OTP verification failed: ${listerVerifyData.message}`);
    }
    console.log(`Lister OTP verify OK. Generated referral code: ${listerVerifyData.referralCode}`);
    const listerReferralCode = listerVerifyData.referralCode;

    // 3. Signup Invite with Referral for Renter (Goutham)
    console.log('\n[3/10] Testing signup with Referral Code for Renter...');
    const renterSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Goutham KC',
        email: 'goutham@mit.edu',
        password: 'password456',
        institution: 'MIT',
        homeCampus: 'Main Campus',
        referredBy: listerReferralCode
      })
    });

    const renterSignupData = await renterSignupRes.json();
    if (renterSignupRes.status !== 201) {
      throw new Error(`Renter signup failed: ${renterSignupData.message}`);
    }
    console.log(`Renter signup OK. Received OTP: ${renterSignupData.otp}`);

    const renterVerifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'goutham@mit.edu',
        otp: renterSignupData.otp
      })
    });

    const renterVerifyData = await renterVerifyRes.json();
    if (renterVerifyRes.status !== 200) {
      throw new Error(`Renter OTP verification failed: ${renterVerifyData.message}`);
    }
    console.log(`Renter OTP verify OK. Response: ${renterVerifyData.message}`);

    // 4. Log in users and retrieve JWT tokens
    console.log('\n[4/10] Testing login and JWT generation...');
    
    const listerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'andrew@mit.edu', password: 'password123' })
    });
    const listerLoginData = await listerLoginRes.json();
    const listerToken = listerLoginData.token;
    console.log(`Lister login success. Token: ${listerToken.slice(0, 15)}...`);
    console.log(`Lister starting credits: ${listerLoginData.user.referralCredits} (Should be 50 from referral invite)`);

    const renterLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'goutham@mit.edu', password: 'password456' })
    });
    const renterLoginData = await renterLoginRes.json();
    const renterToken = renterLoginData.token;
    const renterUserId = renterLoginData.user.id;
    console.log(`Renter login success. Token: ${renterToken.slice(0, 15)}...`);
    console.log(`Renter starting credits: ${renterLoginData.user.referralCredits} (Should be 50 from referral signup)`);

    // Verify referral credit totals
    if (listerLoginData.user.referralCredits !== 50 || renterLoginData.user.referralCredits !== 50) {
      throw new Error('Referral credits mismatch. Expected 50 for both.');
    }

    // 5. Listings CRUD (Lister creates a listing)
    console.log('\n[5/10] Testing Listings CRUD...');
    const createListingRes = await fetch(`${BASE_URL}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${listerToken}`
      },
      body: JSON.stringify({
        title: 'Specialized Tarmac SL7',
        description: 'Road cycle in excellent condition. Perfect for campus commuting.',
        category: 'cycles',
        condition: 'Like New',
        pricePerDay: 15,
        deposit: 100,
        imageUrl: 'http://example.com/bike.jpg',
        location: 'Dorm Block B',
        campus: 'Main Campus',
        allowDirectBooking: true
      })
    });
    const listing = await createListingRes.json();
    if (createListingRes.status !== 201) {
      throw new Error(`Failed to create listing: ${listing.message}`);
    }
    console.log(`Listing created successfully: "${listing.title}" (ID: ${listing._id})`);

    // Verify search feed queries
    const getListingsRes = await fetch(`${BASE_URL}/listings?campus=Main&category=cycles`);
    const listings = await getListingsRes.json();
    if (listings.length === 0 || listings[0]._id !== listing._id) {
      throw new Error('Listing search query failed to return created listing');
    }
    console.log(`Search feed verification success. Found ${listings.length} cycle listings on Main Campus.`);

    // 6. Cart Validation
    console.log('\n[6/10] Testing Cart validation...');
    const today = new Date();
    const startDate = new Date(today.setDate(today.getDate() + 1)).toISOString(); // tomorrow
    const endDate = new Date(today.setDate(today.getDate() + 3)).toISOString();   // 3 days later
    
    const cartValRes = await fetch(`${BASE_URL}/bookings/cart/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${renterToken}`
      },
      body: JSON.stringify({
        items: [{ listingId: listing._id, startDate, endDate }]
      })
    });
    const cartValData = await cartValRes.json();
    if (!cartValData.valid) {
      throw new Error(`Cart validation failed: ${cartValData.errors.join(', ')}`);
    }
    console.log('Cart validation passed successfully. Cost summary computed:');
    console.log(`  Days: ${cartValData.items[0].days}, Subtotal: ${cartValData.items[0].subtotal}, Deposit: ${cartValData.items[0].deposit}`);

    // 7. Booking Request with Referral credits applied
    console.log('\n[7/10] Testing Booking Request with Referral credits...');
    const bookingReqRes = await fetch(`${BASE_URL}/bookings/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${renterToken}`
      },
      body: JSON.stringify({
        listingId: listing._id,
        startDate,
        endDate,
        useReferralCredits: true
      })
    });
    const bookingReqData = await bookingReqRes.json();
    if (bookingReqRes.status !== 201) {
      throw new Error(`Booking request failed: ${bookingReqData.message}`);
    }
    console.log(`Booking request successful.`);
    console.log(`  Subtotal: ${bookingReqData.booking.subtotal}`);
    console.log(`  Discount applied: ${bookingReqData.booking.referralDiscountApplied} credits`);
    console.log(`  Grand Total: ${bookingReqData.booking.grandTotal}`);
    console.log(`  Auto-created Conversation ID: ${bookingReqData.conversationId}`);

    const bookingId = bookingReqData.booking._id;
    const conversationId = bookingReqData.conversationId;

    // Verify renter's referral credits deducted
    const renterProfileRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${renterToken}` }
    });
    const renterProfile = await renterProfileRes.json();
    console.log(`Renter credits after booking discount: ${renterProfile.referralCredits} (Reduced by discount value)`);

    // 8. Lister Approves Booking & Blocks Calendar dates
    console.log('\n[8/10] Testing Lister approval & date blocking...');
    const approveRes = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${listerToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    const approveData = await approveRes.json();
    if (approveRes.status !== 200) {
      throw new Error(`Lister booking approval failed: ${approveData.message}`);
    }
    console.log('Booking request approved.');

    // Verify listing dates are now blocked
    const updatedListingRes = await fetch(`${BASE_URL}/listings/${listing._id}`);
    const updatedListing = await updatedListingRes.json();
    console.log(`Blocked calendar dates count: ${updatedListing.blockedDates.length} days (Successfully updated)`);
    if (updatedListing.blockedDates.length === 0) {
      throw new Error('Listing blocked dates were not updated on approval');
    }

    // 9. Fetch Rentals & Booking Dashboards
    console.log('\n[9/10] Testing Rentals & Booking Dashboard listings...');
    const myRentalsRes = await fetch(`${BASE_URL}/bookings/my-rentals`, {
      headers: { 'Authorization': `Bearer ${renterToken}` }
    });
    const rentals = await myRentalsRes.json();
    console.log(`Renter rentals dashboard contains: ${rentals.length} bookings`);

    const myBookingsRes = await fetch(`${BASE_URL}/bookings/my-bookings`, {
      headers: { 'Authorization': `Bearer ${listerToken}` }
    });
    const bookingsList = await myBookingsRes.json();
    console.log(`Lister bookings dashboard contains: ${bookingsList.length} requests`);

    // Verify Chat History log retrieval
    const messagesRes = await fetch(`${BASE_URL}/chats/conversations/${conversationId}/messages`, {
      headers: { 'Authorization': `Bearer ${renterToken}` }
    });
    const messages = await messagesRes.json();
    console.log(`Conversation log contains: ${messages.length} messages`);
    messages.forEach(m => console.log(`  [${m.sender.name}]: ${m.content}`));

    // 10. WebSockets Socket.io Messaging Loop
    console.log('\n[10/10] Testing WebSockets (Socket.io) chat loops...');
    const socketClient = Client(`http://127.0.0.1:${PORT}`);
    
    await new Promise((resolve, reject) => {
      // Setup timeout failure
      const timeout = setTimeout(() => {
        socketClient.disconnect();
        reject(new Error('Socket.io message loop timed out'));
      }, 5000);

      socketClient.on('connect', () => {
        console.log('Socket client connected successfully.');
        socketClient.emit('register_user', renterUserId);
        socketClient.emit('join_conversation', conversationId);
        
        // Send a test socket message
        socketClient.emit('send_message', {
          conversationId,
          senderId: renterUserId,
          content: 'Hello, let\'s coordinate the cycle pickup at Dorm B tomorrow morning!',
          type: 'text'
        });
      });

      socketClient.on('new_message', (msg) => {
        console.log(`Socket received 'new_message' event!`);
        console.log(`  Sender: ${msg.sender.name}`);
        console.log(`  Content: "${msg.content}"`);
        
        if (msg.content.includes('coordinate the cycle pickup')) {
          clearTimeout(timeout);
          socketClient.disconnect();
          resolve();
        }
      });

      socketClient.on('error', (err) => {
        clearTimeout(timeout);
        socketClient.disconnect();
        reject(new Error(`Socket emitted error: ${err.message}`));
      });
    });

    console.log('\nWebSockets loop test PASSED.');
    console.log('\n=== ALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY ===');
    
    // Close connections and shut down server
    await mongoose.connection.close();
    server.close(() => {
      console.log('Server terminated clean. Exiting test script.');
      process.exit(0);
    });

  } catch (error) {
    console.error('\n❌ INTEGRATION TEST FAILED:');
    console.error(error);
    await mongoose.connection.close();
    server.close(() => {
      process.exit(1);
    });
  }
}

runTests();
