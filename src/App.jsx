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

  const [topicSortMode, setTopicSortMode] = useState(() => readStoredSetting('logstream:topicSortMode', 'asc', (value) => (
    ['activity', 'asc', 'desc'].includes(value) ? value : 'asc'
  )));
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedTopic2, setSelectedTopic2] = useState(null);
  const [selectedServer2, setSelectedServer2] = useState(null);
  const [topicSearchTerm, setTopicSearchTerm] = useState('');
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
  const [terminalMode, setTerminalMode] = useState(() => readStoredSetting('logstream:terminalMode', false, (value) => value === 'true'));
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true
  ));

  // Which topics are currently displayed in log panels — these get full 500-log cap.
  // Non-viewed topics get a smaller cap (50) for sidebar info only.
  const viewedTopics = useMemo(
    () => [selectedTopic, selectedTopic2].filter(Boolean),
    [selectedTopic, selectedTopic2],
  );

  const { logsByTopic, topics, isConnected, isReconnecting, clearLogs, logRates, subscribe, sendFilter } = useWebSocket(config.ws.url, viewedTopics, getToken);
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
    window.localStorage.setItem('logstream:topicSortMode', topicSortMode);
  }, [topicSortMode]);

  useEffect(() => {
    window.localStorage.setItem('logstream:sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    window.localStorage.setItem('logstream:terminalMode', String(terminalMode));
  }, [terminalMode]);

  useEffect(() => {
    if (splitView && selectedTopic && selectedTopic2) {
      document.title = `${selectedTopic} | ${selectedTopic2} — LogStream`;
    } else if (selectedTopic) {
      document.title = `${selectedTopic} — LogStream`;
    } else {
      document.title = 'LogStream';
    }
  }, [selectedTopic, selectedTopic2, splitView]);

  // Extract topic-specific log arrays — these keep the same reference
  // unless that specific topic received new logs in the last flush.
  const topicLogs1 = logsByTopic[selectedTopic];
  const topicLogs2 = logsByTopic[selectedTopic2];

  // Refs to read current values in stable callbacks without re-creating them
  const splitViewRef = useRef(splitView);
  const activePanelRef = useRef(activePanel);
  useEffect(() => { splitViewRef.current = splitView; }, [splitView]);
  useEffect(() => { activePanelRef.current = activePanel; }, [activePanel]);

  // Auto-select the most active topic on first load (only if it has traffic).
  // If no topic has logs, leave unselected — user picks manually.
  // Uses a ref to avoid re-running once a pick has been made, and
  // queueMicrotask to fire immediately without being cancelled by effect cleanup.
  // Keep a light buffer for every topic so the sidebar's live activity matches
  // what the user can open in the panel. Viewed topics already get a larger cap.
  useEffect(() => {
    if (topics.length > 0) {
      subscribe(topics);
    }
  }, [topics, subscribe]);

  // ── Stable callbacks (useCallback prevents new refs every render) ──────
  const handleTopicSelect = useCallback((topic) => {
    setIsPaused1(false);
    setIsPaused2(false);

    if (splitViewRef.current && activePanelRef.current === 2) {
      setSelectedTopic2(topic);
      setSelectedServer2(null);
    } else {
      setSelectedTopic(topic);
      setSelectedServer(null);
    }
    // Clear server-side filters for the active panel (start fresh)
    const pid = splitViewRef.current && activePanelRef.current === 2 ? 2 : 1;
    sendFilter(null, pid);
    setTopicSearchTerm('');
    setSidebarOpen(false);
  }, [sendFilter]);

  const handleOpenSplit = useCallback(() => {
    setSelectedTopic2(null);
    setSelectedServer2(null);
    setSplitView(true);
    setActivePanel(2);
  }, []);

  const handleClosePanel2 = useCallback(() => {
    setSplitView(false);
    setSelectedTopic2(null);
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
        topics={topics}
        selectedTopic={activePanel === 2 && splitView ? selectedTopic2 : selectedTopic}
        onTopicSelect={handleTopicSelect}
        topicSearchTerm={topicSearchTerm}
        onTopicSearchChange={setTopicSearchTerm}
        topicSortMode={topicSortMode}
        onTopicSortModeChange={setTopicSortMode}
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
          topicLogs={topicLogs1}
          selectedTopic={selectedTopic}
          selectedServer={selectedServer}
          onServerSelect={setSelectedServer}
          onClearServer={clearServer1}
          onClearLogs={clearLogs}
          isConnected={isConnected}
          isReconnecting={isReconnecting}
          logRate={logRates[selectedTopic] || 0}
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
              topicLogs={topicLogs2}
              selectedTopic={selectedTopic2}
              selectedServer={selectedServer2}
              onServerSelect={setSelectedServer2}
              onClearServer={clearServer2}
              onClearLogs={clearLogs}
              isConnected={isConnected}
              isReconnecting={isReconnecting}
              logRate={logRates[selectedTopic2] || 0}
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
        topicSortMode={topicSortMode}
        onTopicSortModeChange={setTopicSortMode}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        terminalMode={terminalMode}
        onTerminalModeChange={setTerminalMode}
      />
    </div>
  );
}

