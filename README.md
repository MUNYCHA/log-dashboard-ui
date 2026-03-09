# LogStream

A real-time log monitoring dashboard built with React + Vite. Connects to a WebSocket server and streams live logs grouped by topic, server, and file path. Fully responsive from desktop monitor to smartphone.

---

## Features

### Real-time Streaming
- WebSocket connection with **auto-reconnect** (exponential backoff, up to 30s between attempts)
- **Reconnecting** status indicator in the status bar
- **Pause / resume** stream — incoming logs are buffered while paused and flushed on resume
- **Batched rendering** — log updates are flushed every 150ms to minimize re-renders under high volume

### Topic & Filtering
- **Topic sidebar** — browse all active topics with live log count and per-topic log rate (logs/sec)
- **Server filter** — searchable dropdown to filter logs by server name
- **Path filter** — searchable dropdown to filter logs by file path (depends on server selection)
- **Text search** — searches across message, server name, and path
- **Regex search** — toggle `.*` button to switch to regex mode with invalid-pattern indicator
- **Time range filter** — show logs from the last: All / 1m / 5m / 15m / 1h
- **Keyword filter** — add multiple keywords as colored chips; matches are highlighted in log messages
- **AND / OR mode** toggle for keyword filter logic
- **Custom keyword colors** — color wheel picker with hex/RGB input for each keyword

### Display
- **Relative timestamps** — shows `2m ago` style time; hover to see the full timestamp
- **Keyword highlight** — each keyword gets a custom hex color; matches are highlighted inline
- **Dark / light theme** toggle
- **Fully responsive** — sidebar is a slide-in drawer on mobile, fixed panel on tablet/desktop
- **Collapsible sidebar** — desktop sidebar collapses to a thin strip with an expand button
- **Split view** — open two independent log panels side by side (desktop only)
- **Per-panel independent pause** — each split-view panel has its own pause state
- **Focus ring** — active panel in split view is highlighted with a focus ring
- **Heartbeat indicator** — SVG line animation in the status bar reflecting log ingestion rate; color shifts from green to yellow to orange to red based on rate
- **Log rate indicator** — logs/sec shown per topic in the sidebar

### Actions
- **Export logs** — download currently filtered logs as JSON or CSV (timestamped filename)
- **Copy** any individual log message to clipboard (button appears on hover)
- **Clear logs** per topic
- **Auto-scroll** to latest logs with manual override (re-enables when scrolled back to bottom)
- **Scroll to top / bottom** floating buttons appear when needed

---

## Tech Stack

| | |
|---|---|
| **Framework** | React 19 |
| **Build tool** | Vite 7 |
| **Styling** | Tailwind CSS 4 |
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

## WebSocket Message Protocol

The server must send two message types over the WebSocket connection:

| Type | Shape | When |
|---|---|---|
| Topic list | `string[]` | Once on connect — list of all topic names |
| Log entry | `{ topic, serverName, path, message, timestamp }` | One object per log line |

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
["api-service", "worker", "auth"]
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
    ├── config.js              # Reads VITE_WS_URL from env with fallback
    ├── constants/
    │   ├── theme.js           # Dark / light theme token objects
    │   └── keywordColors.js   # Preset keyword highlight colors
    ├── hooks/
    │   └── useWebSocket.js    # WebSocket connection, auto-reconnect,
    │                          # pause/buffer, log rate tracker
    ├── utils/
    │   └── logUtils.js        # formatTimestamp, getRelativeTime,
    │                          # getServersForTopic
    └── components/
        ├── Sidebar.jsx        # Topic list with search, log rate badges,
        │                      # collapsible on desktop
        ├── LogPanel.jsx       # Main log view — all filters, search,
        │                      # export, heartbeat indicator, scroll buttons
        ├── LogEntry.jsx       # Single log row with keyword highlighting
        │                      # and relative timestamp
        ├── KeywordFilter.jsx  # Keyword chip input, color picker,
        │                      # AND/OR toggle
        ├── FilterDropdown.jsx # Shared searchable dropdown base component
        ├── ServerDropdown.jsx # Server filter (wraps FilterDropdown)
        ├── PathDropdown.jsx   # Path filter (wraps FilterDropdown)
        └── ThemeToggle.jsx    # Dark / light mode button
```

---

## Configuration

| Variable | Default | Description |
|---|---|---|
| `VITE_WS_URL` | `ws://localhost:8080/ws/logs` | WebSocket server URL |

The max logs kept in memory per topic is configured in `src/config.js` (`maxLogsPerTopic`, default `100`).
