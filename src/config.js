const displayCap = Number(import.meta.env.VITE_MAX_LOGS_PER_TOPIC) || 500;

const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/logs';
const httpBaseUrl = wsUrl.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://').replace(/\/ws\/.*$/, '');

const ssoAuthority = import.meta.env.VITE_SSO_LOGIN_URL || '';

const config = {
  httpBaseUrl,
  ws: {
    url: wsUrl,
    maxLogsPerTopic: displayCap,
    // Raw buffer is larger so filtered views have enough data to fill the display cap.
    // Server-side filtering limits bandwidth, so the extra memory is negligible.
    rawBufferPerTopic: displayCap * 4,
    maxMessageLength: Number(import.meta.env.VITE_MAX_MESSAGE_LENGTH) || 50_000,
  },
  sso: {
    authority: ssoAuthority,
    clientId: import.meta.env.VITE_SSO_CLIENT_ID || '',
    enabled: !!ssoAuthority && !!import.meta.env.VITE_SSO_CLIENT_ID,
  },
};

export default config;
