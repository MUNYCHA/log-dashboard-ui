import React, { useState } from 'react';
import { styles } from './constants/theme';
import { useWebSocket } from './hooks/useWebSocket';
import Sidebar from './components/Sidebar';
import LogPanel from './components/LogPanel';
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

  const { logsByTopic, topics, isConnected, isReconnecting, clearLogs, isPaused, togglePause, logRates } = useWebSocket(config.ws.url);
  const theme = darkMode ? styles.dark : styles.light;

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

  const handleToggleSplitView = () => {
    setSplitView((v) => !v);
    setActivePanel(1);
  };

  const sharedProps = {
    logsByTopic,
    isConnected,
    isReconnecting,
    isPaused,
    togglePause,
    logRates,
    theme,
    darkMode,
    onThemeToggle: () => setDarkMode((d) => !d),
    onOpenSidebar: () => setSidebarOpen(true),
    splitView,
    onToggleSplitView: handleToggleSplitView,
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
          isActivePanel={!splitView || activePanel === 1}
          onSetActive={() => setActivePanel(1)}
        />

        {/* Panel 2 — split view only */}
        {splitView && (
          <>
            <div className={`w-px flex-shrink-0 ${theme.border}`} style={{ background: 'currentColor', opacity: 0.2 }} />
            <LogPanel
              {...sharedProps}
              selectedTopic={selectedTopic2}
              selectedServer={selectedServer2}
              onServerSelect={setSelectedServer2}
              onClearServer={() => setSelectedServer2(null)}
              onClearLogs={clearLogs}
              panelId={2}
              isActivePanel={activePanel === 2}
              onSetActive={() => setActivePanel(2)}
            />
          </>
        )}
      </div>
    </div>
  );
}
