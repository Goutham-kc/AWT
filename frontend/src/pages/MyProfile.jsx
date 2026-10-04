import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const MyProfile = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [rentalRequests, setRentalRequests] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [bio, setBio] = useState('');

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/50 to-blue-50 text-on-background`}>

      <div className="min-h-screen flex flex-col">

        {/* Navigation */}
        <header className="bg-white text-primary sticky top-0 z-50 shadow-md flex justify-between items-center w-full px-6 py-4">
          <div className="font-headline text-xl font-bold">
            Academica Exchange
          </div>

          <nav className="hidden md:flex gap-6 items-center">
            <Link className="text-on-surface-variant hover:text-primary px-3 py-2 rounded-md" to="/marketplace">
              Marketplace
            </Link>

            <a className="text-on-surface-variant hover:text-primary px-3 py-2 rounded-md" href="#">
              How It Works
            </a>

            <a className="text-on-surface-variant hover:text-primary px-3 py-2 rounded-md" href="#">
              Student Trust
            </a>

            <a className="text-on-surface-variant hover:text-primary px-3 py-2 rounded-md" href="#">
              Safety
            </a>
          </nav>

          <div className="flex gap-3 items-center">
            <button className="font-semibold text-primary hover:bg-primary/10 px-4 py-2 rounded-lg">
              Log In
            </button>

            <button className="font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
              Get Started
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-low text-primary"
            >
              <span className="material-symbols-outlined">
                {darkMode ? 'dark_mode' : 'light_mode'}
              </span>
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-3">
              My Profile
            </h1>

            <p className="text-on-surface-variant">
              Manage your identity, trust signals, and public presence.
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Left Column */}
            <div className="md:col-span-8 flex flex-col gap-6">

              {/* Profile Card */}
              <section className="bg-white rounded-xl shadow-xl overflow-hidden">

                <div className="h-28 w-full bg-gradient-to-r from-primary to-primary-container"></div>

                <div className="px-8 pb-8 -mt-14 flex flex-col md:flex-row gap-6 items-start relative">

                  <div className="w-32 h-32 rounded-full bg-surface-container-high overflow-hidden shrink-0 shadow-lg border-4 border-white">
                    <img
                      alt="Profile"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuApTjvMX4aOxbeg-kVATSOmohoD3fT8t59achuUuzfBSqDoBKqsSg6VdomZwcyswbRQdo7I2yMxcm5LIkJ7SxbWeTCGTyOpn0IhRb_nnuDN2RZ_KMJPnlkSgYGe22-Mt_ThhxaCNAuE0InvWdlh8WDDGISa4eNdYnp1lL58Jp7m1yxzNSy1VNIstn1ZtDEVMBrGZ38Zc0jtDYF1a5bYStX2guEMUUvgSwdZdJLyMRjjJ9yW6M3UvGNT"
                    />

                    <div className="absolute bottom-1 left-24 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[16px]">
                        check
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 mt-2 md:mt-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface flex flex-wrap items-center gap-3 mb-2">
                      Alex Johnson

                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                        <span className="material-symbols-outlined text-[16px]">
                          verified
                        </span>
                        Verified
                      </span>

                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-surface text-on-surface-variant rounded-full text-sm font-medium border">
                        3 Active Listings
                      </span>
                    </h2>

                    <p className="text-lg text-on-surface-variant mb-6">
                      Computer Science, Class of '25
                    </p>

                    <button className="border-2 border-primary text-primary px-5 py-2.5 rounded-lg hover:bg-primary/5 font-semibold">
                      Edit Profile Picture
                    </button>
                  </div>

                </div>
              </section>

              {/* Public Bio */}
              <section className="bg-white rounded-xl p-6 shadow-sm border">

                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined bg-primary/10 p-1.5 rounded-lg">
                    edit_document
                  </span>
                  Public Bio
                </h3>

                <p className="text-on-surface-variant mb-4">
                  Hi! I'm Alex. I usually sell old textbooks and dorm essentials.
                  Always happy to meet up on central campus for exchanges.
                </p>

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface p-4"
                  placeholder="Tell the community about yourself..."
                  rows="3"
                />

                <div className="flex justify-end mt-4">
                  <button className="bg-primary text-white px-6 py-2 rounded-lg font-semibold">
                    Save Bio
                  </button>
                </div>
              </section>

              {/* My Listings */}
              <section className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-l-primary border-y border-r">

                <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined bg-primary/10 p-1.5 rounded-lg">
                    inventory_2
                  </span>
                  My Listings
                </h3>

                <p className="text-on-surface-variant mb-5">
                  You currently have 3 active listings visible to the community.
                </p>

                <button className="border-2 border-primary text-primary px-4 py-2.5 rounded-lg w-full font-semibold">
                  View All Active Listings
                </button>
              </section>

            </div>

            {/* Right Column */}
            <div className="md:col-span-4 flex flex-col gap-6">

              {/* Trust Score */}
              <section className="bg-primary text-white rounded-xl p-8 shadow-xl relative overflow-hidden">

                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined bg-white/20 p-1.5 rounded-lg">
                    shield_person
                  </span>
                  Trust Score
                </h3>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-extrabold">92</span>
                  <span className="text-lg opacity-80">/ 100</span>
                </div>

                <div className="bg-black/20 rounded-xl p-4">

                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">Profile Completeness</span>
                    <span className="font-semibold">80%</span>
                  </div>

                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full w-[80%]"></div>
                  </div>

                </div>

                <div className="mt-5">
                  <p className="font-semibold mb-3">
                    Improve your score:
                  </p>

                  <div className="flex items-center gap-2 bg-black/10 p-3 rounded-lg">
                    <span className="material-symbols-outlined">
                      add_circle
                    </span>
                    Verify phone number (+5 pts)
                  </div>
                </div>

              </section>

              {/* Account Security */}
              <section className="bg-white rounded-xl p-5 shadow-sm border">

                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined bg-primary/10 p-1.5 rounded-lg">
                    security
                  </span>
                  Account Security
                </h3>

                <div className="flex flex-col gap-5">

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Password</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Last changed 3 months ago
                      </p>
                    </div>

                    <button className="border px-4 py-2 rounded-md font-semibold">
                      Change
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Add an extra layer of security
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={twoFactor}
                      onChange={(e) => setTwoFactor(e.target.checked)}
                      className="w-5 h-5"
                    />
                  </div>

                </div>
              </section>

              {/* Campus Settings */}
              <section className="bg-white rounded-xl p-5 shadow-sm border">

                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined bg-primary/10 p-1.5 rounded-lg">
                    location_on
                  </span>
                  Campus Settings
                </h3>

                <div className="bg-surface border rounded-lg p-4 flex items-center justify-between mb-5">
                  <div>
                    <p className="text-primary mb-1 font-semibold">
                      Primary Campus
                    </p>
                    <p className="font-bold text-lg">
                      State University
                    </p>
                  </div>

                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2.5 rounded-full">
                    school
                  </span>
                </div>

                <button className="w-full border-2 border-primary text-primary px-4 py-2.5 rounded-lg font-semibold">
                  Change Campus
                </button>

              </section>

            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

            {/* Recent Activity */}
            <section className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-l-primary border-y border-r">

              <h3 className="text-lg font-bold text-primary mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined bg-primary/10 p-1.5 rounded-lg">
                  history
                </span>
                Recent Activity
              </h3>

              <div className="space-y-5">

                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">
                      handshake
                    </span>
                  </div>

                  <div>
                    <p>
                      <span className="font-semibold">
                        Rented Sony A7III
                      </span>{' '}
                      from Sarah Jenkins
                    </p>

                    <p className="text-sm text-on-surface-variant mt-1">
                      Completed Oct 12 • 5 star review given
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">
                      outbox
                    </span>
                  </div>

                  <div>
                    <p>
                      <span className="font-semibold">
                        Lent Camping Tent
                      </span>{' '}
                      to Mike T.
                    </p>

                    <p className="text-sm text-on-surface-variant mt-1">
                      Returned Sep 28 • Earned +10 Trust
                    </p>
                  </div>
                </div>

              </div>

              <button className="text-primary mt-5 hover:underline font-semibold">
                View Full History
              </button>

            </section>

            {/* Notifications */}
            <section className="bg-white rounded-xl p-5 shadow-sm border">

              <h3 className="text-lg font-bold text-primary mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined bg-primary/10 p-1.5 rounded-lg">
                  notifications
                </span>
                Notifications
              </h3>

              <div className="space-y-5">

                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Message Alerts
                  </span>

                  <input
                    type="checkbox"
                    checked={messageAlerts}
                    onChange={(e) => setMessageAlerts(e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Rental Requests
                  </span>

                  <input
                    type="checkbox"
                    checked={rentalRequests}
                    onChange={(e) => setRentalRequests(e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Marketing Emails
                  </span>

                  <input
                    type="checkbox"
                    checked={marketingEmails}
                    onChange={(e) => setMarketingEmails(e.target.checked)}
                    className="w-5 h-5"
                  />
                </div>

              </div>
            </section>

          </div>

        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-outline-variant px-6 py-8">

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

            <div>
              <div className="font-headline text-lg font-bold text-primary mb-3">
                Academica Exchange
              </div>

              <p className="text-on-surface-variant text-sm">
                © 2026 Academica Exchange. Student-to-student marketplace.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <a href="#" className="text-on-surface-variant hover:text-primary">
                Terms of Service
              </a>
              <a href="#" className="text-on-surface-variant hover:text-primary">
                Privacy Policy
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <a href="#" className="text-on-surface-variant hover:text-primary">
                Campus Safety
              </a>
              <a href="#" className="text-on-surface-variant hover:text-primary">
                Support
              </a>
            </div>

            <div>
              <a href="#" className="text-on-surface-variant hover:text-primary">
                Institutional Partners
              </a>
            </div>

          </div>

        </footer>

      </div>
    </div>
  );
};