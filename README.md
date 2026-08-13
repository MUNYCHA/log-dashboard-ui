# LogStream

A real-time log monitoring dashboard built with React + Vite. Connects to a WebSocket server and streams live logs grouped by channel, server, and file path. Fully responsive from desktop monitor to smartphone.

---

## Features

### Real-time Streaming
- WebSocket connection with **auto-reconnect** (exponential backoff, up to 30s between attempts)
- **Reconnecting** status indicator in the status bar
- **Pause / resume** stream — display freezes on the current snapshot while paused; underlying buffer continues accumulating; live view resumes on unpause
- **Batched rendering** — log updates are flushed every 150ms to minimize re-renders under high volume

### Channel & Filtering (Client-Side, Real-Time)
All filtering runs client-side for instant feedback. Text search updates on every keystroke; keyword filter uses a 300ms client-side debounce (the typed term is applied to filtering and highlighting after the debounce fires). A debounced server-side filter (300ms) also runs in parallel as a bandwidth optimization to reduce WebSocket traffic.

- **Channel sidebar** — all channels auto-subscribed; live log rate (logs/sec) per channel
- **Server filter** — searchable dropdown to filter logs by server name
- **Path filter** — searchable dropdown to filter logs by file path (depends on server selection)
- **Text search** — instant client-side search across log message content
- **Time range filter** — show logs from the last: All / 1m / 5m / 15m / 1h / Custom; Custom accepts free-form durations like `30s`, `5m`, `2h` (decimals supported); sent to the server as a bandwidth optimization and applied client-side for instant feedback
- **Keyword filter** — add multiple keywords as colored chips; matches are highlighted in log messages
- **AND / OR mode** toggle for keyword filter logic
- **Custom keyword colors** — native color picker when adding a keyword chip

### Display
- **Timestamps** — full localized timestamp shown on each log entry (normal mode); timestamps omitted in terminal mode
- **Keyword highlight** — each keyword gets a custom hex color; matches are highlighted inline
- **Search highlight** — plain-text search matches are highlighted inline in yellow, separately from keyword colors
- **Copy log entry** — hover a log entry to reveal a copy button; copies a JSON payload of the entry to the clipboard
- **Light / Dark / System theme** — 3-way selector, follows OS preference in System mode
- **Fully responsive** — sidebar is a slide-in drawer on mobile, fixed panel on tablet/desktop
- **Collapsible sidebar** — desktop sidebar collapses to a thin strip with an expand button
- **Split view** — open two independent log panels side by side (medium breakpoint `md` and up)
- **Per-panel independent pause** — each split-view panel has its own pause state
- **Active panel indicator** — active panel in split view is indicated by a dot in the header; empty-state panels show a focus ring
- **Heartbeat indicator** — SVG line animation reflecting log ingestion rate; shown in DesktopHeader (desktop, `lg` breakpoint) and MobileHeader; animation speed varies with rate
- **Log rate indicator** — logs/sec shown per channel in the sidebar; sidebar header shows an active-channel counter (active / total)
- **Status bar counts** — shows "shown" vs "buffered" log counts; a `Filtered` badge appears when any filter is active
- **Dynamic tab title** — browser tab tracks the selected channel (or both channels in split view)
- **Settings drawer** — left-side drawer with theme selector, terminal mode, sidebar collapse, and channel sort order
- **Terminal mode** — compact monospace log view without cards

### Actions
- **Download logs** — download the full log file for the selected channel directly from the server
- **Clear logs** per channel
- **Auto-scroll** to latest logs — disabled only by user-initiated upward scrolling; re-enables via the scroll-to-bottom button or the auto-scroll toggle button
- **Scroll to top / bottom** floating buttons appear when needed

---

## Tech Stack

| | |
|---|---|
| **Framework** | React 19 |
| **Build tool** | Vite 7 |
| **Styling** | Tailwind CSS 4 |
| **Virtualization** | @tanstack/react-virtual 3 |
| **Animation** | Framer Motion 12 |
| **Linting** | ESLint 9 + eslint-plugin-react-hooks |
| **Language** | JavaScript / JSX (no TypeScript) |
| **Real-time** | WebSocket (native browser API) |
| **Auth** | Keycloak (OIDC) via oidc-client-ts — optional, enabled when `VITE_SSO_CLIENT_ID` is set |

---

## Requirements

- **Node.js** >= 18
- **npm** >= 9 (or pnpm / yarn)
- A WebSocket server that follows the message protocol below

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/MUNYCHA/log-dashboard-ui.git
cd log-dashboard-ui
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your WebSocket server URL:

```env
VITE_WS_URL=ws://localhost:8080/ws/logs
```

### 3. Run the development server

```bash
npm run dev
# → http://localhost:5173
```

### 4. Build for production

```bash
npm run build
# Output → dist/
```

### 5. Preview the production build

```bash
npm run preview
```

### 6. Lint

```bash
npm run lint
```

---

## Docker Deployment

The office-server deployment is owned by the sibling `log-infra` repository.
That Compose stack builds this UI into nginx alongside Keycloak and the
`logstream` API, with one deployment `.env` file.

This repository's Dockerfile and `.env.example` remain useful for standalone UI
development and build testing, but are not the deployment entry point.

---

## WebSocket Message Protocol

### Server → Client

| Type | Shape | When |
|---|---|---|
| Channel list | `{ type: "channels", channels: string[] }` (primary), legacy `string[]` fallback | Once on connect — list of all channel names |
| Stats | `{ type: "stats", channels: { [channel]: { rate, servers } }, intervalMs }` | Periodic (~every 2s) — per-channel log rate and server info |
| Log event | `{ channel, serverName, path, message, timestamp }` or `[{...}, {...}]` (batched array) | Live log events; single object or batched array. Client always filters locally — server-side filter is a bandwidth optimization only (may be cleared in split-view or no-filter cases) |

### Client → Server

| Action | Shape | Description |
|---|---|---|
| Subscribe | `{ action: "subscribe", channels: [...] }` | Subscribe to channels (all channels on connect) |
| Filter | `{ action: "filter", filters: { server, path, search, keywords: { terms, mode }, timeRange, timeRangeMs? } }` | Set server-side filter (bandwidth optimization — client filters locally for display) |
| Clear filters | `{ action: "clear-filters" }` | Remove all filters for this session |

### Log entry fields

| Field | Type | Description |
|---|---|---|
| `channel` | `string` | Channel/category name (e.g. `"api-service"`) |
| `serverName` | `string` | Originating server hostname or label |
| `path` | `string` | File path or log source path |
| `message` | `string` | The log message body |
| `timestamp` | `string` | ISO 8601 date string (e.g. `"2025-03-07T12:00:00.000Z"`) |

### Example messages

```json
{ "type": "channels", "channels": ["api-service", "worker", "auth"] }
```

```json
{
  "channel": "api-service",
  "serverName": "prod-01",
  "path": "/var/log/api/app.log",
  "message": "GET /health 200 OK - 3ms",
  "timestamp": "2025-03-07T12:00:00.123Z"
}
```

```json
{
  "action": "filter",
  "filters": {
    "server": "prod-01",
    "search": "error",
    "keywords": { "terms": ["timeout"], "mode": "or" },
    "timeRange": "15m"
  }
}
```

---

## REST API

The base URL is the page origin by default (same-origin deployment). If `VITE_WS_URL` is set, the REST base is derived from it instead (`ws://` → `http://`, `wss://` → `https://`, with the `/ws/...` path stripped).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/logs/download?channel=<channel>` | Download the raw log file for the given channel |
| `GET` | `/api/channels/{channel}/meta` | Channel metadata: all-time server names and file paths for the given channel |

---

## Project Structure

```
log-dashboard-ui/
├── .env.example               # Environment variable template
├── vite.config.js             # Vite + Tailwind CSS plugin config
├── eslint.config.js           # ESLint flat config
├── package.json
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # Root layout, split view, global state
    ├── config.js              # Reads VITE_WS_URL, VITE_SSO_*, VITE_MAX_LOGS_PER_CHANNEL,
    │                          # VITE_MAX_MESSAGE_LENGTH from env with fallbacks.
    │                          # Derives same-origin ws/http/sso endpoints when overrides are blank
    ├── constants/
    │   └── theme.js           # Dark / light theme token objects
    ├── hooks/
    │   ├── useWebSocket.js    # WebSocket connection, auto-reconnect,
    │   │                      # log batching, rate tracking,
    │   │                      # server-side filter dispatch
    │   └── useFilteredLogs.js # Client-side single-pass filter (server/path/search/keywords/timeRange)
    ├── utils/
    │   └── logUtils.js        # normalizeLogEvent (interns + _ts + truncation), getRelativeTime
    ├── api/
    │   ├── endpoints.js       # REST endpoint path constants
    │   └── logApi.js          # REST client — download logs, fetch channel metadata
    ├── auth/
    │   ├── AuthContext.jsx    # SSO provider (Keycloak via oidc-client-ts)
    │   ├── authContext.js     # React context object
    │   ├── useAuth.js         # { isAuthenticated, isLoading, getToken }
    │   └── authService.js     # oidc-client-ts UserManager wrapper
    ├── ui/
    │   ├── HeartbeatLine.jsx  # SVG heartbeat animation reflecting log rate
    │   └── ErrorBoundary.jsx  # React error boundary wrapper
    └── features/
        ├── filters/
        │   ├── index.js            # Re-exports all filter components
        │   ├── FilterDropdown.jsx  # Shared searchable dropdown base component
        │   ├── ServerDropdown.jsx  # Server filter (wraps FilterDropdown)
        │   ├── PathDropdown.jsx    # Path filter (wraps FilterDropdown)
        │   ├── KeywordFilter.jsx   # Keyword chip input, native color picker, AND/OR toggle
        │   ├── TimeRangeSelector.jsx # Time range picker (All/1m/5m/15m/1h/Custom)
        │   └── timeRange.js        # formatDurationMs helper
        ├── log-viewer/
        │   ├── index.js            # Re-exports LogPanel
        │   ├── LogPanel.jsx        # Orchestrator — state, hooks, composition
        │   ├── panelReducer.js     # useReducer logic for panel-local state
        │   ├── constants.js        # getShortPath, getButtonStyles
        │   ├── hooks/
        │   │   └── useChannelMeta.js # Server/path discovery + backend meta merge
        │   └── components/
        │       ├── VirtualLogList.jsx  # Virtualized list (@tanstack/react-virtual, flow mode)
        │       ├── LogEntry.jsx        # Single log row with keyword highlighting and relative timestamp
        │       ├── FilterBar.jsx       # Desktop server/path dropdowns, time range
        │       ├── ActiveFilters.jsx   # Active filter chip badges
        │       ├── StatusBar.jsx       # Bottom connection/filter status bar
        │       ├── EmptyState.jsx      # No-channel-selected placeholder
        │       ├── ScrollButtons.jsx   # Floating scroll-to-top/bottom buttons
        │       └── headers/
        │           ├── DesktopHeader.jsx  # Desktop channel info, toolbar
        │           └── MobileHeader.jsx   # Mobile channel bar, filter icon menu, search
        ├── settings/
        │   ├── index.js            # Re-exports SettingsModal
        │   ├── SettingsModal.jsx   # Left-side drawer — theme, terminal mode,
        │   │                       # sidebar collapse, channel sort order
        │   ├── SettingRow.jsx      # Labeled setting row wrapper
        │   ├── SortChip.jsx        # Channel sort mode chip
        │   └── ToggleSwitch.jsx    # Reusable toggle switch
        └── sidebar/
            ├── index.js            # Re-exports Sidebar
            ├── Sidebar.jsx         # Channel list with search, log rate badges, collapsible on desktop
            └── ChannelItem.jsx     # Individual channel row (memo'd)
```

---

## Configuration

Override values are baked at build time via Vite's `import.meta.env`. In the
standard nginx deployment, endpoint URLs are derived at runtime from the page
origin, while client ID and display tuning are provided by `log-infra/.env`.

| Variable | Default | Description |
|---|---|---|
| `VITE_WS_URL` | blank | Optional WebSocket/API origin override; blank uses same-origin `/ws/logs`. |
| `VITE_SSO_LOGIN_URL` | blank | Optional Keycloak authority override; blank uses same-origin `/auth/realms/logstream`. |
| `VITE_SSO_CLIENT_ID` | `logstream-ui` | Keycloak OIDC client ID; required when SSO is enabled. |
| `VITE_MAX_LOGS_PER_CHANNEL` | `500` | Display cap per viewed channel (internal buffer stores 4× this for filter headroom; non-viewed channels: 100) |
| `VITE_MAX_MESSAGE_LENGTH` | `50000` | Truncate log messages longer than this (chars) to prevent DOM bloat |
