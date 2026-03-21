import { useState, useEffect, useCallback } from 'react';
import { storageApi } from '../api/storageApi';

export const STORAGE_REFRESH_INTERVAL_MS = 30_000;

export const useServerStorage = (client) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const json = await storageApi.getLatest(client);
      setData(json);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, STORAGE_REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  return { data, loading, error, lastUpdated, refresh: fetchData };
};
