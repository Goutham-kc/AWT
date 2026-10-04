import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const SAMPLE_LISTINGS = [
  {
    _id: 'sample-1',
    title: 'Advanced Molecular Biology, 4th Ed.',
    campus: 'Stanford University',
    description: 'Thick college biology textbook resting on a modern wooden desk. Like new condition.',
    pricePerDay: 12,
    deposit: 50,
    category: 'textbooks',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    lister: { name: 'Alex Mercer', isVerified: true }
  },
  {
    _id: 'sample-2',
    title: 'TI-84 Plus CE Graphing Calculator',
    campus: 'NYU',
    description: 'Includes charging cable and slide cover. Perfect for calculus & statistics courses.',
    pricePerDay: 5,
    deposit: 40,
    category: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=400&q=80',
    lister: { name: 'Sarah Jenkins', isVerified: true }
  },
  {
    _id: 'sample-3',
    title: 'Sony WH-1000XM4 Noise-Canceling Headphones',
    campus: 'MIT',
    description: 'Perfect for finals week study sessions in noisy library quads. Great battery life.',
    pricePerDay: 15,
    deposit: 100,
    category: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    lister: { name: 'Marcus Reed', isVerified: false }
  },
  {
    _id: 'sample-4',
    title: 'Dorm Mini Fridge (3.2 cu ft)',
    campus: 'Stanford University',
    description: 'Clean, compact black mini fridge with freezer compartment. Pickup at West Campus.',
    pricePerDay: 45,
    deposit: 80,
    category: 'furniture',
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80',
    lister: { name: 'Andrew John', isVerified: true }
  },
  {
    _id: 'sample-5',
    title: 'Specialized Tarmac SL7 Road Bike',
    campus: 'Stanford University',
    description: 'Road cycle in excellent condition. Ideal for fast campus commuting.',
    pricePerDay: 25,
    deposit: 150,
    category: 'cycles',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80',
    lister: { name: 'Goutham KC', isVerified: true }
  }
];

export const Marketplace = () => {
  const navigate = useNavigate();
  const { addToCart, token, setIsLoginOpen } = useApp();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rental Days Calculator Modal State
  const [selectedCartItem, setSelectedCartItem] = useState(null);
  const [rentalDays, setRentalDays] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter States
  const [campus, setCampus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Calculate dynamic pricing attributes
  const pricePerDay = selectedCartItem ? selectedCartItem.pricePerDay : 0;
  const deposit = selectedCartItem ? selectedCartItem.deposit : 0;
  const days = Math.max(1, Number(rentalDays) || 1);
  const subtotal = pricePerDay * days;
  const serviceFee = Number((subtotal * 0.05).toFixed(2));
  const grandTotal = subtotal + deposit + serviceFee;

  const calculateEndDate = (startStr, numDays) => {
    const s = new Date(startStr || Date.now());
    s.setDate(s.getDate() + (numDays - 1));
    return s.toISOString().split('T')[0];
  };

  const handleConfirmAddToCart = () => {
    if (!selectedCartItem) return;
    if (!token) {
      setIsLoginOpen(true);
      setSelectedCartItem(null);
      return;
    }

    const calculatedEndDate = calculateEndDate(startDate, days);

    addToCart({
      listingId: selectedCartItem._id,
      title: selectedCartItem.title,
      pricePerDay,
      deposit,
      startDate,
      endDate: calculatedEndDate,
      days,
      subtotal,
      serviceFee,
      grandTotal,
      campus: selectedCartItem.campus
    });

    alert(`Added "${selectedCartItem.title}" to Cart for ${days} day(s) (Total: ₹${grandTotal})!`);
    setSelectedCartItem(null);
  };

  const handleMessageSeller = async (e, item) => {
    e.stopPropagation();
    if (!token) {
      setIsLoginOpen(true);
      return;
    }

    const recipientId = item.lister?._id;
    if (!recipientId) {
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
          recipientId,
          listingId: item._id
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

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (campus) params.append('campus', campus);
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`/api/listings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setListings(data);
          return;
        }
      }
    } catch (err) {
      console.log('Using sample marketplace listings');
    } finally {
      setLoading(false);
    }

    // Filter sample listings as fallback
    let filtered = [...SAMPLE_LISTINGS];
    if (category) {
      filtered = filtered.filter(item => item.category === category);
    }
    if (campus) {
      filtered = filtered.filter(item => item.campus.toLowerCase().includes(campus.toLowerCase()));
    }
    if (search) {
      filtered = filtered.filter(item => item.title.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase()));
    }
    if (minPrice) {
      filtered = filtered.filter(item => item.pricePerDay >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(item => item.pricePerDay <= Number(maxPrice));
    }

    setListings(filtered);
  };

  useEffect(() => {
    fetchListings();
  }, [campus, category, minPrice, maxPrice]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const handleClearFilters = () => {
    setCampus('');
    setCategory('');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
        
        {/* Campus Selector */}
        <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-sm sticky top-[90px] z-10">
          <h3 className="font-headline text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">school</span>
            Campus Selector
          </h3>
          <input
            type="text"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            placeholder="e.g. Stanford University"
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
          />
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-sm space-y-5">
          <div>
            <h4 className="font-label-md font-bold text-on-surface mb-2">Categories</h4>
            <div className="space-y-1">
              {['textbooks', 'electronics', 'cycles', 'furniture', 'utilities'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(category === cat ? '' : cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    category === cat 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-label-md font-bold text-on-surface mb-2">Price (Per Day)</h4>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 px-3 py-1.5 border border-outline-variant rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 px-3 py-1.5 border border-outline-variant rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <button
            onClick={handleClearFilters}
            className="w-full py-2 border border-outline text-on-surface-variant rounded-lg hover:bg-surface-container-low text-sm font-bold transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </aside>

      {/* Main Listings Grid */}
      <div className="flex-1 space-y-6">
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              type="text"
              placeholder="Search textbooks, headphones, bikes, mini fridges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm shadow-sm transition-all"
            />
          </div>
          <button 
            type="submit"
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-container shadow-sm transition-all cursor-pointer"
          >
            Search
          </button>
        </form>

        {loading ? (
          <div className="text-center py-12 text-outline font-semibold">Loading marketplace listings...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-outline-variant p-6">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
            <p className="text-on-surface-variant font-semibold">No listings found matching your criteria.</p>
            <button onClick={handleClearFilters} className="mt-3 px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-md">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div 
                key={item._id}
                onClick={() => navigate(`/listing/${item._id}`)}
                className="listing-card bg-white rounded-xl border border-outline-variant overflow-hidden cursor-pointer transition-all duration-300 shadow-sm flex flex-col hover:border-primary"
              >
                {/* Photo */}
                <div className="relative bg-surface-container-high h-48 flex items-center justify-center flex-shrink-0">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  {item.lister?.isVerified && (
                    <span className="absolute top-2 right-2 bg-success-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                      <span className="material-symbols-outlined text-[10px]">verified</span> Verified
                    </span>
                  )}
                  <span className="absolute top-2 left-2 bg-white/90 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                    {item.campus}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-headline font-bold text-on-surface text-base line-clamp-1 mb-1">{item.title}</h4>
                    <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">{item.description}</p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-outline-variant mt-auto">
                    <div>
                      <span className="text-lg font-bold text-primary">₹{item.pricePerDay}</span>
                      <span className="text-[11px] text-outline"> / day</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => handleMessageSeller(e, item)}
                        className="px-2.5 py-1 bg-surface-container-low hover:bg-primary/10 text-on-surface-variant hover:text-primary text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 border border-outline-variant"
                        title="Message seller to enquire directly"
                      >
                        <span className="material-symbols-outlined text-sm">forum</span> Enquire
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCartItem(item);
                        }}
                        className="px-3 py-1 bg-primary/10 hover:bg-primary hover:text-white text-primary text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">shopping_cart</span> Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Days & Cost Calculator Modal */}
      {selectedCartItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-outline-variant shadow-lg max-w-md w-full p-6 relative">
            <button 
              onClick={() => setSelectedCartItem(null)} 
              className="absolute top-4 right-4 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <h2 className="font-headline text-xl font-bold text-primary mb-1">Configure Rental Duration</h2>
            <p className="text-xs text-on-surface-variant mb-4 font-semibold">Item: {selectedCartItem.title}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Rental Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Number of Days Needed</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="1"
                    max="180"
                    value={rentalDays}
                    onChange={(e) => setRentalDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary font-bold"
                  />
                  <span className="text-xs text-outline font-bold whitespace-nowrap">days</span>
                </div>
              </div>

              {/* Dynamic Cost Breakdown */}
              <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant space-y-2 text-xs">
                <h4 className="font-bold text-on-surface text-sm border-b border-outline-variant pb-1">Calculated Cost Breakdown</h4>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Daily Rate</span>
                  <span>₹{pricePerDay} / day</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Duration Subtotal ({days} day{days > 1 ? 's' : ''})</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Security Deposit (Refundable)</span>
                  <span>₹{deposit}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Campus Service Fee (5%)</span>
                  <span>₹{serviceFee}</span>
                </div>
                <div className="flex justify-between border-t border-outline-variant pt-2 font-bold text-primary text-sm">
                  <span>Grand Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setSelectedCartItem(null)}
                  className="w-1/2 py-2 border border-outline text-on-surface rounded-lg font-bold text-sm hover:bg-surface-container-low"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmAddToCart}
                  className="w-1/2 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-container shadow-sm"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
