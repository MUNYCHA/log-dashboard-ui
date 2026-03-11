const displayCap = Number(import.meta.env.VITE_MAX_LOGS_PER_TOPIC) || 500;

const config = {
  ws: {
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/logs',
    maxLogsPerTopic: displayCap,
    // Raw buffer is larger so filtered views have enough data to fill the display cap.
    // Server-side filtering limits bandwidth, so the extra memory is negligible.
    rawBufferPerTopic: displayCap * 4,
    maxMessageLength: Number(import.meta.env.VITE_MAX_MESSAGE_LENGTH) || 50_000,
  },
};

export default config;
