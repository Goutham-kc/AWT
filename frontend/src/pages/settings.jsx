import React, { useState } from 'react';

export const Settings = () => {
  const [fullName, setFullName] = useState('Alex Chen');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [campus, setCampus] = useState('NYU');
  const [nearbyCampuses, setNearbyCampuses] = useState(true);

  const [notifications, setNotifications] = useState({
    directMessagesEmail: true,
    directMessagesPush: true,
    bookingEmail: true,
    bookingPush: true,
    referralEmail: true,
    referralPush: false,
  });

  const [twoFactor, setTwoFactor] = useState(false);
  const [message, setMessage] = useState('');

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage('');
    }, 2500);
  };

  const handleNotificationChange = (name) => {
    setNotifications((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <main className="flex-grow bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-6">
              <h2 className="text-xl font-bold mb-5">Settings</h2>

              <nav className="space-y-2">
                <a
                  href="#account"
                  className="block px-4 py-3 rounded-xl bg-slate-100 font-medium"
                >
                  Account
                </a>

                <a
                  href="#campus"
                  className="block px-4 py-3 rounded-xl hover:bg-slate-100"
                >
                  Campus Preferences
                </a>

                <a
                  href="#notifications"
                  className="block px-4 py-3 rounded-xl hover:bg-slate-100"
                >
                  Notifications
                </a>

                <a
                  href="#privacy"
                  className="block px-4 py-3 rounded-xl hover:bg-slate-100"
                >
                  Privacy & Security
                </a>

                <a
                  href="#payments"
                  className="block px-4 py-3 rounded-xl hover:bg-slate-100"
                >
                  Payment & Payouts
                </a>
              </nav>

              <div className="mt-8 p-4 rounded-xl bg-orange-50 border border-orange-100">
                <p className="text-sm text-slate-500">Referral Credits</p>
                <p className="text-2xl font-bold mt-1">₹45.00</p>
              </div>
            </div>
          </aside>

          {/* Main Settings */}
          <section className="lg:col-span-3 space-y-8">

            {/* Account */}
            <div
              id="account"
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <h2 className="text-2xl font-bold">Account</h2>
              <p className="text-slate-500 mt-1 mb-6">
                Manage your personal account information.
              </p>

              <div className="flex items-center gap-5 mb-8">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6sJ0bY0JXQ0v7Q"
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow"
                />

                <button
                  onClick={() => showMessage('Profile photo option selected')}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
                >
                  Change Photo
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    College Email
                  </label>

                  <div className="flex gap-3">
                    <input
                      type="email"
                      value="alex.chen@university.edu"
                      disabled
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500"
                    />

                    <span className="flex items-center px-4 rounded-xl bg-green-50 text-green-700 font-medium">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      New Password
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                </div>

                <button
                  onClick={() => showMessage('Account changes saved')}
                  className="px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Campus Preferences */}
            <div
              id="campus"
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <h2 className="text-2xl font-bold">Campus Preferences</h2>
              <p className="text-slate-500 mt-1 mb-6">
                Choose the campuses you want to discover.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Primary Campus
                </label>

                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="NYU">NYU</option>
                  <option value="Columbia">Columbia</option>
                  <option value="Fordham">Fordham</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-slate-200">
                <div>
                  <p className="font-semibold">Discover Nearby Campuses</p>
                  <p className="text-sm text-slate-500">
                    Show listings from nearby campuses.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={nearbyCampuses}
                  onChange={() => setNearbyCampuses(!nearbyCampuses)}
                  className="w-5 h-5 accent-orange-500"
                />
              </div>

              <button
                onClick={() => showMessage('Campus preferences saved')}
                className="mt-4 px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600"
              >
                Save Changes
              </button>
            </div>

            {/* Notifications */}
            <div
              id="notifications"
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <h2 className="text-2xl font-bold">Notifications</h2>
              <p className="text-slate-500 mt-1 mb-6">
                Choose how you want to receive notifications.
              </p>

              <div className="space-y-6">

                <div>
                  <p className="font-semibold mb-3">Direct Messages</p>

                  <div className="flex gap-8">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notifications.directMessagesEmail}
                        onChange={() =>
                          handleNotificationChange('directMessagesEmail')
                        }
                        className="accent-orange-500"
                      />
                      Email
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notifications.directMessagesPush}
                        onChange={() =>
                          handleNotificationChange('directMessagesPush')
                        }
                        className="accent-orange-500"
                      />
                      Push
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-semibold mb-3">
                    Booking & Transaction Updates
                  </p>

                  <div className="flex gap-8">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notifications.bookingEmail}
                        onChange={() =>
                          handleNotificationChange('bookingEmail')
                        }
                        className="accent-orange-500"
                      />
                      Email
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notifications.bookingPush}
                        onChange={() =>
                          handleNotificationChange('bookingPush')
                        }
                        className="accent-orange-500"
                      />
                      Push
                    </label>
                  </div>
                </div>

                <div>
                  <p className="font-semibold mb-3">
                    Referral & Credit Alerts
                  </p>

                  <div className="flex gap-8">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notifications.referralEmail}
                        onChange={() =>
                          handleNotificationChange('referralEmail')
                        }
                        className="accent-orange-500"
                      />
                      Email
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notifications.referralPush}
                        onChange={() =>
                          handleNotificationChange('referralPush')
                        }
                        className="accent-orange-500"
                      />
                      Push
                    </label>
                  </div>
                </div>

              </div>

              <button
                onClick={() => showMessage('Notification settings saved')}
                className="mt-6 px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600"
              >
                Save Changes
              </button>
            </div>

            {/* Privacy & Security */}
            <div
              id="privacy"
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <h2 className="text-2xl font-bold">Privacy & Security</h2>
              <p className="text-slate-500 mt-1 mb-6">
                Protect your account and manage active sessions.
              </p>

              <div className="flex items-center justify-between py-5 border-b border-slate-200">
                <div>
                  <p className="font-semibold">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-500">
                    Add an additional layer of security.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={() => setTwoFactor(!twoFactor)}
                  className="w-5 h-5 accent-orange-500"
                />
              </div>

              <div className="py-5">
                <h3 className="font-semibold mb-4">Active Sessions</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                    <div>
                      <p className="font-medium">MacBook Pro</p>
                      <p className="text-sm text-slate-500">
                        Current session
                      </p>
                    </div>

                    <span className="text-sm text-green-600 font-medium">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                    <div>
                      <p className="font-medium">iPhone 15</p>
                      <p className="text-sm text-slate-500">
                        Last active recently
                      </p>
                    </div>

                    <button
                      onClick={() => showMessage('Session logged out')}
                      className="text-sm text-red-600 font-medium"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => showMessage('All other sessions logged out')}
                  className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50"
                >
                  Log Out of All Other Sessions
                </button>
              </div>
            </div>

            {/* Payment & Payouts */}
            <div
              id="payments"
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <h2 className="text-2xl font-bold">Payment & Payouts</h2>
              <p className="text-slate-500 mt-1 mb-6">
                Manage your linked payment methods.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-semibold">Debit Card</p>
                    <p className="text-sm text-slate-500">
                      •••• 4242
                    </p>
                  </div>

                  <button
                    onClick={() => showMessage('Card management selected')}
                    className="text-orange-600 font-medium"
                  >
                    Manage
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-semibold">Bank Account</p>
                    <p className="text-sm text-slate-500">
                      •••• 1234
                    </p>
                  </div>

                  <button
                    onClick={() => showMessage('Bank account management selected')}
                    className="text-orange-600 font-medium"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>

            {/* Account Management */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-2xl font-bold">Account Management</h2>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => showMessage('Data download requested')}
                  className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50"
                >
                  Download My Data
                </button>

                <button
                  onClick={() => showMessage('Deactivate account selected')}
                  className="px-5 py-3 rounded-xl border border-orange-300 text-orange-600"
                >
                  Deactivate Account
                </button>

                <button
                  onClick={() => showMessage('Delete account selected')}
                  className="px-5 py-3 rounded-xl border border-red-300 text-red-600"
                >
                  Delete Account
                </button>
              </div>
            </div>

          </section>
        </div>
      </div>

      {/* Toast Message */}
      {message && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg">
          {message}
        </div>
      )}
    </main>
  );
};

export default Settings;