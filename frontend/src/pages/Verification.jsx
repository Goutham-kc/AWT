import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Verification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useApp();
  const emailState = location.state?.email || '';

  const [email, setEmail] = useState(emailState);
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!emailState) {
      setErrorMsg('No email provided. Please enter your @tkmce.ac.in email manually.');
    }
  }, [emailState]);

  const handleVerifyOTP = async (e) => {
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

      setSuccessMsg(`${data.message} Redirecting...`);

      // Auto-login: use the token and user returned from the backend
      if (data.token && data.user) {
        login(data.token, {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          institution: data.user.institution,
          homeCampus: data.user.homeCampus,
          referralCode: data.user.referralCode,
          referralCredits: data.user.referralCredits
        });
      }

      setTimeout(() => {
        navigate('/marketplace');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address first.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setResending(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }

      setSuccessMsg('A fresh verification code has been sent to your email.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-container-low">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl border border-outline-variant shadow-md">
        <div>
          <h2 className="mt-2 text-center text-3xl font-headline font-bold text-primary">
            Verification Pending
          </h2>
          <p className="mt-2 text-center text-sm text-on-surface-variant">
            Please enter the 6-digit OTP code sent to your @tkmce.ac.in email
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

        <form className="mt-6 space-y-4" onSubmit={handleVerifyOTP}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-sm text-body-sm transition-all duration-200"
                placeholder="e.g. yourname@tkmce.ac.in"
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
                placeholder="••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-white font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors duration-200 shadow-sm font-bold disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP & Log In'}
          </button>
        </form>

        <div className="text-center text-sm text-on-surface-variant pt-2 border-t border-outline-variant/50">
          Didn't receive the code?{' '}
          <button
            type="button"
            disabled={resending}
            onClick={handleResendOTP}
            className="text-primary font-bold hover:underline disabled:opacity-50 ml-1"
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};
