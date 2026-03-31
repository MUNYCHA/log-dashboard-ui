const displayCap = Number(import.meta.env.VITE_MAX_LOGS_PER_TOPIC) || 500;

const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/logs';
const httpBaseUrl = wsUrl.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://').replace(/\/ws\/.*$/, '');

const storageApiUrl = import.meta.env.VITE_STORAGE_API_URL || httpBaseUrl;

const config = {
  httpBaseUrl,
  storageApiUrl,
  ws: {
    url: wsUrl,
    maxLogsPerTopic: displayCap,
    // Raw buffer is larger so filtered views have enough data to fill the display cap.
    // Server-side filtering limits bandwidth, so the extra memory is negligible.
    rawBufferPerTopic: displayCap * 4,
    maxMessageLength: Number(import.meta.env.VITE_MAX_MESSAGE_LENGTH) || 50_000,
  },
};

export default config;
