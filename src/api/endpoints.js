// All REST endpoints for the log dashboard.
// Every function takes the base URL as its first argument so callers
// can pass config.httpBaseUrl — no hidden import-time dependency.
export const endpoints = {
  topicMeta:    (base, topic) => `${base}/api/topics/${encodeURIComponent(topic)}/meta`,
  downloadLogs: (base, topic) => `${base}/api/logs/download?topic=${encodeURIComponent(topic)}`,
};
