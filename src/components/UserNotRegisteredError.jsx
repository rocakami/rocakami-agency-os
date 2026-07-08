import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const UserNotRegisteredError = () => {
  const [email, setEmail] = useState('');
  const [isRocakami, setIsRocakami] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then((u) => {
        const e = u?.email || '';
        setEmail(e);
        setIsRocakami(e.toLowerCase().endsWith('@rocakami.com'));
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleRetry = () => {
    base44.auth.logout(window.location.href);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-orange-100">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Access Pending</h1>
          {checking ? (
            <p className="text-slate-600 mb-8">Checking your account…</p>
          ) : isRocakami ? (
            <>
              <p className="text-slate-600 mb-8">
                Hi {email.split('@')[0]}! Your <strong>@rocakami.com</strong> account hasn't been invited yet. Please ask your admin to send you an invite link, or try again after receiving one.
              </p>
              <div className="p-4 bg-slate-50 rounded-md text-sm text-slate-600">
                <p className="font-medium mb-1">Signed in as: {email}</p>
                <p>Once invited, sign back in with the same Google account.</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-slate-600 mb-8">
                Your account is <strong>pending admin approval</strong>. An administrator needs to approve your access before you can use this portal. Please contact your admin.
              </p>
              <div className="p-4 bg-slate-50 rounded-md text-sm text-slate-600">
                {email && <p className="font-medium mb-1">Signed in as: {email}</p>}
                <p>Once approved, sign back in with the same account.</p>
              </div>
            </>
          )}
          <button onClick={handleRetry} className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#1a3676] text-white text-sm font-medium rounded-lg hover:bg-[#152c61] transition-colors">
            Sign out & try again
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;