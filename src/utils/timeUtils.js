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
