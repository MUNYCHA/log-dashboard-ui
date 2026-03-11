import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { styles } from './constants/theme';
import { useWebSocket } from './hooks/useWebSocket';
import Sidebar from './components/sidebar';
import LogPanel from './components/log';
import config from './config';

export default function App() {
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

  // Which topics are currently displayed in log panels — these get full 500-log cap.
  // Non-viewed topics get a smaller cap (50) for sidebar info only.
  const viewedTopics = useMemo(
    () => [selectedTopic, selectedTopic2].filter(Boolean),
    [selectedTopic, selectedTopic2],
  );

  const { logsByTopic, topics, isConnected, isReconnecting, clearLogs, logRates, topicServers, subscribe, sendFilter, filterAck } = useWebSocket(config.ws.url, viewedTopics);
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
  useEffect(() => {
    if (selectedTopic) return;
    const rateEntries = Object.entries(logRates);
    if (topics.length > 0 && rateEntries.length > 0) {
      const best = rateEntries.sort((a, b) => b[1] - a[1])[0];
      if (best && best[1] > 0) {
        const pick = best[0];
        const id = setTimeout(() => setSelectedTopic(pick), 0);
        return () => clearTimeout(id);
      }
    }
  }, [topics, logRates, selectedTopic]);

  // Subscribe only to topics the user is actively viewing
  useEffect(() => {
    if (viewedTopics.length > 0) {
      subscribe(viewedTopics);
    }
  }, [viewedTopics, subscribe]);

  // ── Stable callbacks (useCallback prevents new refs every render) ──────
  const handleTopicSelect = useCallback((topic) => {
    if (splitViewRef.current && activePanelRef.current === 2) {
      // Clear old topic's logs before switching
      const prev = selectedTopic2Ref.current;
      if (prev && prev !== topic) clearLogs(prev);
      setSelectedTopic2(topic);
      setSelectedServer2(null);
    } else {
      // Clear old topic's logs before switching
      const prev = selectedTopic1Ref.current;
      if (prev && prev !== topic) clearLogs(prev);
      setSelectedTopic(topic);
      setSelectedServer(null);
    }
    // Clear server-side filters for the new topic (start fresh)
    sendFilter(null);
    setTopicSearchTerm('');
    setSidebarOpen(false);
  }, [clearLogs, sendFilter]);

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
  }, []);

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
    <div className={`flex h-screen overflow-hidden ${theme.background} ${theme.text} transition-colors duration-200`}>
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
        theme={theme}
        darkMode={darkMode}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        logRates={logRates}
        topicServers={topicServers}
        collapsed={sidebarCollapsed}
        onCollapse={toggleSidebarCollapsed}
      />

      <div className="flex flex-1 min-w-0 overflow-hidden">
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
          onThemeToggle={toggleDarkMode}
          onOpenSidebar={openSidebar}
          splitView={splitView}
          onOpenSplit={handleOpenSplit}
          sendFilter={sendFilter}
          filterAck={filterAck}
          panelId={1}
          isPaused={isPaused1}
          togglePause={togglePause1}
          isActivePanel={!splitView || activePanel === 1}
          onSetActive={setActive1}
        />

        {/* Panel 2 — split view only */}
        {splitView && (
          <>
            <div className={`w-px flex-shrink-0 ${darkMode ? 'bg-gray-800/30' : 'bg-indigo-200/40'}`} />
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
              onThemeToggle={toggleDarkMode}
              onOpenSidebar={openSidebar}
              splitView={splitView}
              onOpenSplit={handleOpenSplit}
              sendFilter={sendFilter}
              filterAck={filterAck}
              isPaused={isPaused2}
              togglePause={togglePause2}
              isActivePanel={activePanel === 2}
              onSetActive={setActive2}
              onClosePanel={handleClosePanel2}
            />
          </>
        )}
      </div>
    </div>
  );
}
