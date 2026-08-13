// All REST endpoints for the log dashboard.
// Every function takes the base URL as its first argument so callers
// can pass config.httpBaseUrl — no hidden import-time dependency.
export const endpoints = {
  channelMeta:  (base, channel) => `${base}/api/channels/${encodeURIComponent(channel)}/meta`,
  downloadLogs: (base, channel) => `${base}/api/logs/download?channel=${encodeURIComponent(channel)}`,
};
