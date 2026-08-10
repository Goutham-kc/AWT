import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


interface Lister {
  _id: string;
  name: string;
  institution: string;
  homeCampus: string;
  isVerified: boolean;
}

interface ListingItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  pricePerDay: number;
  deposit: number;
  imageUrl: string | null;
  location: string;
  campus: string;
  lister: Lister;
  allowDirectBooking: boolean;
  availabilityStatus: string;
}

export const Marketplace: React.FC = () => {
  const navigate = useNavigate();

  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter States
  const [campus, setCampus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      if (campus) params.append('campus', campus);
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (onlyAvailable) params.append('availability', 'available');

      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setListings(data);
      } else {
        setErrorMsg(data.message || 'Failed to fetch listings');
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
      setErrorMsg('Failed to load listings. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [campus, category, onlyAvailable]); // Auto-refresh on campus, category, availability toggles

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const handleClearFilters = () => {
    setCampus('');
    setCategory('');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setOnlyAvailable(true);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-container-margin py-stack-lg flex flex-col md:flex-row gap-stack-lg">
      
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-stack-lg">
        
        {/* Campus Search Box */}
        <div className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant shadow-sm sticky top-[90px] z-10">
          <h3 className="font-headline text-sm font-bold text-on-surface mb-stack-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">school</span>
            Campus Selector
          </h3>
          <input
            type="text"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            placeholder="e.g. Main Campus"
            className="w-full px-3 py-1.5 bg-white border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-body-sm text-sm"
          />
        </div>

        {/* Filters */}
        <div className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant shadow-sm space-y-5">
          <div>
            <h4 className="font-label-md font-semibold text-on-surface mb-2">Categories</h4>
            <div className="space-y-2">
              {['textbooks', 'electronics', 'cycles', 'furniture', 'utilities'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(category === cat ? '' : cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    category === cat 
                      ? 'bg-primary text-white font-semibold' 
                      : 'hover:bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-label-md font-semibold text-on-surface mb-2">Price (Per Day)</h4>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 px-2 py-1 border border-outline-variant rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 px-2 py-1 border border-outline-variant rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-outline-variant">
            <span className="text-sm font-semibold text-on-surface-variant">Available Only</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={onlyAvailable}
                onChange={() => setOnlyAvailable(!onlyAvailable)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success-green"></div>
            </label>
          </div>

          <button
            onClick={handleClearFilters}
            className="w-full py-1.5 border border-outline text-on-surface-variant rounded-lg hover:bg-surface-container-low text-sm font-bold transition-all"
          >
            Clear Filters
          </button>
        </div>
      </aside>

      {/* Main Listings Grid */}
      <div className="flex-1 space-y-stack-md">
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-sm text-sm shadow-sm transition-all"
            />
          </div>
          <button 
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-container font-label-md text-label-md shadow-sm transition-all"
          >
            Search
          </button>
        </form>

        {errorMsg && (
          <div className="bg-error-container/20 border border-error-red text-error-red p-3 rounded-lg flex items-center justify-between shadow-sm">
            <span className="font-semibold text-sm">{errorMsg}</span>
            <button 
              onClick={() => fetchListings()}
              className="px-4 py-1.5 bg-error-red text-white text-xs font-bold rounded-md hover:bg-error-red/90 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-outline">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-outline-variant p-6">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
            <p className="text-on-surface-variant font-semibold">No listings found matching your criteria.</p>
            <p className="text-sm text-outline mt-1">Try widening your filters or campus selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-stack-md">
            {listings.map((item) => (
              <div 
                key={item._id}
                onClick={() => navigate(`/listing/${item._id}`)}
                className="listing-card bg-white rounded-xl border border-outline-variant overflow-hidden cursor-pointer transition-all duration-300 shadow-sm flex flex-col"
              >
                {/* Photo Placeholder */}
                <div className="relative bg-surface-container-high h-48 flex items-center justify-center flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-outline text-5xl">image</span>
                  )}
                  {item.lister.isVerified && (
                    <span className="absolute top-2 right-2 bg-success-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                      <span className="material-symbols-outlined text-[10px]">verified</span> Verified
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-stack-md flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-headline font-bold text-on-surface text-base line-clamp-1">{item.title}</h4>
                    </div>
                    <p className="text-sm text-outline font-semibold mb-2">{item.campus}</p>
                    <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">{item.description}</p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-outline-variant mt-auto">
                    <div>
                      <span className="text-lg font-bold text-primary">{item.pricePerDay}</span>
                      <span className="text-[11px] text-outline"> credits / day</span>
                    </div>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-md uppercase">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
