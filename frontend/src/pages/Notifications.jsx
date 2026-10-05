import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';


export const Notifications = () => {
  const { token, user } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateDynamicNotifications = async () => {
      if (!token || !user) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      try {
        const tempNotifications = [];

        // 1. Fetch rentals dashboard (Bookings)
        const resRentals = await fetch('/api/bookings/my-rentals', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const rentals = await resRentals.json();
        if (resRentals.ok && Array.isArray(rentals)) {
          rentals.forEach((rental, idx) => {
            tempNotifications.push({
              id: `rent-${rental._id || idx}`,
              type: 'booking',
              title: rental.status === 'approved' ? 'Rental Request Approved' : 'Rental Request Pending',
              content: `Your rental request for "${rental.listing?.title || 'Gear'}" from ${new Date(rental.startDate).toLocaleDateString()} is ${rental.status}.`,
              time: new Date(rental.updatedAt || rental.createdAt).toLocaleDateString(),
              unread: rental.status === 'approved',
              link: '/conversations'
            });
          });
        }

        // 2. Fetch booking requests received (Bookings)
        const resBookings = await fetch('/api/bookings/my-bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const bookings = await resBookings.json();
        if (resBookings.ok && Array.isArray(bookings)) {
          bookings.forEach((booking, idx) => {
            if (booking.status === 'pending') {
              tempNotifications.push({
                id: `book-${booking._id || idx}`,
                bookingId: booking._id,
                isActionable: true,
                type: 'booking',
                title: 'New Booking Request Received',
                content: `${booking.renter?.name || 'Classmate'} requested to rent your "${booking.listing?.title || 'Item'}" from ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()} (Total: ₹${booking.grandTotal}).`,
                time: new Date(booking.createdAt).toLocaleDateString(),
                unread: true,
                link: '/conversations'
              });
            }
          });
        }

        // 3. Fetch referrals log
        const resReferrals = await fetch('/api/referrals/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const referrals = await resReferrals.json();
        if (resReferrals.ok && referrals.invitees && Array.isArray(referrals.invitees)) {
          referrals.invitees.forEach((invitee, idx) => {
            tempNotifications.push({
              id: `ref-${idx}`,
              type: 'referral',
              title: 'Referral Sign-Up Registered',
              content: `${invitee.name} registered using your code. ${invitee.isVerified ? '50 credits have been added to your balance.' : 'Pending email verification.'}`,
              time: new Date(invitee.joinedAt).toLocaleDateString(),
              unread: invitee.isVerified,
              link: '/referrals'
            });
          });
        }

        // 4. Fallback default system notification
        tempNotifications.push({
          id: 'sys-verify',
          type: 'system',
          title: 'Account Verified',
          content: `Welcome to Academica Exchange! Your institutional account is active and verified.`,
          time: 'Today',
          unread: false,
          link: '/marketplace'
        });

        // Sort notifications, then normal sequence
        tempNotifications.sort((a, b) => (a.unread === b.unread ? 0 : a.unread ? -1 : 1));
        setNotifications(tempNotifications);
      } catch (err) {
        console.error('Failed to generate notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    generateDynamicNotifications();
  }, [token, user]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleBookingAction = async (e, notifId, bookingId, status) => {
    e.stopPropagation();
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
        setNotifications(prev => prev.map(n => {
          if (n.id === notifId) {
            return {
              ...n,
              isActionable: false,
              title: `Rental Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
              content: `You ${status} this rental request.`,
              unread: false
            };
          }
          return n;
        }));
      } else {
        alert(data.message || `Failed to ${status} booking`);
      }
    } catch (err) {
      alert(`Error updating booking`);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col min-h-[500px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface mb-2">Notifications</h1>
          <p className="text-on-surface-variant text-sm">Stay updated on your rentals, messages, and campus activity.</p>
        </div>
        
        {notifications.some(n => n.unread) && (
          <button 
            onClick={handleMarkAllRead}
            className="text-sm text-primary hover:text-primary-container transition-colors py-2 px-4 rounded-lg bg-white border border-outline-variant hover:bg-surface-container-low self-start md:self-auto font-semibold shadow-sm cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filters Strip */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: 'all', label: 'All' },
          { key: 'message', label: 'Messages' },
          { key: 'booking', label: 'Bookings' },
          { key: 'referral', label: 'Referrals' }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filter === item.key 
                ? 'bg-primary text-white font-bold shadow-sm' 
                : 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container-low'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="text-center py-12 text-outline">Loading notifications...</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-outline-variant p-6">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">notifications_off</span>
          <p className="text-on-surface-variant font-semibold">No notifications in this filter.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => navigate(notif.link)}
              className={`relative bg-white p-5 rounded-xl border border-outline-variant transition-all hover:border-primary cursor-pointer shadow-sm flex flex-col sm:flex-row gap-4 items-start ${
                notif.unread ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              {/* Type Icons */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                notif.type === 'booking' ? 'bg-primary/10 text-primary' :
                notif.type === 'referral' ? 'bg-secondary/10 text-secondary' :
                notif.type === 'message' ? 'bg-energy-orange/10 text-energy-orange' :
                'bg-surface-dim text-on-surface-variant'
              }`}>
                <span className="material-symbols-outlined">
                  {notif.type === 'booking' ? 'event_available' :
                   notif.type === 'referral' ? 'redeem' :
                   notif.type === 'message' ? 'chat' :
                   'verified_user'}
                </span>
              </div>

              <div className="flex-grow w-full">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="font-headline font-bold text-sm text-on-surface">{notif.title}</h3>
                  <span className="text-xs text-outline font-semibold">{notif.time}</span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{notif.content}</p>

                {/* Inline Action Buttons for Pending Booking Requests */}
                {notif.isActionable && notif.bookingId && (
                  <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={(e) => handleBookingAction(e, notif.id, notif.bookingId, 'approved')}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-colors"
                    >
                      Approve Rental
                    </button>
                    <button
                      onClick={(e) => handleBookingAction(e, notif.id, notif.bookingId, 'rejected')}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/conversations');
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors ml-auto"
                    >
                      Chat with Renter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
