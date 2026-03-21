import { useState, useEffect, useCallback } from 'react';
import config from '../config';

export const STORAGE_REFRESH_INTERVAL_MS = 30_000;

export const useServerStorage = (token = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${config.storageApiUrl}/api/server-storage-usage/latest`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, STORAGE_REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  return { data, loading, error, lastUpdated, refresh: fetchData };
};
