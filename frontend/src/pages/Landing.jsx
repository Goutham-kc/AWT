import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Landing = () => {
  const navigate = useNavigate();
  const { token, setIsLoginOpen } = useApp();
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="flex-grow flex flex-col">
      {/* Referral Banner */}
      {showBanner && (
        <div className="bg-primary/10 text-primary px-6 py-2 flex justify-between items-center text-sm border-b border-outline-variant relative z-40">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <p className="font-semibold">
              🎁 Invite a classmate, both get 50 credits!{' '}
              <Link className="underline font-bold hover:text-primary-container transition-colors" to="/referrals">
                Learn more
              </Link>
            </p>
            <button 
              className="text-primary hover:text-primary-container p-1 rounded-full transition-colors" 
              onClick={() => setShowBanner(false)}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-primary via-primary-container to-primary text-white min-h-[500px] flex items-center py-16 px-6">
        <div className="relative z-10 max-w-7xl mx-auto w-full text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Verified Students Only</span>
            </div>
            
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Rent & Share — <br />
              <span className="text-secondary-container">Campus-Only Community</span>
            </h1>
            
            <p className="text-lg text-white/90 max-w-xl mx-auto md:mx-0 font-sans">
              The secure, verified marketplace exclusively for your college. Buy, sell, rent, and share with classmates you can trust.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
              <button 
                onClick={() => navigate(token ? '/marketplace' : '/signup')}
                className="w-full sm:w-auto font-bold px-8 py-3.5 rounded-full bg-white text-primary hover:bg-surface-bright transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 active:scale-95 duration-200 cursor-pointer"
              >
                Get Started
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              
              <button 
                onClick={() => navigate('/marketplace')}
                className="w-full sm:w-auto font-bold px-8 py-3.5 rounded-full border-2 border-white/50 text-white hover:bg-white/10 hover:border-white transition-all flex items-center justify-center gap-2 active:scale-95 duration-200 cursor-pointer"
              >
                Browse Marketplace
              </button>
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 max-w-md w-full text-white shadow-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-secondary-container">school</span>
              <div>
                <h3 className="font-bold text-lg">Institutional Verification</h3>
                <p className="text-xs opacity-90">Sign up using your college .edu email</p>
              </div>
            </div>
            <div className="border-t border-white/15 pt-3 flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-secondary-container">swap_horiz</span>
              <div>
                <h3 className="font-bold text-lg">Peer-to-Peer Rentals</h3>
                <p className="text-xs opacity-90">Textbooks, electronics, cycles, dorm gear</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-outline-variant bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-12 text-on-surface">
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="material-symbols-outlined text-primary">mark_email_read</span>
            <span>Verified with your college email</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="material-symbols-outlined text-primary">location_city</span>
            <span>Campus-Only Community</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="material-symbols-outlined text-primary">security</span>
            <span>Secure Transactions</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-12 space-y-2">
          <h2 className="font-headline text-3xl font-bold text-on-surface">How It Works</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">Three simple steps to join the most trusted campus marketplace.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center space-y-4 bg-white p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline text-lg font-bold text-on-surface">Verify</h3>
              <p className="text-sm text-on-surface-variant">Sign up securely with your university .edu email address.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center space-y-4 bg-white p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-3xl">search</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline text-lg font-bold text-on-surface">List or Search</h3>
              <p className="text-sm text-on-surface-variant">Find what you need for classes, or list your extras to share.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center space-y-4 bg-white p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all">
            <div className="w-16 h-16 rounded-full bg-energy-orange/10 flex items-center justify-center text-energy-orange">
              <span className="material-symbols-outlined text-3xl">groups</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline text-lg font-bold text-on-surface">Chat & Meet</h3>
              <p className="text-sm text-on-surface-variant">Securely message inside the app and meet safely on campus.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Preview */}
      <section className="py-16 bg-surface-container-low w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-1">
              <h2 className="font-headline text-3xl font-bold text-on-surface">Explore Categories</h2>
              <p className="text-on-surface-variant">Everything you need for campus life, sourced locally.</p>
            </div>
            <Link className="hidden md:flex items-center gap-1 font-bold text-primary hover:text-primary-container transition-colors" to="/marketplace">
              View All Categories
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'textbooks', title: 'Textbooks', icon: 'menu_book', desc: 'Required reading' },
              { name: 'electronics', title: 'Electronics', icon: 'devices', desc: 'Laptops & devices' },
              { name: 'cycles', title: 'Cycles', icon: 'pedal_bike', desc: 'Bikes & scooters' },
              { name: 'furniture', title: 'Furniture', icon: 'chair', desc: 'Dorm essentials' },
              { name: 'utilities', title: 'Utilities', icon: 'build', desc: 'Tools & accessories' }
            ].map((cat) => (
              <div 
                key={cat.name} 
                onClick={() => navigate(`/marketplace?category=${cat.name}`)}
                className="group bg-white p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md hover:border-primary cursor-pointer transition-all flex flex-col justify-between h-48"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors">{cat.title}</h3>
                  <p className="text-xs text-on-surface-variant">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container py-12 border-t border-outline-variant mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-7xl mx-auto gap-8 text-sm">
          <div className="text-center md:text-left">
            <div className="font-headline text-lg font-bold text-primary mb-1">Academica Exchange</div>
            <div className="text-on-surface-variant">© 2026 Academica Exchange. All rights reserved.</div>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            <Link className="text-on-surface-variant hover:underline hover:text-primary transition-colors" to="/marketplace">Browse</Link>
            <Link className="text-on-surface-variant hover:underline hover:text-primary transition-colors" to="/referrals">Invite Friends</Link>
            <span className="text-on-surface-variant hover:underline hover:text-primary transition-colors cursor-pointer" onClick={() => setIsLoginOpen(true)}>Log In</span>
          </nav>
        </div>
      </footer>
    </div>
  );
};
