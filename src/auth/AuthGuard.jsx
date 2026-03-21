import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';

// Protects all routes — redirects to SSO login if no token present
const AuthGuard = ({ children }) => {
  const { token, loading, login } = useAuth();

  useEffect(() => {
    if (!loading && !token) {
      login();
    }
  }, [loading, token, login]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F0F]">
        <svg className="w-6 h-6 animate-spin text-[#8AB4F8]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!token) {
    // Redirecting to SSO — show nothing while browser navigates
    return null;
  }

  return children;
};

export default AuthGuard;
