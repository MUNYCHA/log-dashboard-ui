import config from '../config';

// Intern low-cardinality strings (topic, serverName, path). JSON.parse mints a
// fresh string copy per log, so thousands of logs hold thousands of duplicate
// copies of the same handful of values. Returning a shared reference for each
// distinct value collapses those duplicates to one allocation apiece. These
// fields have tiny, bounded cardinality so the cache itself stays small.
// message/timestamp are NOT interned — they are effectively unique per log.
const internCache = new Map();
const intern = (value) => {
  const cached = internCache.get(value);
  if (cached !== undefined) return cached;
  internCache.set(value, value);
  return value;
};

export const normalizeLogEvent = (value, nextId) => {
  if (!value || typeof value !== 'object') return null;

  const topic = typeof value.topic === 'string' ? value.topic.trim() : '';
  const serverName = typeof value.serverName === 'string' ? value.serverName : null;
  const path = typeof value.path === 'string' ? value.path : null;
  const timestamp = typeof value.timestamp === 'string' ? value.timestamp : null;
  const message = typeof value.message === 'string' ? value.message : null;

  if (!topic || serverName == null || path == null || timestamp == null || message == null) {
    return null;
  }

  const safeMessage = message.length > config.ws.maxMessageLength
    ? `${message.slice(0, config.ws.maxMessageLength)}\n... [truncated]`
    : message;

  return {
    _id: nextId,
    topic: intern(topic),
    serverName: intern(serverName),
    path: intern(path),
    timestamp,
    // Parse once at ingestion so filtering and relative-time rendering reuse
    // this number instead of allocating a throwaway Date on every pass.
    _ts: Date.parse(timestamp),
    message: safeMessage,
  };
};

export const getRelativeTime = (ts, now) => {
  try {
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
