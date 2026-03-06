import React, { useState } from 'react';
import { styles } from './constants/theme';
import { useWebSocket } from './hooks/useWebSocket';
import Sidebar from './components/Sidebar';
import LogPanel from './components/LogPanel';
// Remove ThemeToggle import from here since it's now in LogPanel
// import ThemeToggle from './components/ThemeToggle';

export default function App() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [topicSearchTerm, setTopicSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const { logsByTopic, topics, clearLogs } = useWebSocket("ws://localhost:8080/ws/logs");
  const theme = darkMode ? styles.dark : styles.light;

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setSelectedServer(null);
    setTopicSearchTerm("");
  };

  const handleServerSelect = (server) => {
    setSelectedServer(server);
  };

  const handleClearServer = () => {
    setSelectedServer(null);
  };

  return (
    <div className={`flex h-screen ${theme.background} ${theme.text} transition-colors duration-200`}>
      {/* Remove the standalone ThemeToggle from here */}
      {/* <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} /> */}
      
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
        onServerSelect={handleServerSelect}
        onClearServer={handleClearServer}
        onClearLogs={clearLogs}
        theme={theme}
        darkMode={darkMode}
        onThemeToggle={() => setDarkMode(!darkMode)} // Add this line
      />
    </div>
  );
}