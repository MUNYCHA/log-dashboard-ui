import React, { useState, useEffect, useCallback } from 'react';
import config from '../config';
import userManager from './authService';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => config.sso.enabled);

  useEffect(() => {
    if (!config.sso.enabled) return;

    const init = async () => {
      try {
        // Handle redirect back from Keycloak (URL contains ?code=&state=)
        if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
          const loggedInUser = await userManager.signinRedirectCallback();
          setUser(loggedInUser);
          // Clean the OIDC params from the URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          // Check for an existing valid session
          const existingUser = await userManager.getUser();
          if (existingUser && !existingUser.expired) {
            setUser(existingUser);
          } else {
            // No valid session — auto-redirect to Keycloak
            await userManager.signinRedirect();
            return;
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        // Clear any corrupt state and let the user log in again
        await userManager.clearStaleState();
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = useCallback(() => {
    userManager.signinRedirect();
  }, []);

  const logout = useCallback(() => {
    userManager.signoutRedirect();
  }, []);

  const getToken = useCallback(async () => {
    if (!config.sso.enabled) return null;
    let currentUser = await userManager.getUser();
    // Silently refresh if token is expired or about to expire (within 30s)
    if (!currentUser || currentUser.expired || currentUser.expires_in < 30) {
      try {
        currentUser = await userManager.signinSilent();
        setUser(currentUser);
      } catch {
        // Silent refresh failed — redirect to login
        userManager.signinRedirect();
        return null;
      }
    }
    return currentUser?.access_token ?? null;
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !config.sso.enabled || (user !== null && !user.expired),
    login,
    logout,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
