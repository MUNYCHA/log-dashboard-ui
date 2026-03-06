export const getLogLevelColor = (level, darkMode) => {
  switch(level?.toLowerCase()) {
    case 'error': return darkMode ? 'text-red-400 bg-red-400/10' : 'text-red-600 bg-red-100';
    case 'warn': return darkMode ? 'text-yellow-400 bg-yellow-400/10' : 'text-yellow-600 bg-yellow-100';
    case 'info': return darkMode ? 'text-blue-400 bg-blue-400/10' : 'text-blue-600 bg-blue-100';
    case 'debug': return darkMode ? 'text-purple-400 bg-purple-400/10' : 'text-purple-600 bg-purple-100';
    default: return darkMode ? 'text-gray-400 bg-gray-400/10' : 'text-gray-600 bg-gray-100';
  }
};

export const formatTimestamp = (timestamp) => {
  try {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  } catch {
    return timestamp;
  }
};

export const getServersForTopic = (topic, logsByTopic) => {
  if (!topic || !logsByTopic[topic]) return [];
  const servers = new Set(logsByTopic[topic].map(log => log.serverName));
  return Array.from(servers).sort();
};