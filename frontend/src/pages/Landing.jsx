import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Landing = () => {
  const navigate = useNavigate();
  const { token, setIsLoginOpen } = useApp();
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="flex-grow">
      {/* Referral Banner */}
      {showBanner && (
        <div className="bg-secondary/15 text-primary px-container-margin py-stack-sm flex justify-between items-center text-sm border-b border-outline-variant transition-all duration-300 relative z-40" id="referral-banner">
          <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <p className="font-semibold">
              Invite a classmate, both get 50 credits!{' '}
              <Link className="underline hover:text-primary-container transition-colors" to="/referrals">
                Learn more
              </Link>
            </p>
            <button 
              className="text-primary hover:text-primary-container p-1 rounded-full transition-colors flex items-center justify-center" 
              onClick={() => setShowBanner(false)}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-surface-container-low min-h-[600px] flex items-center py-16">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div 
            className="bg-cover bg-center w-full h-full" 
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDsPpqEwEtrvXpifTpcPtEWDt3wSjuNPYjUk9NzEjnHAYzcAs31n5FR4PRXiGsSG-PaGZt5f8uKsmAj_epQbfWvqj0W6iyVNMBL67ECZSUxqA5rn1oXb28KFFZUwBLVCTzGn6ZFKqUsPGF64C6QgUJ2iLgqkdQUK-zS43hSO_XTUBwiGZZ5_Of9HQ84nrfouCZwmdcsK3EoctTNw_Rk_ZdDC1p9xaqr0dUU8vxCbUZcParuxS4gIBz5')` 
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-container/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-container-margin w-full text-center md:text-left flex flex-col md:flex-row items-center gap-8">
          <div className="flex-grow space-y-6 max-w-2xl text-white">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Verified Students Only</span>
            </div>
            
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold leading-tight drop-shadow-md">
              Rent & Share — <br className="hidden md:block" />
              <span className="text-secondary-container">Campus-Only Community</span>
            </h1>
            
            <p className="text-lg text-surface-container-low max-w-xl mx-auto md:mx-0 drop-shadow-sm font-sans">
              The secure, verified marketplace exclusively for your college. Buy, sell, rent, and share with classmates you can trust.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
              <button 
                onClick={() => navigate(token ? '/marketplace' : '/signup')}
                className="w-full sm:w-auto font-bold px-8 py-3 rounded-full bg-white text-primary hover:bg-surface-bright transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 active:scale-95 duration-200"
              >
                Get Started
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              
              <button 
                onClick={() => navigate('/marketplace')}
                className="w-full sm:w-auto font-bold px-8 py-3 rounded-full border-2 border-white/50 text-white hover:bg-white/10 hover:border-white transition-all flex items-center justify-center gap-2 active:scale-95 duration-200"
              >
                Browse
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-outline-variant bg-white py-6">
        <div className="max-w-7xl mx-auto px-container-margin flex flex-wrap justify-center items-center gap-12 opacity-80">
          <div className="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
            <span className="material-symbols-outlined text-primary">mark_email_read</span>
            <span>Verified with your .edu email</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
            <span className="material-symbols-outlined text-primary">location_city</span>
            <span>Campus-Only Community</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-on-surface-variant">
            <span className="material-symbols-outlined text-primary">security</span>
            <span>Secure Transactions</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 max-w-7xl mx-auto px-container-margin">
        <div className="text-center mb-12 space-y-2">
          <h2 className="font-headline text-3xl font-bold text-on-background">How It Works</h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">Three simple steps to join the most trusted campus marketplace.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center space-y-4 bg-white p-6 rounded-2xl border border-outline-variant hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline text-lg font-bold text-on-background">Verify</h3>
              <p className="text-sm text-on-surface-variant">Sign up securely with your university .edu email address.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center space-y-4 bg-white p-6 rounded-2xl border border-outline-variant hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
              <span className="material-symbols-outlined text-3xl">search</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline text-lg font-bold text-on-background">List or Search</h3>
              <p className="text-sm text-on-surface-variant">Find what you need for classes, or list your extras to share.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center space-y-4 bg-white p-6 rounded-2xl border border-outline-variant hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="w-16 h-16 rounded-full bg-energy-orange/10 flex items-center justify-center text-energy-orange shadow-inner">
              <span className="material-symbols-outlined text-3xl">groups</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline text-lg font-bold text-on-background">Chat & Meet</h3>
              <p className="text-sm text-on-surface-variant">Securely message inside the app and meet safely on campus.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Preview */}
      <section className="py-16 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-container-margin">
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-1">
              <h2 className="font-headline text-3xl font-bold text-on-background">Explore Categories</h2>
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
              { name: 'textbooks', title: 'Textbooks', icon: 'menu_book', desc: 'Required reading', bg: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=300&q=80' },
              { name: 'electronics', title: 'Electronics', icon: 'devices', desc: 'Laptops & devices', bg: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=300&q=80' },
              { name: 'cycles', title: 'Cycles', icon: 'pedal_bike', desc: 'Bikes & scooters', bg: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=300&q=80' },
              { name: 'furniture', title: 'Furniture', icon: 'chair', desc: 'Dorm essentials', bg: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=300&q=80' },
              { name: 'utilities', title: 'Utilities', icon: 'build', desc: 'Tools & accessories', bg: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80' }
            ].map((cat) => (
              <div 
                key={cat.name} 
                onClick={() => navigate(`/marketplace?category=${cat.name}`)}
                className="group relative rounded-2xl overflow-hidden hover-lift h-64 shadow-sm border border-outline-variant cursor-pointer"
              >
                <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={cat.bg} alt={cat.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="relative z-10 p-4 h-full flex flex-col justify-between text-white">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined">{cat.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg">{cat.title}</h3>
                    <p className="text-xs text-surface-dim">{cat.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container dark:bg-surface-container-high py-12 border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center px-container-margin max-w-7xl mx-auto gap-8 text-sm">
          <div className="text-center md:text-left">
            <div className="font-headline text-lg font-bold text-primary mb-2">Academica Exchange</div>
            <div className="text-on-surface-variant font-medium">© 2026 Academica Exchange. All rights reserved.</div>
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
