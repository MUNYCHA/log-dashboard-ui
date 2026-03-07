# LogStream

A real-time log monitoring dashboard built with React + Vite. Connects to a WebSocket server and streams live logs grouped by topic, server, and file path.

## Features

- **Real-time log streaming** via WebSocket
- **Topic sidebar** — browse and search active log topics with live counts
- **Server filter** — filter logs by server name
- **Path filter** — filter logs by file path (shows `…/parent/file` for long paths)
- **Log search** — search across message, server, and path
- **Keyword filter** — add multiple keywords with custom colors; matching words are highlighted in the log message
- **Dark / light mode** toggle
- **Auto-scroll** to latest logs
- **Copy** any log message to clipboard

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS 4
- Framer Motion

## Getting Started

### 1. Configure environment

Copy `.env.example` to `.env` and set your WebSocket server URL:

```
VITE_WS_URL=ws://localhost:8080/ws/logs
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## WebSocket Message Protocol

The server must send two message types:

| Type | Shape | Description |
|------|-------|-------------|
| Topic list | `string[]` | Sent once on connect — list of topic names |
| Log entry | `{ topic, serverName, path, message, timestamp }` | One log entry per message |

## Project Structure

```
src/
  config.js                  # Reads VITE_WS_URL from env
  constants/
    theme.js                 # Dark / light theme tokens
    keywordColors.js         # Keyword highlight color definitions
  hooks/
    useWebSocket.js          # WebSocket connection + log state
  utils/
    logUtils.js              # Timestamp formatting, server helpers
  components/
    Sidebar.jsx              # Topic list with search
    LogPanel.jsx             # Main log view, filters, search
    LogEntry.jsx             # Single log row with keyword highlighting
    FilterDropdown.jsx       # Shared searchable dropdown
    ServerDropdown.jsx       # Server filter (wraps FilterDropdown)
    PathDropdown.jsx         # Path filter (wraps FilterDropdown)
    KeywordFilter.jsx        # Keyword chip input with color picker
    ThemeToggle.jsx          # Dark / light mode button
```
