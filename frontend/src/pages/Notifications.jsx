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
                type: 'booking',
                title: 'New Booking Request Received',
                content: `${booking.renter?.name || 'Classmate'} requested to rent your "${booking.listing?.title || 'Item'}".`,
                time: new Date(booking.createdAt).toLocaleDateString(),
                unread: false,
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

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-container-margin py-stack-lg flex flex-col min-h-[500px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface mb-2">Notifications</h1>
          <p className="font-body-md text-on-surface-variant">Stay updated on your rentals, messages, and campus activity.</p>
        </div>
        
        {notifications.some(n => n.unread) && (
          <button 
            onClick={handleMarkAllRead}
            className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors py-2 px-4 rounded-lg bg-white border border-outline-variant hover:bg-surface-container-low self-start md:self-auto font-semibold shadow-sm"
          >
            Mark all
          </button>
        )}
      </div>

      {/* Filters Strip */}
      <div className="flex gap-2 mb-stack-lg overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: 'all', label: 'All' },
          { key: 'message', label: 'Messages' },
          { key: 'booking', label: 'Bookings' },
          { key: 'referral', label: 'Referrals' }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`px-4 py-2 rounded-full font-label-md text-sm whitespace-nowrap transition-colors ${
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
              className={`relative bg-white p-5 rounded-xl border border-outline-variant transition-all hover:border-primary cursor-pointer shadow-sm flex gap-4 items-start ${
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

              <div className="flex-grow">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="font-headline font-bold text-sm text-on-surface">{notif.title}</h3>
                  <span className="text-xs text-outline font-semibold">{notif.time}</span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{notif.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
