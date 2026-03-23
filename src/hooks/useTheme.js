import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'theme-mode';

const getSystemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export const useTheme = () => {
  const [themeMode, setThemeModeState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'system'
  );
  const [systemDark, setSystemDark] = useState(getSystemDark);

  // Always listen for OS theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const darkMode =
    themeMode === 'dark' ? true :
    themeMode === 'light' ? false :
    systemDark;

  const setThemeMode = useCallback((mode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setThemeModeState(mode);
  }, []);

  return { themeMode, darkMode, setThemeMode };
};
