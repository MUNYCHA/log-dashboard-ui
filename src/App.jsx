import React, { useState, useEffect } from 'react';
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

  const { logsByTopic, topics, isConnected, isReconnecting, clearLogs, logRates, subscribe, sendFilter, filterAck } = useWebSocket(config.ws.url);
  const theme = darkMode ? styles.dark : styles.light;

  // Subscribe to only the topics the user is viewing
  useEffect(() => {
    const activeTopics = [selectedTopic, selectedTopic2].filter(Boolean);
    if (activeTopics.length > 0) {
      subscribe(activeTopics);
    }
  }, [selectedTopic, selectedTopic2, subscribe]);

  const handleTopicSelect = (topic) => {
    if (splitView && activePanel === 2) {
      setSelectedTopic2(topic);
      setSelectedServer2(null);
    } else {
      setSelectedTopic(topic);
      setSelectedServer(null);
    }
    setTopicSearchTerm('');
    setSidebarOpen(false);
  };

  const handleOpenSplit = () => {
    setSelectedTopic2(null);
    setSelectedServer2(null);
    setSplitView(true);
    setActivePanel(2);
  };

  const handleClosePanel2 = () => {
    setSplitView(false);
    setSelectedTopic2(null);
    setSelectedServer2(null);
    setActivePanel(1);
    setIsPaused2(false);
  };

  const sharedProps = {
    logsByTopic,
    isConnected,
    isReconnecting,
    logRates,
    theme,
    darkMode,
    onThemeToggle: () => setDarkMode((d) => !d),
    onOpenSidebar: () => setSidebarOpen(true),
    splitView,
    onOpenSplit: handleOpenSplit,
    sendFilter,
    filterAck,
  };

  return (
    <div className={`flex h-screen overflow-hidden ${theme.background} ${theme.text} transition-colors duration-200`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        topics={topics}
        logsByTopic={logsByTopic}
        selectedTopic={activePanel === 2 && splitView ? selectedTopic2 : selectedTopic}
        onTopicSelect={handleTopicSelect}
        topicSearchTerm={topicSearchTerm}
        onTopicSearchChange={setTopicSearchTerm}
        theme={theme}
        darkMode={darkMode}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        logRates={logRates}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(v => !v)}
      />

      <div className="flex flex-1 min-w-0 overflow-hidden">
        {/* Panel 1 */}
        <LogPanel
          {...sharedProps}
          selectedTopic={selectedTopic}
          selectedServer={selectedServer}
          onServerSelect={setSelectedServer}
          onClearServer={() => setSelectedServer(null)}
          onClearLogs={clearLogs}
          panelId={1}
          isPaused={isPaused1}
          togglePause={() => setIsPaused1((p) => !p)}
          isActivePanel={!splitView || activePanel === 1}
          onSetActive={() => setActivePanel(1)}
        />

        {/* Panel 2 — split view only */}
        {splitView && (
          <>
            <div className={`w-px flex-shrink-0 ${darkMode ? 'bg-gray-800/30' : 'bg-indigo-200/40'}`} />
            <LogPanel
              {...sharedProps}
              selectedTopic={selectedTopic2}
              selectedServer={selectedServer2}
              onServerSelect={setSelectedServer2}
              onClearServer={() => setSelectedServer2(null)}
              onClearLogs={clearLogs}
              isPaused={isPaused2}
              togglePause={() => setIsPaused2((p) => !p)}
              isActivePanel={activePanel === 2}
              onSetActive={() => setActivePanel(2)}
              onClosePanel={handleClosePanel2}
            />
          </>
        )}
      </div>
    </div>
  );
}
