const config = {
  ws: {
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/logs',
    maxLogsPerTopic: Number(import.meta.env.VITE_MAX_LOGS_PER_TOPIC) || 500,
    maxMessageLength: Number(import.meta.env.VITE_MAX_MESSAGE_LENGTH) || 50_000,
  },
};

export default config;
