import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';




export const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user, addToCart, setIsLoginOpen } = useApp();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Date selection states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Cost computations
  const [days, setDays] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [dateConflict, setDateConflict] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/listings/${id}`);
        const data = await res.json();
        if (res.ok) {
          setListing(data);
        } else {
          setErrorMsg(data.message || 'Failed to load listing');
        }
      } catch (err) {
        setErrorMsg('Network error loading listing');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchListing();
  }, [id]);

  // Compute pricing when dates change
  useEffect(() => {
    if (!startDate || !endDate || !listing) {
      setDays(0);
      setSubtotal(0);
      setServiceFee(0);
      setGrandTotal(0);
      setDateConflict(false);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      setDateConflict(true);
      return;
    }

    // Check conflict against blocked dates
    const hasConflict = listing.blockedDates.some(blockedStr => {
      // Compare dates in YYYY-MM-DD format
      const bd = new Date(blockedStr).toISOString().split('T')[0];
      const st = new Date(start).toISOString().split('T')[0];
      const en = new Date(end).toISOString().split('T')[0];
      return bd >= st && bd <= en;
    });

    setDateConflict(hasConflict);

    if (!hasConflict) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      const sub = diffDays * listing.pricePerDay;
      const fee = Number((sub * 0.05).toFixed(2));
      const total = sub + listing.deposit + fee;

      setDays(diffDays);
      setSubtotal(sub);
      setServiceFee(fee);
      setGrandTotal(total);
    }
  }, [startDate, endDate, listing]);

  const handleAddToCart = () => {
    if (!token) {
      setIsLoginOpen(true);
      return;
    }

    if (!listing) return;

    if (!startDate || !endDate) {
      alert('Please select start and end dates.');
      return;
    }

    if (dateConflict) {
      alert('The selected dates overlap with already booked/blocked dates.');
      return;
    }

    const cartPayload = {
      listingId: listing._id,
      title: listing.title,
      pricePerDay: listing.pricePerDay,
      deposit: listing.deposit,
      startDate,
      endDate,
      days,
      subtotal,
      serviceFee,
      grandTotal
    };

    addToCart(cartPayload);
    setSuccessMsg('Successfully added item to your cart!');
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const handleMessageLister = async () => {
    if (!token) {
      setIsLoginOpen(true);
      return;
    }

    if (!listing?.lister?._id) {
      alert('Enquiry messaging is available for registered seller accounts.');
      return;
    }

    if (user?.id && listing.lister._id === user.id) {
      navigate('/conversations');
      return;
    }

    try {
      const res = await fetch('/api/chats/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: listing.lister._id,
          listingId: listing._id
        })
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/conversations', { state: { conversationId: data._id } });
      } else {
        alert(data.message || 'Failed to start conversation thread');
      }
    } catch (err) {
      alert('Error initiating message conversation');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-outline">Loading listing profile...</div>;
  }

  if (errorMsg || !listing) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-outline-variant rounded-xl shadow-sm text-center">
        <span className="material-symbols-outlined text-4xl text-error-red mb-2">error</span>
        <p className="text-on-surface font-semibold">{errorMsg || 'Listing not found'}</p>
        <button onClick={() => navigate('/marketplace')} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
      
      {/* Left: Media Gallery and Description */}
      <div className="flex-1 space-y-6">
        <div className="bg-surface-container-high rounded-xl aspect-[4/3] flex items-center justify-center border border-outline-variant relative overflow-hidden shadow-sm">
          {listing.imageUrl ? (
            <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-outline text-7xl">image</span>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <div>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase">
              {listing.category}
            </span>
            <h2 className="font-headline text-3xl font-bold text-on-surface mt-2">{listing.title}</h2>
            <p className="text-sm text-outline mt-1 font-semibold">{listing.campus} · Pickup: {listing.location}</p>
          </div>

          <div className="border-t border-outline-variant pt-4 space-y-2">
            <h4 className="text-sm font-semibold text-on-surface">Description</h4>
            <p className="text-on-surface-variant text-sm whitespace-pre-line leading-relaxed">
              {listing.description}
            </p>
          </div>

          <div className="border-t border-outline-variant pt-4 flex gap-4 text-sm font-semibold text-on-surface-variant">
            <div>Condition: <span className="text-primary font-bold">{listing.condition}</span></div>
            <div>Booking Type: <span className="text-primary font-bold">{listing.allowDirectBooking ? 'Direct Booking' : 'Negotiable'}</span></div>
          </div>
        </div>
      </div>

      {/* Right: Booking Panel & Lister Profile */}
      <div className="w-full lg:w-96 flex-shrink-0 space-y-6">
        
        {/* Booking Card */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold text-outline">Rental Fee</span>
            <div>
              <span className="text-2xl font-bold text-primary">₹{listing.pricePerDay}</span>
              <span className="text-xs text-outline"> / day</span>
            </div>
          </div>

          <div className="border-t border-outline-variant pt-4 space-y-3">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">End Date</label>
              <input 
                type="date" 
                value={endDate}
                min={startDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          {/* Pricing breakdowns */}
          {days > 0 && !dateConflict && (
            <div className="border-t border-outline-variant pt-4 space-y-2 text-sm text-on-surface-variant">
              <div className="flex justify-between">
                <span>Rental Subtotal ({days} days)</span>
                <span className="font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit (Refundable)</span>
                <span className="font-semibold">₹{listing.deposit}</span>
              </div>
              <div className="flex justify-between">
                <span>Campus Service Fee (5%)</span>
                <span className="font-semibold">₹{serviceFee}</span>
              </div>
              <div className="flex justify-between border-t border-outline-variant pt-2 font-bold text-primary text-base">
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
          )}

          {dateConflict && (
            <div className="text-error-red text-sm font-semibold bg-error-container/20 border border-error-red p-2.5 rounded-lg text-center">
              Selected dates overlap with unavailable calendar blocks!
            </div>
          )}

          {successMsg && (
            <div className="text-success-green text-sm font-semibold bg-success-green/10 border border-success-green p-2.5 rounded-lg text-center">
              {successMsg}
            </div>
          )}

          <button 
            onClick={handleAddToCart}
            disabled={dateConflict || !startDate || !endDate}
            className="w-full py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-container font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            Add to Cart
          </button>
        </div>

        {/* Lister Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm space-y-3">
          <h4 className="text-sm font-semibold text-on-surface">Listed By</h4>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-lg">
              {listing.lister.name ? listing.lister.name.charAt(0) : 'U'}
            </div>
            <div>
              <div className="font-semibold text-on-surface flex items-center gap-1">
                {listing.lister.name || 'Campus Student'}
                {listing.lister.isVerified && (
                  <span className="material-symbols-outlined text-success-green text-base">verified</span>
                )}
              </div>
              <div className="text-xs text-outline font-semibold">{listing.lister.institution || 'Verified University'} · {listing.lister.homeCampus || listing.campus}</div>
            </div>
          </div>

          <button 
            onClick={handleMessageLister}
            className="w-full py-2.5 bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <span className="material-symbols-outlined text-lg">forum</span> Enquire / Message Creator
          </button>
        </div>

      </div>
    </div>
  );
};
