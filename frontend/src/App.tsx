import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-surface text-on-surface">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify" element={<Verification />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/conversations" element={<Chat />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
