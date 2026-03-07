import React, { useState } from 'react';
import { styles } from './constants/theme';
import { useWebSocket } from './hooks/useWebSocket';
import Sidebar from './components/Sidebar';
import LogPanel from './components/LogPanel';
import config from './config';

export default function App() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [topicSearchTerm, setTopicSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  const { logsByTopic, topics, isConnected, clearLogs } = useWebSocket(config.ws.url);
  const theme = darkMode ? styles.dark : styles.light;

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setSelectedServer(null);
    setTopicSearchTerm('');
  };

  return (
    <div className={`flex h-screen ${theme.background} ${theme.text} transition-colors duration-200`}>
      <Sidebar
        topics={topics}
        logsByTopic={logsByTopic}
        selectedTopic={selectedTopic}
        onTopicSelect={handleTopicSelect}
        topicSearchTerm={topicSearchTerm}
        onTopicSearchChange={setTopicSearchTerm}
        theme={theme}
        darkMode={darkMode}
      />

      <LogPanel
        selectedTopic={selectedTopic}
        logsByTopic={logsByTopic}
        selectedServer={selectedServer}
        onServerSelect={setSelectedServer}
        onClearServer={() => setSelectedServer(null)}
        onClearLogs={clearLogs}
        isConnected={isConnected}
        theme={theme}
        darkMode={darkMode}
        onThemeToggle={() => setDarkMode((d) => !d)}
      />
    </div>
  );
}
