import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { user, token, logout, login, cart, isLoginOpen, setIsLoginOpen } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

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
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong');
    }
  };

  return (
    <header className="bg-surface border-b border-outline-variant shadow-sm top-0 sticky z-50">
      <div className="flex justify-between items-center w-full px-container-margin py-stack-md max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-gutter">
          <Link className="font-headline text-2xl font-bold text-primary" to="/marketplace">
            Academica Exchange
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-stack-md">
          <Link className="text-primary font-bold pb-1 hover:text-primary transition-colors" to="/marketplace">
            Marketplace
          </Link>
          {token && (
            <>
              <Link className="text-on-surface-variant hover:text-primary transition-colors" to="/conversations">
                Messages
              </Link>
              <Link className="text-on-surface-variant hover:text-primary transition-colors" to="/referrals">
                Referrals
              </Link>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-stack-sm ml-gutter">
          {/* Cart Icon */}
          {token && (
            <Link className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors group" to="/cart">
              <span className="material-symbols-outlined">shopping_cart</span>
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-error-red text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-surface">
                  {cart.length}
                </span>
              )}
            </Link>
          )}

          {/* Notifications Icon */}
          {token && (
            <Link className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors group" to="/notifications">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-red rounded-full"></span>
            </Link>
          )}

          {/* User Session Profile Buttons */}
          {token ? (
            <div className="flex items-center gap-stack-md">
              <span className="hidden lg:inline text-on-surface-variant text-label-md">
                Hi, <strong className="text-primary">{user?.name}</strong>
              </span>
              <button 
                onClick={logout} 
                className="px-4 py-2 border border-outline hover:bg-surface-dim hover:text-on-surface rounded-lg transition-colors font-label-md text-label-sm"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-stack-sm">
              <button 
                onClick={() => setIsLoginOpen(true)} 
                className="px-4 py-2 text-primary font-label-md text-label-md border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors duration-200"
              >
                Log In
              </button>
              <Link 
                className="px-4 py-2 bg-primary text-white font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors duration-200 shadow-sm"
                to="/signup"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Login Modal Overlay */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-outline-variant shadow-lg max-w-md w-full p-6 relative">
            <button 
              onClick={() => setIsLoginOpen(false)} 
              className="absolute top-4 right-4 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <h2 className="font-headline text-2xl font-bold text-primary mb-4 text-center">Log In to Your Account</h2>
            
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
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-sm text-body-sm transition-all duration-200" 
                  placeholder="e.g. name@college.edu" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-sm text-body-sm transition-all duration-200" 
                  placeholder="••••••••" 
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full py-2 bg-primary text-white font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors duration-200 shadow-sm font-bold"
              >
                Log In
              </button>
            </form>
            
            <div className="mt-4 text-center text-sm text-on-surface-variant">
              Don't have an account? <Link to="/signup" onClick={() => setIsLoginOpen(false)} className="text-primary font-bold hover:underline">Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
