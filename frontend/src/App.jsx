import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Marketplace } from './pages/Marketplace';
import { SignUp } from './pages/SignUp';
import { Verification } from './pages/Verification';
import { ListingDetail } from './pages/ListingDetail';
import { Cart } from './pages/Cart';
import { Chat } from './pages/Chat';
import { Referrals } from './pages/Referrals';
import { Notifications } from './pages/Notifications';
import CreateListing from './pages/CreateListing';

const App = () => {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-surface text-on-surface">
          <Navbar />
          <Routes>
            {/* Primary React Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify" element={<Verification />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/conversations" element={<Chat />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/create-listing" element={<CreateListing />} />

            {/* Legacy .html Route Aliases */}
            <Route path="/cart.html" element={<Navigate to="/cart" replace />} />
            <Route path="/marketplace.html" element={<Navigate to="/marketplace" replace />} />
            <Route path="/messages.html" element={<Navigate to="/conversations" replace />} />
            <Route path="/create_listing.html" element={<Navigate to="/create-listing" replace />} />
            <Route path="/referral.html" element={<Navigate to="/referrals" replace />} />
            <Route path="/signup.html" element={<Navigate to="/signup" replace />} />
            <Route path="/verification_pending.html" element={<Navigate to="/verify" replace />} />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
