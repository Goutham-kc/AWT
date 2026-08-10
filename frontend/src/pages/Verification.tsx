import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const Verification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailState = location.state?.email || '';

  const [email, setEmail] = useState(emailState);
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!emailState) {
      setErrorMsg('No email provided. Please enter your email manually.');
    }
  }, [emailState]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'OTP Verification failed');
      }

      setSuccessMsg(`${data.message} Redirecting to login...`);
      setTimeout(() => {
        navigate('/marketplace');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-container-low">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl border border-outline-variant shadow-md">
        <div>
          <h2 className="mt-2 text-center text-3xl font-headline font-bold text-primary">
            Verification Pending
          </h2>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            Please enter the 6-digit OTP code sent to your email
          </p>
        </div>

        {errorMsg && (
          <div className="bg-error-container/20 border border-error-red text-error-red p-3 rounded-lg text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-success-green/20 border border-success-green text-success-green p-3 rounded-lg text-sm font-semibold">
            {successMsg}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleVerifyOTP}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Email Address</label>
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
              <label className="block text-sm font-semibold text-on-surface mb-1">6-Digit OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-2 text-center tracking-widest font-mono border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-sm text-body-lg transition-all duration-200"
                placeholder="000000"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-white font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors duration-200 shadow-sm font-bold disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};
