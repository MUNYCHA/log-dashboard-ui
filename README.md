# LogStream

A real-time log monitoring dashboard built with React + Vite. Connects to a WebSocket server and streams live logs grouped by topic, server, and file path. Fully responsive from desktop monitor to smartphone.

---

## Features

### Real-time Streaming
- WebSocket connection with **auto-reconnect** (exponential backoff, up to 30s between attempts)
- **Reconnecting** status indicator in the status bar
- **Pause / resume** stream — display freezes on the current snapshot while paused; underlying buffer continues accumulating; live view resumes on unpause
- **Batched rendering** — log updates are flushed every 150ms to minimize re-renders under high volume

### Topic & Filtering (Client-Side, Real-Time)
All filtering runs client-side for instant feedback on every keystroke. A debounced server-side filter (300ms) runs in parallel as a bandwidth optimization to reduce WebSocket traffic.

- **Topic sidebar** — all topics auto-subscribed; live log rate (logs/sec) per topic
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
- **Split view** — open two independent log panels side by side (desktop only)
- **Per-panel independent pause** — each split-view panel has its own pause state
- **Active panel indicator** — active panel in split view is indicated by a dot in the header; empty-state panels show a focus ring
- **Heartbeat indicator** — SVG line animation reflecting log ingestion rate; shown in DesktopHeader (desktop, `lg` breakpoint) and MobileHeader; animation speed varies with rate
- **Log rate indicator** — logs/sec shown per topic in the sidebar; sidebar header shows an active-topic counter (active / total)
- **Status bar counts** — shows "shown" vs "buffered" log counts; a `Filtered` badge appears when any filter is active
- **Dynamic tab title** — browser tab tracks the selected topic (or both topics in split view)
- **Settings drawer** — left-side drawer with theme selector, terminal mode, sidebar collapse, and topic sort order
- **Terminal mode** — compact monospace log view without cards

### Actions
- **Download logs** — download the full log file for the selected topic directly from the server
- **Clear logs** per topic
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

## Deploy with Docker

### Requirements
- Docker + Docker Compose installed on the server

### 1. Clone and configure

```bash
git clone https://github.com/MUNYCHA/log-dashboard-ui.git
cd log-dashboard-ui
cp .env.example .env
```

Edit `.env` and set your WebSocket server URL:

```env
VITE_WS_URL=ws://YOUR_SERVER_IP:8080/ws/logs
```

### 2. Build and run

```bash
docker compose up -d --build
```

The app will be available at `http://YOUR_SERVER_IP:5173`.

> **Note:** All `VITE_*` env vars are baked into the build at image build time. If you change `.env`, re-run `docker compose up -d --build` to rebuild.

### 3. Stop

```bash
docker compose down
```

---

## WebSocket Message Protocol

### Server → Client

| Type | Shape | When |
|---|---|---|
| Topic list | `{ type: "topics", topics: string[] }` (primary), legacy `string[]` fallback | Once on connect — list of all topic names |
| Stats | `{ type: "stats", topics: { [topic]: { rate, servers } }, intervalMs }` | Periodic (~every 2s) — per-topic log rate and server info |
| Log event | `{ topic, serverName, path, message, timestamp }` or `[{...}, {...}]` (batched array) | Live log events (already filtered server-side); single object or batched array |

### Client → Server

| Action | Shape | Description |
|---|---|---|
| Subscribe | `{ action: "subscribe", topics: [...] }` | Subscribe to topics (all topics on connect) |
| Filter | `{ action: "filter", filters: { server, path, search, keywords: { terms, mode }, timeRange, timeRangeMs? } }` | Set server-side filter (bandwidth optimization — client filters locally for display) |
| Clear filters | `{ action: "clear-filters" }` | Remove all filters for this session |

### Log entry fields

| Field | Type | Description |
|---|---|---|
| `topic` | `string` | Topic/category name (e.g. `"api-service"`) |
| `serverName` | `string` | Originating server hostname or label |
| `path` | `string` | File path or log source path |
| `message` | `string` | The log message body |
| `timestamp` | `string` | ISO 8601 date string (e.g. `"2025-03-07T12:00:00.000Z"`) |

### Example messages

```json
{ "type": "topics", "topics": ["api-service", "worker", "auth"] }
```

```json
{
  "topic": "api-service",
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

The base URL is derived automatically from `VITE_WS_URL` (`ws://` → `http://`, `wss://` → `https://`).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/logs/download?topic=<topic>` | Download the raw log file for the given topic |
| `GET` | `/api/topics/{topic}/meta` | Topic metadata: all-time server names and file paths for the given topic |

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
    ├── config.js              # Reads VITE_WS_URL, VITE_MAX_LOGS_PER_TOPIC,
    │                          # VITE_MAX_MESSAGE_LENGTH from env with fallbacks.
    │                          # Derives httpBaseUrl (http/https) from VITE_WS_URL for REST API calls
    ├── constants/
    │   ├── theme.js           # Dark / light theme token objects
    │   └── keywordColors.js   # Preset keyword highlight colors
    ├── hooks/
    │   └── useWebSocket.js    # WebSocket connection, auto-reconnect,
    │                          # log batching, rate tracking,
    │                          # server-side filter dispatch
    ├── utils/
    │   └── logUtils.js        # getLogLevelColor, getRelativeTime
    └── components/
        ├── common/
        │   ├── HeartbeatLine.jsx   # SVG heartbeat animation reflecting log rate
        │   └── ErrorBoundary.jsx   # React error boundary wrapper
        ├── filters/
        │   ├── index.js            # Re-exports all filter components
        │   ├── FilterDropdown.jsx  # Shared searchable dropdown base component
        │   ├── ServerDropdown.jsx  # Server filter (wraps FilterDropdown)
        │   ├── PathDropdown.jsx    # Path filter (wraps FilterDropdown)
        │   ├── KeywordFilter.jsx   # Keyword chip input, color picker,
        │   │                       # AND/OR toggle
        │   └── TimeRangeSelector.jsx # Time range picker (All/1m/5m/15m/1h/Custom)
        ├── log/
        │   ├── index.js            # Re-exports LogPanel
        │   ├── LogPanel.jsx        # Orchestrator — state, hooks, composition
        │   ├── DesktopHeader.jsx   # Desktop topic info, toolbar (search is in FilterBar)
        │   ├── MobileHeader.jsx    # Mobile topic bar, filter icon menu, search
        │   ├── FilterBar.jsx       # Desktop server/path dropdowns, time range
        │   ├── ActiveFilters.jsx   # Active filter chip badges
        │   ├── StatusBar.jsx       # Bottom connection/filter status bar
        │   ├── EmptyState.jsx      # No-topic-selected placeholder
        │   ├── ScrollButtons.jsx   # Floating scroll-to-top/bottom buttons
        │   ├── LogEntry.jsx        # Single log row with keyword highlighting
        │   │                       # and relative timestamp
        │   └── constants.js        # TIME_RANGES, button styles, getShortPath
        ├── settings/
        │   ├── index.js            # Re-exports SettingsModal
        │   └── SettingsModal.jsx   # Left-side drawer — theme, terminal mode,
        │                           # sidebar collapse, topic sort order
        └── sidebar/
            ├── index.js            # Re-exports Sidebar
            └── Sidebar.jsx         # Topic list with search, log rate badges,
                                    # collapsible on desktop
```

---

## Configuration

All values are baked at build time via Vite's `import.meta.env`. Changing them requires a rebuild (`npm run build`).

| Variable | Default | Description |
|---|---|---|
| `VITE_WS_URL` | `ws://localhost:8080/ws/logs` | WebSocket server URL |
| `VITE_MAX_LOGS_PER_TOPIC` | `500` | Display cap per viewed topic (internal buffer stores 4× this for filter headroom; non-viewed topics: 100) |
| `VITE_MAX_MESSAGE_LENGTH` | `50000` | Truncate log messages longer than this (chars) to prevent DOM bloat |
