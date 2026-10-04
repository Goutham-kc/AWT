import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Navbar = () => {
  const { user, token, logout, login, cart, isLoginOpen, setIsLoginOpen } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLoginOpen(false);
      }
    };
    if (isLoginOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginOpen]);

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

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-outline-variant shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Section: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link 
            className="font-headline text-xl sm:text-2xl font-extrabold text-primary flex items-center gap-2 tracking-tight group cursor-pointer" 
            to="/"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMobileMenuOpen(false);
            }}
            title="Go to Home"
          >
            <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">school</span>
            <span>Academica Exchange</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
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
                  className={`text-sm font-semibold transition-colors py-1 ${
                    location.pathname === '/referrals' 
                      ? 'text-primary font-bold border-b-2 border-primary' 
                      : 'text-on-surface-variant hover:text-primary'
                  }`} 
                  to="/referrals"
                >
                  Referrals
                </Link>
                <Link 
                  className={`text-sm font-semibold transition-colors py-1 ${
                    location.pathname === '/create-listing' 
                      ? 'text-primary font-bold border-b-2 border-primary' 
                      : 'text-on-surface-variant hover:text-primary'
                  }`} 
                  to="/create-listing"
                >
                  List an Item
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Section: Actions (Cart, Notifications, Auth) */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Cart Icon & Link */}
          <Link 
            className="relative px-3 py-1.5 flex items-center gap-1.5 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors group" 
            to="/cart" 
            title="Your Cart"
          >
            <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">shopping_cart</span>
            <span className="font-semibold text-sm hidden sm:inline">Cart</span>
            {cart.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-error-red text-white text-[11px] font-bold rounded-full">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Notifications Icon */}
          {token && (
            <Link 
              className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors group" 
              to="/notifications"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-red rounded-full"></span>
            </Link>
          )}

          {/* User Session Profile Buttons */}
          {token ? (
            <div className="flex items-center gap-3">
              <span className="hidden lg:inline text-on-surface-variant text-sm">
                Hi, <strong className="text-primary">{user?.name}</strong>
              </span>
              <button 
                onClick={logout} 
                className="px-3.5 py-1.5 border border-outline hover:bg-surface-dim hover:text-on-surface rounded-lg transition-colors text-sm font-semibold cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => setIsLoginOpen(true)} 
                className="px-3.5 py-1.5 text-primary text-sm font-semibold border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Log In
              </button>
              <Link 
                className="px-3.5 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-container transition-colors duration-200 shadow-sm cursor-pointer"
                to="/signup"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant bg-white px-4 py-3 space-y-1 shadow-lg">
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-low"
          >
            Marketplace
          </Link>
          {token && (
            <>
              <Link
                to="/conversations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-low"
              >
                Messages
              </Link>
              <Link
                to="/referrals"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-low"
              >
                Referrals
              </Link>
              <Link
                to="/create-listing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-low"
              >
                List an Item
              </Link>
            </>
          )}
        </div>
      )}

      {/* Login Modal Overlay via Portal to prevent header containing-block clipping */}
      {isLoginOpen && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLoginOpen(false);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 transition-opacity animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl border border-outline-variant shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
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
