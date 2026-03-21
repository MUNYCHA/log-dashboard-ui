/**
 * Logs API — log stream REST endpoints.
 * All log-related HTTP calls live here.
 * (WebSocket streaming is handled separately in useWebSocket.js)
 */

export const logsApi = {
  download: (client, topic) =>
    client.get(`/api/logs/download?topic=${encodeURIComponent(topic)}`),
  // Returns the raw Response so the caller can stream the blob
};
