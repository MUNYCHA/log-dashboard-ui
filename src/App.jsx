import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { styles } from './constants/theme';
import { useWebSocket } from './hooks/useWebSocket';
import Sidebar from './features/sidebar';
import LogPanel from './features/log-viewer';
import SettingsModal from './features/settings';
import config from './config';
import { useAuth } from './auth/useAuth';

const readStoredSetting = (key, fallback, parse = (value) => value) => {
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    return stored == null ? fallback : parse(stored);
  } catch {
    return fallback;
  }
};

export default function App() {
  const { isAuthenticated, isLoading, getToken } = useAuth();

  const [channelSortMode, setChannelSortMode] = useState(() => readStoredSetting('logstream:channelSortMode', 'asc', (value) => (
    ['activity', 'asc', 'desc'].includes(value) ? value : 'asc'
  )));
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel2, setSelectedChannel2] = useState(null);
  const [selectedServer2, setSelectedServer2] = useState(null);
  const [channelSearchTerm, setChannelSearchTerm] = useState('');
  const [themeMode, setThemeMode] = useState(() => readStoredSetting('logstream:themeMode', 'system', (value) => (
    ['light', 'dark', 'system'].includes(value) ? value : 'system'
  )));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [activePanel, setActivePanel] = useState(1);
  const [isPaused1, setIsPaused1] = useState(false);
  const [isPaused2, setIsPaused2] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => readStoredSetting('logstream:sidebarCollapsed', false, (value) => value === 'true'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [terminalMode, setTerminalMode] = useState(() => readStoredSetting('logstream:terminalMode', true, (value) => value === 'true'));
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true
  ));

  // Which channels are currently displayed in log panels — these get the large
  // raw buffer (rawBufferPerChannel, 2000 at default). Non-viewed channels keep a
  // small cap (100) so opening a channel shows instant backlog instead of a blank
  // panel; the sidebar itself uses only `channels` + `logRates`, not these logs.
  const viewedChannels = useMemo(
    () => [selectedChannel, selectedChannel2].filter(Boolean),
    [selectedChannel, selectedChannel2],
  );

  const { logsByChannel, channels, isConnected, isReconnecting, clearLogs, logRates, subscribe, sendFilter } = useWebSocket(config.ws.url, viewedChannels, getToken, isAuthenticated);
  const darkMode = themeMode === 'system' ? systemPrefersDark : themeMode === 'dark';
  const theme = darkMode ? styles.dark : styles.light;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => setSystemPrefersDark(event.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
    return () => {
      document.documentElement.style.colorScheme = '';
    };
  }, [darkMode]);

  useEffect(() => {
    window.localStorage.setItem('logstream:themeMode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    window.localStorage.setItem('logstream:channelSortMode', channelSortMode);
  }, [channelSortMode]);

  useEffect(() => {
    window.localStorage.setItem('logstream:sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    window.localStorage.setItem('logstream:terminalMode', String(terminalMode));
  }, [terminalMode]);

  useEffect(() => {
    if (splitView && selectedChannel && selectedChannel2) {
      document.title = `${selectedChannel} | ${selectedChannel2} — LogStream`;
    } else if (selectedChannel) {
      document.title = `${selectedChannel} — LogStream`;
    } else {
      document.title = 'LogStream';
    }
  }, [selectedChannel, selectedChannel2, splitView]);

  // Extract channel-specific log arrays — these keep the same reference
  // unless that specific channel received new logs in the last flush.
  const channelLogs1 = logsByChannel[selectedChannel];
  const channelLogs2 = logsByChannel[selectedChannel2];

  // Refs to read current values in stable callbacks without re-creating them
  const splitViewRef = useRef(splitView);
  const activePanelRef = useRef(activePanel);
  useEffect(() => { splitViewRef.current = splitView; }, [splitView]);
  useEffect(() => { activePanelRef.current = activePanel; }, [activePanel]);

  // Auto-select the most active channel on first load (only if it has traffic).
  // If no channel has logs, leave unselected — user picks manually.
  // Uses a ref to avoid re-running once a pick has been made, and
  // queueMicrotask to fire immediately without being cancelled by effect cleanup.
  // Keep a light buffer for every channel so the sidebar's live activity matches
  // what the user can open in the panel. Viewed channels already get a larger cap.
  useEffect(() => {
    if (channels.length > 0) {
      subscribe(channels);
    }
  }, [channels, subscribe]);

  // ── Stable callbacks (useCallback prevents new refs every render) ──────
  const handleChannelSelect = useCallback((channel) => {
    setIsPaused1(false);
    setIsPaused2(false);

    if (splitViewRef.current && activePanelRef.current === 2) {
      setSelectedChannel2(channel);
      setSelectedServer2(null);
    } else {
      setSelectedChannel(channel);
      setSelectedServer(null);
    }
    // Clear server-side filters for the active panel (start fresh)
    const pid = splitViewRef.current && activePanelRef.current === 2 ? 2 : 1;
    sendFilter(null, pid);
    setChannelSearchTerm('');
    setSidebarOpen(false);
  }, [sendFilter]);

  const handleOpenSplit = useCallback(() => {
    setSelectedChannel2(null);
    setSelectedServer2(null);
    setSplitView(true);
    setActivePanel(2);
  }, []);

  const handleClosePanel2 = useCallback(() => {
    setSplitView(false);
    setSelectedChannel2(null);
    setSelectedServer2(null);
    setActivePanel(1);
    setIsPaused2(false);
    sendFilter(null, 2); // clear panel 2's server-side filter
  }, [sendFilter]);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebarCollapsed = useCallback(() => setSidebarCollapsed((v) => !v), []);
  const openSettings = useCallback(() => {
    setSidebarOpen(false);
    setIsSettingsOpen(true);
  }, []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  const togglePause1 = useCallback(() => setIsPaused1((p) => !p), []);
  const togglePause2 = useCallback(() => setIsPaused2((p) => !p), []);

  const clearServer1 = useCallback(() => setSelectedServer(null), []);
  const clearServer2 = useCallback(() => setSelectedServer2(null), []);

  const setActive1 = useCallback(() => setActivePanel(1), []);
  const setActive2 = useCallback(() => setActivePanel(2), []);

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className={`flex h-screen overflow-hidden ${theme.background} ${theme.text} p-2 gap-2`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <Sidebar
        channels={channels}
        selectedChannel={activePanel === 2 && splitView ? selectedChannel2 : selectedChannel}
        onChannelSelect={handleChannelSelect}
        channelSearchTerm={channelSearchTerm}
        onChannelSearchChange={setChannelSearchTerm}
        channelSortMode={channelSortMode}
        onChannelSortModeChange={setChannelSortMode}
        theme={theme}
        darkMode={darkMode}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        logRates={logRates}
        collapsed={sidebarCollapsed}
        onCollapse={toggleSidebarCollapsed}
        onOpenSettings={openSettings}
      />

      <div className={`flex flex-1 min-w-0 gap-2 ${theme.background}`}>
        {/* Panel 1 */}
        <LogPanel
          channelLogs={channelLogs1}
          selectedChannel={selectedChannel}
          selectedServer={selectedServer}
          onServerSelect={setSelectedServer}
          onClearServer={clearServer1}
          onClearLogs={clearLogs}
          isConnected={isConnected}
          isReconnecting={isReconnecting}
          logRate={logRates[selectedChannel] || 0}
          theme={theme}
          darkMode={darkMode}
          terminalMode={terminalMode}
          onOpenSidebar={openSidebar}
          isSidebarOpen={sidebarOpen}
          splitView={splitView}
          onOpenSplit={handleOpenSplit}
          sendFilter={sendFilter}
          panelId={1}
          isPaused={isPaused1}
          togglePause={togglePause1}
          isActivePanel={!splitView || activePanel === 1}
          onSetActive={setActive1}
        />

        {/* Panel 2 — split view only */}
        {splitView && (
          <>
            <LogPanel
              channelLogs={channelLogs2}
              selectedChannel={selectedChannel2}
              selectedServer={selectedServer2}
              onServerSelect={setSelectedServer2}
              onClearServer={clearServer2}
              onClearLogs={clearLogs}
              isConnected={isConnected}
              isReconnecting={isReconnecting}
              logRate={logRates[selectedChannel2] || 0}
              theme={theme}
              darkMode={darkMode}
              terminalMode={terminalMode}
              onOpenSidebar={openSidebar}
              isSidebarOpen={sidebarOpen}
              splitView={splitView}
              onOpenSplit={handleOpenSplit}
              sendFilter={sendFilter}
              isPaused={isPaused2}
              togglePause={togglePause2}
              isActivePanel={activePanel === 2}
              onSetActive={setActive2}
              onClosePanel={handleClosePanel2}
              panelId={2}
            />
          </>
        )}
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        darkMode={darkMode}
        themeMode={themeMode}
        onThemeModeChange={setThemeMode}
        channelSortMode={channelSortMode}
        onChannelSortModeChange={setChannelSortMode}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        terminalMode={terminalMode}
        onTerminalModeChange={setTerminalMode}
      />
    </div>
  );
}
