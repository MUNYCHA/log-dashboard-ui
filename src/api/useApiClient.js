import { useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { createClient } from './client';
import config from '../config';

/**
 * Returns memoized API clients for each base URL.
 * Re-creates clients when the token changes (login/logout).
 * Components and hooks import this instead of calling fetch directly.
 */
export const useApiClient = () => {
  const { token, logout } = useAuth();

  const storageClient = useMemo(() => createClient({
    baseUrl: config.storageApiUrl,
    token,
    onUnauthorized: logout,
  }), [token, logout]);

  const logsClient = useMemo(() => createClient({
    baseUrl: config.httpBaseUrl,
    token,
    onUnauthorized: logout,
  }), [token, logout]);

  return { storageClient, logsClient };
};
