import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { styles } from './constants/theme';
import { useWebSocket } from './hooks/useWebSocket';
import Sidebar from './components/sidebar';
import LogPanel from './components/log';
import StorageDashboard from './components/storage';
import config from './config';

export default function App() {
  const [topicSortMode, setTopicSortMode] = useState('asc');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedTopic2, setSelectedTopic2] = useState(null);
  const [selectedServer2, setSelectedServer2] = useState(null);
  const [topicSearchTerm, setTopicSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [splitView, setSplitView] = useState(false);
  const [activePanel, setActivePanel] = useState(1);
  const [isPaused1, setIsPaused1] = useState(false);
  const [isPaused2, setIsPaused2] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('logs');

  // Which topics are currently displayed in log panels — these get full 500-log cap.
  // Non-viewed topics get a smaller cap (50) for sidebar info only.
  const viewedTopics = useMemo(
    () => [selectedTopic, selectedTopic2].filter(Boolean),
    [selectedTopic, selectedTopic2],
  );

  const { logsByTopic, topics, isConnected, isReconnecting, clearLogs, trimTopicBuffer, logRates, subscribe, sendFilter } = useWebSocket(config.ws.url, viewedTopics);
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

  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebarCollapsed = useCallback(() => setSidebarCollapsed((v) => !v), []);

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
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <div className="flex flex-1 min-w-0 overflow-hidden gap-2">
        {/* Storage view */}
        {currentView === 'storage' && (
          <StorageDashboard darkMode={darkMode} theme={theme} />
        )}

        {/* Log panels — hidden when storage view is active */}
        {currentView === 'logs' && (<>
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
          onThemeToggle={toggleDarkMode}
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
              onThemeToggle={toggleDarkMode}
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
        </>)}
      </div>
    </div>
  );
}

