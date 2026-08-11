import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';



export const Referrals = () => {
  const { token } = useApp();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferralSummary = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/referrals/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setSummary(data);
        }
      } catch (err) {
        console.error('Failed to load referral details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReferralSummary();
  }, [token]);

  const handleCopyLink = () => {
    if (!summary?.referralCode) return;
    const link = `${window.location.origin}/signup?ref=${summary.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="text-center py-12 text-outline">Loading referrals data...</div>;
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-container-margin py-stack-lg space-y-stack-lg">
      <div className="bg-white p-8 rounded-xl border border-outline-variant shadow-sm text-center max-w-2xl mx-auto space-y-6">
        <div>
          <span className="material-symbols-outlined text-5xl text-primary mb-2">stars</span>
          <h2 className="font-headline text-3xl font-bold text-primary">Referral Program</h2>
          <p className="text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
            Invite classmates to register on Academica Exchange! You both receive <strong>50 credits</strong> when they verify their email.
          </p>
        </div>

        {summary?.referralCode ? (
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant space-y-4 max-w-md mx-auto">
            <div>
              <span className="text-xs font-semibold text-outline uppercase">Your Referral Code</span>
              <div className="text-2xl font-bold text-primary tracking-wider mt-1">{summary.referralCode}</div>
            </div>

            <button 
              onClick={handleCopyLink}
              className="w-full py-2 bg-primary text-white font-label-md text-label-md rounded-lg hover:bg-primary-container font-bold shadow-sm transition-all"
            >
              {copied ? 'Copied Link!' : 'Copy Invite Link'}
            </button>
          </div>
        ) : (
          <div className="text-outline text-sm">Please verify your account to unlock your referral code.</div>
        )}

        <div className="border-t border-outline-variant pt-6 grid grid-cols-2 gap-4 max-w-md mx-auto text-center">
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
            <div className="text-2xl font-bold text-primary">{summary?.referralCredits || 0}</div>
            <div className="text-xs text-outline font-semibold">Credits Balance</div>
          </div>
          <div className="p-3 bg-secondary/5 rounded-lg border border-secondary/10">
            <div className="text-2xl font-bold text-secondary">{summary?.inviteesCount || 0}</div>
            <div className="text-xs text-outline font-semibold">Friends Joined</div>
          </div>
        </div>
      </div>

      {/* Friends list */}
      <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm max-w-2xl mx-auto space-y-4">
        <h3 className="font-headline text-lg font-bold text-on-surface">Referred Classmates</h3>
        
        {summary?.invitees.length === 0 ? (
          <div className="text-center py-6 text-outline text-sm">No friends have registered with your link yet.</div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {summary?.invitees.map((friend, idx) => (
              <div key={idx} className="flex justify-between items-center py-3">
                <div>
                  <div className="font-semibold text-sm text-on-surface">{friend.name}</div>
                  <div className="text-xs text-outline">Joined: {new Date(friend.joinedAt).toLocaleDateString()}</div>
                </div>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${
                  friend.isVerified 
                    ? 'bg-success-green/10 text-success-green' 
                    : 'bg-outline-variant/30 text-outline'
                }`}>
                  {friend.isVerified ? 'Verified (Credits Issued)' : 'Unverified'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
