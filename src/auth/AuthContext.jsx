import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import config from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore token from sessionStorage (survives page refresh, not new tab)
  useEffect(() => {
    const stored = sessionStorage.getItem('auth_token');
    const storedUser = sessionStorage.getItem('auth_user');
    if (stored) {
      setToken(stored);
      setUser(storedUser ? JSON.parse(storedUser) : null);
    }
    setLoading(false);
  }, []);

  // Redirect browser to SSO login page
  const login = useCallback(() => {
    // TODO: Replace with actual SSO authorization URL and params
    // Typical OIDC: ?response_type=code&client_id=...&redirect_uri=...&scope=openid profile
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.sso.clientId,
      redirect_uri: config.sso.redirectUri,
      scope: 'openid profile email',
    });
    window.location.href = `${config.sso.loginUrl}?${params}`;
  }, []);

  // Called by CallbackPage after exchanging the code for a token
  const handleCallback = useCallback((authToken, authUser) => {
    setToken(authToken);
    setUser(authUser ?? null);
    sessionStorage.setItem('auth_token', authToken);
    if (authUser) sessionStorage.setItem('auth_user', JSON.stringify(authUser));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    // TODO: Redirect to SSO logout URL if required
    // window.location.href = config.sso.logoutUrl;
    window.location.href = '/';
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, handleCallback }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
