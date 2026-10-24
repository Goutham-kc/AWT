import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Navbar = () => {
  const { user, token, logout, login, cart, isLoginOpen, setIsLoginOpen } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLoginOpen(false);
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsLoginOpen]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      login(data.token, {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        institution: data.user.institution,
        homeCampus: data.user.homeCampus,
        referralCode: data.user.referralCode,
        referralCredits: data.user.referralCredits
      });

      setIsLoginOpen(false);
      setEmail('');
      setPassword('');
      navigate('/marketplace');
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-outline-variant shadow-xs sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Section: Brand Logo & Primary Desktop Navigation */}
        <div className="flex items-center gap-6 lg:gap-8 min-w-0">
          <Link 
            className="font-headline text-lg sm:text-xl lg:text-2xl font-extrabold text-primary flex items-center gap-2 tracking-tight group cursor-pointer shrink-0" 
            to="/"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMobileMenuOpen(false);
            }}
            title="Go to Home"
          >
            <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">school</span>
            <span className="truncate">Academica Exchange</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6">
            <Link 
              className={`text-sm font-semibold transition-colors py-1 ${
                location.pathname === '/marketplace' 
                  ? 'text-primary font-bold border-b-2 border-primary' 
                  : 'text-on-surface-variant hover:text-primary'
              }`} 
              to="/marketplace"
            >
              Marketplace
            </Link>

            <Link 
              className={`text-sm font-semibold transition-colors py-1 ${
                location.pathname === '/student-trust' 
                  ? 'text-primary font-bold border-b-2 border-primary' 
                  : 'text-on-surface-variant hover:text-primary'
              }`} 
              to="/student-trust"
            >
              Trust & Safety
            </Link>

            {token && (
              <>
                <Link 
                  className={`text-sm font-semibold transition-colors py-1 ${
                    location.pathname === '/conversations' 
                      ? 'text-primary font-bold border-b-2 border-primary' 
                      : 'text-on-surface-variant hover:text-primary'
                  }`} 
                  to="/conversations"
                >
                  Messages
                </Link>

                <Link 
                  className={`text-sm font-semibold transition-colors py-1 flex items-center gap-1 ${
                    location.pathname === '/referrals' 
                      ? 'text-primary font-bold border-b-2 border-primary' 
                      : 'text-on-surface-variant hover:text-primary'
                  }`} 
                  to="/referrals"
                >
                  <span>Referrals</span>
                  <span className="px-1.5 py-0.2 bg-green-100 text-green-800 text-[10px] font-extrabold rounded-full">
                    ₹50
                  </span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Section: Actions & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* List Item CTA (Desktop) */}
          {token && (
            <Link
              to="/create-listing"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold rounded-lg transition-colors border border-primary/20"
              title="Share an item with classmates"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>List Item</span>
            </Link>
          )}

          {/* Cart Icon */}
          <Link 
            className="relative p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors group flex items-center justify-center" 
            to="/cart" 
            title="Shopping Cart"
          >
            <span className="material-symbols-outlined text-2xl group-hover:scale-105 transition-transform">shopping_cart</span>
            {cart.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-error-red text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Notifications Icon (Logged in) */}
          {token && (
            <Link 
              className="relative p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors group flex items-center justify-center" 
              to="/notifications"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-105 transition-transform">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-red rounded-full ring-2 ring-white"></span>
            </Link>
          )}

          {/* User Account / Auth Area */}
          {token ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 sm:pr-2.5 rounded-full hover:bg-surface-container-low border border-outline-variant transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="User Account Menu"
                aria-expanded={userDropdownOpen}
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold uppercase shadow-xs">
                  {getUserInitials(user?.name)}
                </div>
                <span className="hidden md:inline text-xs font-bold text-on-surface max-w-[100px] truncate">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <span className={`material-symbols-outlined text-base text-outline transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* User Dropdown Popover */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-outline-variant py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Profile Header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Student'}</p>
                    <p className="text-xs text-slate-500 font-mono truncate">{user?.email || '@tkmce.ac.in'}</p>
                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">Referral Credits:</span>
                      <strong className="text-green-700 font-extrabold">₹{user?.referralCredits || 0}</strong>
                    </div>
                  </div>

                  {/* Dropdown Links */}
                  <div className="py-1 text-sm font-semibold text-slate-700">
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg text-primary">person</span>
                      <span>My Profile & Listings</span>
                    </Link>

                    <Link
                      to="/create-listing"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg text-primary">add_circle</span>
                      <span>List an Item</span>
                    </Link>

                    <Link
                      to="/conversations"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg text-primary">forum</span>
                      <span>Messages</span>
                    </Link>

                    <Link
                      to="/referrals"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg text-primary">redeem</span>
                      <span>Referrals & Rewards</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg text-primary">tune</span>
                      <span>Settings</span>
                    </Link>

                    <Link
                      to="/student-trust"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg text-primary">verified_user</span>
                      <span>Campus Trust & Safety</span>
                    </Link>
                  </div>

                  {/* Logout Row */}
                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-2.5">
              <button 
                onClick={() => setIsLoginOpen(true)} 
                className="px-3 sm:px-4 py-1.5 text-primary text-xs sm:text-sm font-bold border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Log In
              </button>
              <Link 
                className="px-3 sm:px-4 py-1.5 bg-primary text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-primary-container transition-colors duration-200 shadow-xs cursor-pointer"
                to="/signup"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant bg-white px-4 py-4 space-y-3 shadow-xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          
          {token && user && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {getUserInitials(user?.name)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">{user.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                ₹{user.referralCredits || 0}
              </span>
            </div>
          )}

          <nav className="space-y-1 text-sm font-semibold">
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-primary text-xl">storefront</span>
              <span>Marketplace</span>
            </Link>

            <Link
              to="/student-trust"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
              <span>Student Trust & Safety</span>
            </Link>

            {token ? (
              <>
                <Link
                  to="/create-listing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary font-bold bg-primary/5 hover:bg-primary/10"
                >
                  <span className="material-symbols-outlined text-xl">add_circle</span>
                  <span>List an Item</span>
                </Link>

                <Link
                  to="/conversations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low"
                >
                  <span className="material-symbols-outlined text-primary text-xl">forum</span>
                  <span>Messages</span>
                </Link>

                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">shopping_cart</span>
                    <span>Shopping Cart</span>
                  </div>
                  {cart.length > 0 && (
                    <span className="px-2 py-0.5 bg-error-red text-white text-xs font-bold rounded-full">
                      {cart.length}
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low"
                >
                  <span className="material-symbols-outlined text-primary text-xl">person</span>
                  <span>My Profile & Rentals</span>
                </Link>

                <Link
                  to="/referrals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">redeem</span>
                    <span>Referrals</span>
                  </div>
                  <span className="text-xs text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-md">
                    Invite & Earn
                  </span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface hover:bg-surface-container-low"
                >
                  <span className="material-symbols-outlined text-primary text-xl">tune</span>
                  <span>Settings</span>
                </Link>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">logout</span>
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsLoginOpen(true);
                  }}
                  className="w-full py-2.5 text-center text-sm font-bold text-primary border border-primary rounded-xl hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-container transition-colors shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Login Modal Overlay via Portal to prevent header containing-block clipping */}
      {isLoginOpen && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLoginOpen(false);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto transition-opacity animate-in fade-in duration-200"
        >
          <div className="my-auto bg-white rounded-2xl border border-outline-variant shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
            <button 
              onClick={() => setIsLoginOpen(false)} 
              className="absolute top-4 right-4 text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
              title="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            
            <h2 className="font-headline text-2xl font-bold text-primary mb-1 text-center">Log In to Your Account</h2>
            <p className="text-xs text-on-surface-variant text-center mb-6">Enter your student credentials to continue</p>
            
            {errorMsg && (
              <div className="bg-error-container/20 border border-error-red text-error-red p-3 rounded-lg mb-4 text-sm font-semibold">
                {errorMsg}
              </div>
            )}
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">College Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all duration-200" 
                  placeholder="e.g. yourname@tkmce.ac.in" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all duration-200" 
                  placeholder="••••••••" 
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-container transition-colors duration-200 shadow-sm font-bold disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
            
            <div className="mt-5 text-center text-sm text-on-surface-variant">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                onClick={() => setIsLoginOpen(false)} 
                className="text-primary font-bold hover:underline"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

export default Navbar;
