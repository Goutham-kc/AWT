import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const MyProfile = () => {
  const { user, token, updateUser, setIsLoginOpen } = useApp();
  const navigate = useNavigate();

  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [myListings, setMyListings] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingBio, setSavingBio] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // 1. Fetch user's listings
        const resListings = await fetch('/api/listings/mine', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resListings.ok) {
          const listingsData = await resListings.json();
          setMyListings(Array.isArray(listingsData) ? listingsData : []);
        }

        // 2. Fetch user's active rentals (items rented from others)
        const resRentals = await fetch('/api/bookings/my-rentals', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resRentals.ok) {
          const rentalsData = await resRentals.json();
          setMyRentals(Array.isArray(rentalsData) ? rentalsData : []);
        }

        // 3. Fetch booking requests received (items others want to rent from user)
        const resBookings = await fetch('/api/bookings/my-bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resBookings.ok) {
          const bookingsData = await resBookings.json();
          setMyBookings(Array.isArray(bookingsData) ? bookingsData : []);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token]);

  const handleSaveBio = async () => {
    if (!token) return;
    setSavingBio(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio, phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      updateUser({ bio: data.user.bio, phone: data.user.phone });
      showToast('Profile bio updated successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to save bio');
    } finally {
      setSavingBio(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to remove this listing?')) return;
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMyListings(prev => prev.filter(l => l._id !== listingId));
        showToast('Listing removed successfully');
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to delete listing');
      }
    } catch (err) {
      showToast('Error removing listing');
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        setMyBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status } : b));
        showToast(`Booking request ${status}!`);
      } else {
        showToast(data.message || `Failed to ${status} request`);
      }
    } catch (err) {
      showToast(`Error updating booking`);
    }
  };

  if (!token) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-container-low min-h-[500px]">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-outline-variant shadow-sm space-y-4">
          <span className="material-symbols-outlined text-5xl text-primary">account_circle</span>
          <h2 className="text-2xl font-bold text-on-surface">Please Log In</h2>
          <p className="text-sm text-on-surface-variant">Log in with your verified college email to view and manage your profile.</p>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-container shadow-sm transition-all cursor-pointer"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-grow bg-slate-50 text-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Header Banner */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="relative h-40 bg-gradient-to-r from-primary to-primary-container">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="relative -mt-16 flex flex-col md:flex-row gap-6 items-start">
              
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-primary/10 border-4 border-white shadow-md flex items-center justify-center text-primary font-bold text-4xl uppercase">
                  {user?.name ? user.name.slice(0, 2) : 'ST'}
                </div>
                <div 
                  className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow"
                  title="Institutional Email Verified"
                >
                  <span className="material-symbols-outlined text-sm font-bold">check</span>
                </div>
              </div>

              {/* Main Bio & Stats */}
              <div className="flex-grow pt-2 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                      {user?.name || 'Verified Student'}
                      <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        Verified Student
                      </span>
                    </h1>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <span className="material-symbols-outlined text-base text-primary">school</span>
                        {user?.institution || 'TKM College of Engineering'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base text-slate-400">mail</span>
                        {user?.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to="/settings"
                      className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-sm font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">settings</span>
                      Settings
                    </Link>
                    <Link
                      to="/create-listing"
                      className="px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary-container text-sm font-bold shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      List Item
                    </Link>
                  </div>
                </div>

                {/* Score & Referral Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-100 text-center">
                    <p className="text-2xl font-bold text-primary">{myListings.length}</p>
                    <p className="text-xs text-slate-600 font-medium uppercase tracking-wider mt-0.5">Active Listings</p>
                  </div>
                  <div className="bg-green-50/80 p-3.5 rounded-xl border border-green-100 text-center">
                    <p className="text-2xl font-bold text-green-700">₹{user?.referralCredits || 0}</p>
                    <p className="text-xs text-slate-600 font-medium uppercase tracking-wider mt-0.5">Referral Credits</p>
                  </div>
                  <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-100 text-center">
                    <p className="text-2xl font-bold text-amber-600">{myRentals.length}</p>
                    <p className="text-xs text-slate-600 font-medium uppercase tracking-wider mt-0.5">Active Rentals</p>
                  </div>
                  <div className="bg-purple-50/80 p-3.5 rounded-xl border border-purple-100 text-center">
                    <p className="text-2xl font-bold text-purple-700">100%</p>
                    <p className="text-xs text-slate-600 font-medium uppercase tracking-wider mt-0.5">Campus Trust</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* 2 Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2 Cols wide on desktop): Bio & Listings */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Bio Editor */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">edit_note</span>
                  Public Campus Bio
                </h2>
                <span className="text-xs text-slate-500">Visible to other students</span>
              </div>
              
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell fellow students what you study, what gear you share (cameras, calculators, cycles), or preferred meetup spots on campus..."
                className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm leading-relaxed"
                rows="3"
              />

              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-slate-500">
                  {user?.referralCode && (
                    <span>Referral Code: <strong className="text-primary font-mono">{user.referralCode}</strong></span>
                  )}
                </div>
                <button
                  onClick={handleSaveBio}
                  disabled={savingBio}
                  className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-container transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {savingBio ? 'Saving...' : 'Save Bio'}
                </button>
              </div>
            </section>

            {/* My Active Listings */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">inventory_2</span>
                    My Listings ({myListings.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Gears and items you are currently sharing with classmates</p>
                </div>
                <Link
                  to="/create-listing"
                  className="text-sm text-primary font-bold hover:underline flex items-center gap-1"
                >
                  + Add New
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-8 text-slate-400">Loading your listings...</div>
              ) : myListings.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl p-6">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">post_add</span>
                  <p className="text-sm font-semibold text-slate-600">You haven't listed any items yet.</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Share textbooks, electronics, cycles, or dorm items to earn cash.</p>
                  <Link
                    to="/create-listing"
                    className="inline-block px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container"
                  >
                    Create Your First Listing
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myListings.map((item) => (
                    <div
                      key={item._id}
                      className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <img
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold bg-white/90 text-primary capitalize shadow-sm">
                          {item.category}
                        </span>
                      </div>
                      
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="font-bold text-primary text-sm">
                            ₹{item.pricePerDay} <span className="text-xs font-normal text-slate-500">/ day</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/listing/${item._id}`}
                              className="text-xs text-primary font-semibold hover:underline"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDeleteListing(item._id)}
                              className="text-xs text-red-500 font-semibold hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Received Booking Requests (For my listings) */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">inbox</span>
                Rental Requests Received ({myBookings.length})
              </h2>
              <p className="text-xs text-slate-500 mb-6">Booking requests made by other students for your shared items</p>

              {myBookings.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  No rental requests received yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.map((req) => (
                    <div
                      key={req._id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {req.renter?.name || 'Classmate'} requested "{req.listing?.title || 'Your Gear'}"
                          </h4>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            req.status === 'approved' ? 'bg-green-100 text-green-800' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Dates: {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()} • Total: <strong className="text-primary font-bold">₹{req.grandTotal}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleBookingStatus(req._id, 'approved')}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleBookingStatus(req._id, 'rejected')}
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <Link
                            to="/conversations"
                            className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg"
                          >
                            Open Chat
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Right Column: Account Trust & Quick Navigation */}
          <div className="space-y-6">
            
            {/* Student Trust Card */}
            <section className="bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-bold">Trust Verified</span>
              </div>
              
              <h3 className="font-bold text-xl mb-1">Campus Verification</h3>
              <p className="text-xs text-white/90 leading-relaxed mb-4">
                Your account is confirmed via institutional credentials at <strong>{user?.institution || 'TKMCE'}</strong>. All transactions are protected by peer escrow security.
              </p>

              <div className="space-y-2 border-t border-white/20 pt-4 text-xs">
                <div className="flex justify-between items-center">
                  <span>Student Domain:</span>
                  <span className="font-mono font-bold">@tkmce.ac.in</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Campus Meetups:</span>
                  <span className="font-bold">Designated Safe Zones</span>
                </div>
              </div>

              <Link
                to="/student-trust"
                className="mt-5 block text-center py-2 px-4 bg-white text-primary text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Learn About Student Trust & Safety
              </Link>
            </section>

            {/* Referral Credits Summary */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600">redeem</span>
                  Referral Rewards
                </h3>
                <span className="text-green-700 font-bold text-lg">₹{user?.referralCredits || 0}</span>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Invite classmates to join Academica Exchange. You both earn ₹50 credits when they verify!
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500 font-medium">Your Code:</span>
                <span className="font-mono font-bold text-primary text-sm">{user?.referralCode || 'N/A'}</span>
              </div>
              <Link
                to="/referrals"
                className="block text-center w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Manage Referrals
              </Link>
            </section>

            {/* Quick Actions */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Quick Navigation</h3>
              <Link
                to="/conversations"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">forum</span>
                  Direct Messages
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward_ios</span>
              </Link>
              <Link
                to="/cart"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">shopping_cart</span>
                  My Cart
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward_ios</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">tune</span>
                  Account & Password Settings
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward_ios</span>
              </Link>
            </section>

          </div>

        </div>

      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl z-50 text-sm font-semibold animate-in fade-in">
          {toastMsg}
        </div>
      )}
    </main>
  );
};

export default MyProfile;