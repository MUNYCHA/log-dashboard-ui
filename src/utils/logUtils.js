export const getLogLevelColor = (level, darkMode) => {
  switch(level?.toLowerCase()) {
    case 'error': return darkMode ? 'text-red-400 bg-red-500/10' : 'text-red-600 bg-red-50';
    case 'warn': return darkMode ? 'text-amber-400 bg-amber-500/10' : 'text-amber-600 bg-amber-50';
    case 'info': return darkMode ? 'text-sky-400 bg-sky-500/10' : 'text-sky-600 bg-sky-50';
    case 'debug': return darkMode ? 'text-violet-400 bg-violet-500/10' : 'text-violet-600 bg-violet-50';
    default: return darkMode ? 'text-gray-400 bg-gray-500/10' : 'text-gray-500 bg-gray-50';
  }
};

export const getRelativeTime = (timestamp, now) => {
  try {
    const ts = new Date(timestamp).getTime();
    if (!Number.isFinite(ts)) return '';
    const diff = Math.max(0, now - ts);
    if (diff < 10000) return 'just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  } catch {
    return '';
  }
};
