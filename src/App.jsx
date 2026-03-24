import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { styles } from './constants/theme';
import { useWebSocket } from './hooks/useWebSocket';
import Sidebar from './components/sidebar';
import LogPanel from './components/log';
import SettingsDrawer from './components/settings';
import config from './config';

export default function App() {
  const [topicSortMode, setTopicSortMode] = useState(() => localStorage.getItem('topicSortMode') || 'asc');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedTopic2, setSelectedTopic2] = useState(null);
  const [selectedServer2, setSelectedServer2] = useState(null);
  const [topicSearchTerm, setTopicSearchTerm] = useState('');
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'system');
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [splitView, setSplitView] = useState(() => localStorage.getItem('splitView') === 'true');
  const [activePanel, setActivePanel] = useState(1);
  const [isPaused1, setIsPaused1] = useState(false);
  const [isPaused2, setIsPaused2] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const [timestampFormat, setTimestampFormat] = useState(() => localStorage.getItem('timestampFormat') || 'relative');
  const [showServerBadge, setShowServerBadge] = useState(() => localStorage.getItem('showServerBadge') !== 'false');
  const [showPath, setShowPath] = useState(() => localStorage.getItem('showPath') !== 'false');
  const [copyAlwaysVisible, setCopyAlwaysVisible] = useState(() => localStorage.getItem('copyAlwaysVisible') === 'true');
  const [logDensity, setLogDensity] = useState(() => localStorage.getItem('logDensity') || 'normal');
  const [showFilterBar, setShowFilterBar] = useState(() => localStorage.getItem('showFilterBar') !== 'false');
  const [showKeywordFilter, setShowKeywordFilter] = useState(() => localStorage.getItem('showKeywordFilter') !== 'false');
  const [showStatusBar, setShowStatusBar] = useState(() => localStorage.getItem('showStatusBar') !== 'false');
  const [showHeartbeat, setShowHeartbeat] = useState(() => localStorage.getItem('showHeartbeat') !== 'false');
  const [showActivityDot, setShowActivityDot] = useState(() => localStorage.getItem('showActivityDot') !== 'false');
  const [showLogRate, setShowLogRate] = useState(() => localStorage.getItem('showLogRate') !== 'false');

  // Which topics are currently displayed in log panels — these get full 500-log cap.
  // Non-viewed topics get a smaller cap (50) for sidebar info only.
  const viewedTopics = useMemo(
    () => [selectedTopic, selectedTopic2].filter(Boolean),
    [selectedTopic, selectedTopic2],
  );

  const { logsByTopic, topics, isConnected, isReconnecting, clearLogs, trimTopicBuffer, logRates, subscribe, sendFilter } = useWebSocket(config.ws.url, viewedTopics);
  const darkMode = themeMode === 'dark' || (themeMode === 'system' && systemDark);
  const theme = darkMode ? styles.dark : styles.light;

  // Extract topic-specific log arrays — these keep the same reference
  // unless that specific topic received new logs in the last flush.
  const topicLogs1 = logsByTopic[selectedTopic];
  const topicLogs2 = logsByTopic[selectedTopic2];

  // Refs to read current values in stable callbacks without re-creating them
  const splitViewRef = useRef(splitView);
  const activePanelRef = useRef(activePanel);
  const selectedTopic1Ref = useRef(selectedTopic);
  const selectedTopic2Ref = useRef(selectedTopic2);
  const topicsRef = useRef(topics);
  useEffect(() => { splitViewRef.current = splitView; }, [splitView]);
  useEffect(() => { activePanelRef.current = activePanel; }, [activePanel]);
  useEffect(() => { selectedTopic1Ref.current = selectedTopic; }, [selectedTopic]);
  useEffect(() => { selectedTopic2Ref.current = selectedTopic2; }, [selectedTopic2]);
  useEffect(() => { topicsRef.current = topics; }, [topics]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setSettingsOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => { localStorage.setItem('topicSortMode', topicSortMode); }, [topicSortMode]);
  useEffect(() => { localStorage.setItem('sidebarCollapsed', sidebarCollapsed); }, [sidebarCollapsed]);
  useEffect(() => { localStorage.setItem('splitView', splitView); }, [splitView]);
  useEffect(() => { localStorage.setItem('timestampFormat', timestampFormat); }, [timestampFormat]);
  useEffect(() => { localStorage.setItem('showServerBadge', showServerBadge); }, [showServerBadge]);
  useEffect(() => { localStorage.setItem('showPath', showPath); }, [showPath]);
  useEffect(() => { localStorage.setItem('copyAlwaysVisible', copyAlwaysVisible); }, [copyAlwaysVisible]);
  useEffect(() => { localStorage.setItem('logDensity', logDensity); }, [logDensity]);
  useEffect(() => { localStorage.setItem('showFilterBar', showFilterBar); }, [showFilterBar]);
  useEffect(() => { localStorage.setItem('showKeywordFilter', showKeywordFilter); }, [showKeywordFilter]);
  useEffect(() => { localStorage.setItem('showStatusBar', showStatusBar); }, [showStatusBar]);
  useEffect(() => { localStorage.setItem('showHeartbeat', showHeartbeat); }, [showHeartbeat]);
  useEffect(() => { localStorage.setItem('showActivityDot', showActivityDot); }, [showActivityDot]);
  useEffect(() => { localStorage.setItem('showLogRate', showLogRate); }, [showLogRate]);

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
      const previousTopic = selectedTopic2Ref.current;
      if (previousTopic && previousTopic !== topic) {
        trimTopicBuffer(previousTopic);
      }
      setSelectedTopic2(topic);
      setSelectedServer2(null);
    } else {
      const previousTopic = selectedTopic1Ref.current;
      if (previousTopic && previousTopic !== topic) {
        trimTopicBuffer(previousTopic);
      }
      setSelectedTopic(topic);
      setSelectedServer(null);
    }
    // Clear server-side filters for the active panel (start fresh)
    const pid = splitViewRef.current && activePanelRef.current === 2 ? 2 : 1;
    sendFilter(null, pid);
    setTopicSearchTerm('');
    setSidebarOpen(false);
  }, [sendFilter, trimTopicBuffer]);

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

  const setThemeModeAndPersist = useCallback((mode) => {
    setThemeMode(mode);
    localStorage.setItem('themeMode', mode);
  }, []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebarCollapsed = useCallback(() => setSidebarCollapsed((v) => !v), []);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const logCard = useMemo(
    () => ({
      showServerBadge,
      showPath,
      copyAlwaysVisible,
      logDensity,
      showFilterBar,
      showKeywordFilter,
      showStatusBar,
      showHeartbeat,
    }),
    [showServerBadge, showPath, copyAlwaysVisible, logDensity, showFilterBar, showKeywordFilter, showStatusBar, showHeartbeat],
  );

  const handleLogCardChange = useCallback((key, value) => {
    if (key === 'showServerBadge') setShowServerBadge(value);
    else if (key === 'showPath') setShowPath(value);
    else if (key === 'copyAlwaysVisible') setCopyAlwaysVisible(value);
    else if (key === 'logDensity') setLogDensity(value);
    else if (key === 'showFilterBar') setShowFilterBar(value);
    else if (key === 'showKeywordFilter') setShowKeywordFilter(value);
    else if (key === 'showStatusBar') setShowStatusBar(value);
    else if (key === 'showHeartbeat') setShowHeartbeat(value);
  }, []);

  const sidebarPrefs = useMemo(
    () => ({ showActivityDot, showLogRate }),
    [showActivityDot, showLogRate],
  );

  const handleSidebarPrefChange = useCallback((key, value) => {
    if (key === 'showActivityDot') setShowActivityDot(value);
    else if (key === 'showLogRate') setShowLogRate(value);
  }, []);

  const handleToggleSplitView = useCallback((value) => {
    if (value) {
      setSelectedTopic2(null);
      setSelectedServer2(null);
      setSplitView(true);
      setActivePanel(2);
    } else {
      setSplitView(false);
      setSelectedTopic2(null);
      setSelectedServer2(null);
      setActivePanel(1);
      setIsPaused2(false);
      sendFilter(null, 2);
    }
  }, [sendFilter]);

  const togglePause1 = useCallback(() => setIsPaused1((p) => !p), []);
  const togglePause2 = useCallback(() => setIsPaused2((p) => !p), []);

  const clearServer1 = useCallback(() => setSelectedServer(null), []);
  const clearServer2 = useCallback(() => setSelectedServer2(null), []);

  const setActive1 = useCallback(() => setActivePanel(1), []);
  const setActive2 = useCallback(() => setActivePanel(2), []);

  return (
    <div className={`flex h-screen overflow-hidden ${theme.background} ${theme.text} transition-colors duration-200 p-2 gap-2`}>
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
        sidebarPrefs={sidebarPrefs}
      />

      <div className="flex flex-1 min-w-0 overflow-hidden gap-2">
        {/* Panel 1 */}
        <LogPanel
          key={`panel-1-${selectedTopic ?? 'none'}`}
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
          timestampFormat={timestampFormat}
          logCard={logCard}
          onOpenSidebar={openSidebar}
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
              key={`panel-2-${selectedTopic2 ?? 'none'}`}
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
              timestampFormat={timestampFormat}
          logCard={logCard}
              onOpenSidebar={openSidebar}
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

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={closeSettings}
        darkMode={darkMode}
        themeMode={themeMode}
        onThemeModeChange={setThemeModeAndPersist}
        topicSortMode={topicSortMode}
        onTopicSortModeChange={setTopicSortMode}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        splitView={splitView}
        onSplitViewToggle={handleToggleSplitView}
        timestampFormat={timestampFormat}
        onTimestampFormatChange={setTimestampFormat}
        logCard={logCard}
        onLogCardChange={handleLogCardChange}
        sidebarPrefs={sidebarPrefs}
        onSidebarPrefChange={handleSidebarPrefChange}
      />
    </div>
  );
}

