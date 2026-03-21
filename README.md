# LogStream

Real-time log monitoring dashboard. Streams live logs from multiple topics via WebSocket, with filtering, split-view, and server storage monitoring. Fully responsive from desktop to smartphone.

---

## Tech Stack

| | |
|---|---|
| **Framework** | React 19 + React Router 7 |
| **Build tool** | Vite 7 |
| **Styling** | Tailwind CSS 4 (utility classes only) |
| **Virtualization** | @tanstack/react-virtual 3 |
| **Animation** | Framer Motion 12 |
| **Linting** | ESLint 9 + eslint-plugin-react-hooks |
| **Language** | JavaScript / JSX (no TypeScript) |

---

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` — at minimum set `VITE_WS_URL` to your WebSocket server. See the [Environment Variables](#environment-variables) section below.

> **Dev mode:** Leave all `VITE_SSO_*` variables empty and authentication is skipped. The app loads directly without a login page.

### 3. Run

```bash
npm run dev       # Dev server → http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint
```

---

## Deploying

This is a static SPA — `npm run build` outputs a `dist/` folder that can be served by any web server.

### 1. Set production environment variables

Create a `.env` file with your production values before building:

```env
VITE_WS_URL=wss://your-log-server.com/ws/logs
VITE_STORAGE_API_URL=https://your-storage-api.com
VITE_MAX_LOGS_PER_TOPIC=500
VITE_MAX_MESSAGE_LENGTH=50000
```

Leave all `VITE_SSO_*` empty until DEC SSO is ready — auth will be skipped.

### 2. Build

```bash
npm run build
# → dist/
```

### 3. Serve

**Nginx example:**

```nginx
server {
    listen 80;
    server_name logstream.yourdomain.com;
    root /var/www/logstream/dist;
    index index.html;

    # Required for React Router — all routes fall back to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> The `try_files /index.html` fallback is required. Without it, refreshing on any route (e.g. `/callback`) returns a 404.

**Other options:** Any static host works — Apache, S3 + CloudFront, Vercel, Netlify, etc. Just make sure client-side routing fallback is enabled.

### Adding SSO later

1. Get the 4 values from DEC SSO team
2. Add them to `.env`
3. Finish `src/auth/CallbackPage.jsx` (uncomment the token exchange block)
4. Rebuild and redeploy

---

## Environment Variables

All values are baked at build time. Changing them requires a rebuild.

| Variable | Default | Description |
|---|---|---|
| `VITE_WS_URL` | `ws://localhost:8080/ws/logs` | WebSocket server URL. Also used to derive the HTTP base URL for REST calls (`ws://` → `http://`, `wss://` → `https://`) |
| `VITE_MAX_LOGS_PER_TOPIC` | `500` | Max logs kept in memory per viewed topic (non-viewed topics: 100) |
| `VITE_MAX_MESSAGE_LENGTH` | `50000` | Truncates log messages longer than this (characters) to prevent DOM bloat |
| `VITE_STORAGE_API_URL` | `http://localhost:8081` | Storage monitoring REST API base URL (separate from the log WebSocket server) |
| `VITE_SSO_LOGIN_URL` | _(empty)_ | DEC SSO authorization endpoint — **leave empty to skip auth in dev** |
| `VITE_SSO_LOGOUT_URL` | _(empty)_ | DEC SSO logout endpoint |
| `VITE_SSO_TOKEN_URL` | _(empty)_ | DEC SSO token exchange endpoint |
| `VITE_SSO_CLIENT_ID` | _(empty)_ | App client ID registered with DEC SSO |
| `VITE_SSO_REDIRECT_URI` | `{origin}/callback` | SSO callback URL — defaults to current origin + `/callback` |

---

## Features

### Real-time Log Streaming
- WebSocket connection with **auto-reconnect** (exponential backoff, up to 30s)
- **Pause / resume** — freezes the stream; incoming logs buffer and flush on resume
- **Batched rendering** — logs flushed every 150ms to minimize re-renders under high volume
- **Virtualized list** — renders only visible rows via `@tanstack/react-virtual`; handles thousands of entries without lag

### Filtering
All filtering is **client-side and instant**. A debounced server-side filter (300ms) runs in parallel to reduce WebSocket bandwidth — the UI never waits for it.

- **Server filter** — searchable dropdown
- **Path filter** — searchable dropdown (depends on server selection)
- **Text search** — searches message, server name, and path
- **Time range** — last 1m / 5m / 15m / 1h / Custom / All
- **Keyword filter** — multiple keywords as colored chips, with AND / OR mode toggle and custom hex color picker
- **Active filter chips** — shows active filters with individual clear buttons

### Display
- **Relative timestamps** — `2m ago` style; hover to see the full ISO timestamp
- **Keyword highlighting** — each keyword gets its custom color, highlighted inline
- **Dark / light theme** toggle
- **Split view** — two independent log panels side by side (desktop)
- **Heartbeat indicator** — animated SVG line reflecting live log rate; color shifts green → yellow → orange → red by rate
- **Log rate** — logs/sec shown per topic in the sidebar

### Storage Monitoring
- Per-system disk usage, polled every 30 seconds
- Systems list in sidebar with A–Z / Z–A sort and search (supports multilingual names including Khmer)

### Actions
- **Download logs** — export raw logs for the active topic via REST API
- **Clear logs** per topic
- **Auto-scroll** to latest — disabled only by intentional upward scroll; re-enables when scrolled back to the bottom

---

## WebSocket Protocol

### Server → Client

| Type | Shape | When |
|---|---|---|
| Topic list | `{ type: "topics", topics: string[] }` | Once on connect |
| Stats | `{ type: "stats", topics: { [topic]: { rate, servers } }, intervalMs }` | Periodic (~every 2s) |
| Log event | `{ topic, serverName, path, message, timestamp }` or `[{…}, {…}]` (batched) | Live log events |

### Client → Server

| Action | Shape | Description |
|---|---|---|
| Subscribe | `{ action: "subscribe", topics: [...] }` | Subscribe to topics |
| Filter | `{ action: "filter", filters: { server, path, search, keywords: { terms, mode }, timeRange, timeRangeMs? } }` | Set server-side filter |
| Clear filters | `{ action: "clear-filters" }` | Remove all server-side filters |

### Log entry fields

| Field | Type | Description |
|---|---|---|
| `topic` | `string` | Topic name (e.g. `"api-service"`) |
| `serverName` | `string` | Originating server hostname |
| `path` | `string` | File path or log source |
| `message` | `string` | Log message body |
| `timestamp` | `string` | ISO 8601 date string |

---

## REST API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/logs/download?topic=<topic>` | Download raw log file for the topic |
| `GET` | `/api/server-storage-usage/latest` | Latest disk usage data per server |

All requests include `Authorization: Bearer <token>` when authenticated. Base URL is derived from `VITE_WS_URL` (or `VITE_STORAGE_API_URL` for storage endpoints).

---

## Auth (SSO)

Authentication uses OIDC authorization code flow via DEC SSO. When `VITE_SSO_LOGIN_URL` is set, `AuthGuard` blocks the app and redirects to the SSO login page. On callback, `CallbackPage` handles the code exchange and stores the JWT.

**To complete SSO setup**, the token exchange in `src/auth/CallbackPage.jsx` needs to be filled in once the DEC SSO team provides:
- Authorization endpoint URL (`VITE_SSO_LOGIN_URL`)
- Token exchange endpoint URL (`VITE_SSO_TOKEN_URL`)
- Logout endpoint URL (`VITE_SSO_LOGOUT_URL`)
- Client ID (`VITE_SSO_CLIENT_ID`)
- Whether they use PKCE or a client secret

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full implementation reference: file map, state ownership, WebSocket internals, filter pipeline, virtualization details, render optimization, and auth flow.
