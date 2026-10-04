import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [homeCampus, setHomeCampus] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name,
          email,
          password,
          institution,
          homeCampus,
          referredBy: referredBy || undefined
        })
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Successful signup, redirect to verification pending with OTP
      navigate('/verify', { state: { email, otp: data.otp } });
    } catch (err) {
      if (err.name === 'AbortError') {
        setErrorMsg('Server took too long to respond. Please ensure the backend is running.');
      } else {
        setErrorMsg(err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-container-low">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl border border-outline-variant shadow-md">
        <div>
          <h2 className="mt-2 text-center text-3xl font-headline font-bold text-primary">
            Create Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            Join the verified peer-to-peer campus rental community
          </p>
        </div>

        {errorMsg && (
          <div className="bg-error-container/20 border border-error-red text-error-red p-3 rounded-lg text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSignUpSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-sm text-body-sm transition-all duration-200"
                placeholder="e.g. Goutham K C"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">College Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-sm text-body-sm transition-all duration-200"
                placeholder="e.g. yourname@tkmce.ac.in"
                required
              />
              <span className="text-[11px] text-outline mt-1 block">
                Only @tkmce.ac.in email addresses are accepted
              </span>
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

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">College/Institution</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-sm text-body-sm transition-all duration-200"
                placeholder="e.g. MIT"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Home Campus</label>
              <input
                type="text"
                value={homeCampus}
                onChange={(e) => setHomeCampus(e.target.value)}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-sm text-body-sm transition-all duration-200"
                placeholder="e.g. Main Campus"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Referral Code (Optional)</label>
              <input
                type="text"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-sm text-body-sm transition-all duration-200"
                placeholder="e.g. ANDRE-123"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-white font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors duration-200 shadow-sm font-bold disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="text-center text-sm text-on-surface-variant mt-4">
          Already verified? <span className="text-primary font-bold cursor-pointer hover:underline">Log In above</span>
        </div>
      </div>
    </div>
  );
};
