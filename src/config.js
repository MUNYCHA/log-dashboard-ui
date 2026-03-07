const config = {
  ws: {
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/logs',
    maxLogsPerTopic: 300,
  },
};

export default config;
