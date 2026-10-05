import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Settings = () => {
  const { user, token, updateUser, logout } = useApp();

  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [campus, setCampus] = useState('TKMCE Kollam');
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setCampus(user.institution || user.homeCampus || 'TKM College of Engineering');
    }
  }, [user]);

  const showToast = (text, error = false) => {
    setMessage(text);
    setIsError(error);
    setTimeout(() => {
      setMessage('');
      setIsError(false);
    }, 3000);
  };

  const handleNotificationChange = (name) => {
    setNotifications((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSaveAccount = async () => {
    if (!token) {
      showToast('Please log in first', true);
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      showToast('New passwords do not match', true);
      return;
    }

    if (newPassword && newPassword.length < 6) {
      showToast('New password must be at least 6 characters', true);
      return;
    }

    setLoading(true);
    try {
      const payload = { name: fullName };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update settings');
      }

      updateUser({ name: data.user.name });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Account changes saved successfully!');
    } catch (err) {
      showToast(err.message || 'Error updating settings', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your student credentials, security, and notification preferences.</p>
          </div>
          <Link
            to="/profile"
            className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">person</span>
            View Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-20 shadow-sm space-y-4">
              <h2 className="text-lg font-bold">Preferences</h2>

              <nav className="space-y-1 text-sm font-medium">
                <a
                  href="#account"
                  className="block px-4 py-2.5 rounded-xl bg-slate-100 text-primary font-bold transition-colors"
                >
                  Account & Security
                </a>

                <a
                  href="#campus"
                  className="block px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  Campus Community
                </a>

                <a
                  href="#notifications"
                  className="block px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  Notifications
                </a>

                <a
                  href="#privacy"
                  className="block px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  Privacy & Sessions
                </a>
              </nav>

              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-xs text-green-700 font-medium">Available Referral Credits</p>
                <p className="text-2xl font-extrabold text-green-800 mt-1">₹{user?.referralCredits || 0}</p>
                <Link
                  to="/referrals"
                  className="inline-block mt-2 text-xs font-bold text-green-700 hover:underline"
                >
                  Invite Friends & Earn &rarr;
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Settings */}
          <section className="lg:col-span-3 space-y-8">

            {/* Account & Password */}
            <div
              id="account"
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900">Student Account</h2>
              <p className="text-slate-500 text-xs mt-1 mb-6">
                Manage your student identity and account access credentials.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Verified Institutional Email
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={user?.email || 'student@tkmce.ac.in'}
                      disabled
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-mono"
                    />
                    <span className="flex items-center px-3.5 py-1 rounded-xl bg-green-100 text-green-800 text-xs font-bold">
                      ✓ Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">College emails cannot be modified to maintain community trust.</p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Change Password (Optional)</h3>
                  
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password to verify"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveAccount}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-container text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Campus Preferences */}
            <div
              id="campus"
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900">Campus Preferences</h2>
              <p className="text-slate-500 text-xs mt-1 mb-6">
                Your campus marketplace discovery range.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Primary Campus
                </label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="TKM College of Engineering">TKM College of Engineering (Kollam)</option>
                  <option value="Main Campus">Main Campus</option>
                  <option value="Hostel Area">Hostel Area</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-4 border-t border-slate-200">
                <div>
                  <p className="font-semibold text-sm">Discover Campus Hostels</p>
                  <p className="text-xs text-slate-500">
                    Show listings from affiliated college dorms and campus hostels.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={nearbyCampuses}
                  onChange={() => setNearbyCampuses(!nearbyCampuses)}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </div>

              <button
                onClick={() => showToast('Campus preferences saved')}
                className="mt-4 px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
              >
                Save Campus Preference
              </button>
            </div>

            {/* Notifications */}
            <div
              id="notifications"
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900">Notification Alerts</h2>
              <p className="text-slate-500 text-xs mt-1 mb-6">
                Choose how you receive booking, chat, and rental updates.
              </p>

              <div className="space-y-5 text-sm">
                <div>
                  <p className="font-semibold mb-2">Direct Messages</p>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.directMessagesEmail}
                        onChange={() => handleNotificationChange('directMessagesEmail')}
                        className="accent-primary"
                      />
                      Email alerts
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.directMessagesPush}
                        onChange={() => handleNotificationChange('directMessagesPush')}
                        className="accent-primary"
                      />
                      In-app alerts
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="font-semibold mb-2">Rental Requests & Confirmations</p>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.bookingEmail}
                        onChange={() => handleNotificationChange('bookingEmail')}
                        className="accent-primary"
                      />
                      Email alerts
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.bookingPush}
                        onChange={() => handleNotificationChange('bookingPush')}
                        className="accent-primary"
                      />
                      In-app alerts
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="font-semibold mb-2">Referral Rewards</p>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.referralEmail}
                        onChange={() => handleNotificationChange('referralEmail')}
                        className="accent-primary"
                      />
                      Email alerts
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={() => showToast('Notification preferences saved')}
                className="mt-6 px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
              >
                Save Notifications
              </button>
            </div>

            {/* Privacy & Security */}
            <div
              id="privacy"
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900">Privacy & Security</h2>
              <p className="text-slate-500 text-xs mt-1 mb-6">
                Institutional session safety and logout.
              </p>

              <div className="flex items-center justify-between py-4 border-b border-slate-200">
                <div>
                  <p className="font-semibold text-sm">Two-Factor Authentication (2FA)</p>
                  <p className="text-xs text-slate-500">
                    Require OTP verification on new browser sessions.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={twoFactor}
                  onChange={() => setTwoFactor(!twoFactor)}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </div>

              <div className="pt-6 flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Active Session</p>
                  <p className="text-xs text-slate-500">Logged in via verified browser token</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    showToast('Logged out of session');
                  }}
                  className="px-5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Log Out of Session
                </button>
              </div>
            </div>

          </section>
        </div>
      </div>

      {/* Toast Message */}
      {message && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-xl z-50 text-sm font-semibold animate-in fade-in ${
          isError ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
        }`}>
          {message}
        </div>
      )}
    </main>
  );
};

export default Settings;