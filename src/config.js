const displayCap = Number(import.meta.env.VITE_MAX_LOGS_PER_TOPIC) || 500;

// Everything (UI, REST, WS, Keycloak) is served same-origin behind one nginx,
// so by default we derive endpoints from the page's own origin at runtime.
// This means the deployed host/scheme/port can change with NO rebuild and the
// UI can never end up pointing at the wrong host or triggering mixed-content.
// VITE_* env vars remain as explicit overrides for non-proxied / split deploys.
const pageOrigin =
  typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:8080';
const pageHost =
  typeof window !== 'undefined' && window.location ? window.location.host : 'localhost:8080';
const wsScheme =
  typeof window !== 'undefined' && window.location && window.location.protocol === 'https:' ? 'wss:' : 'ws:';

const wsUrl = import.meta.env.VITE_WS_URL || `${wsScheme}//${pageHost}/ws/logs`;
const httpBaseUrl = import.meta.env.VITE_WS_URL
  ? wsUrl.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://').replace(/\/ws\/.*$/, '')
  : pageOrigin;

const ssoAuthority = import.meta.env.VITE_SSO_LOGIN_URL || `${pageOrigin}/auth/realms/logstream`;

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
