import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import ServerDropdown from "./ServerDropdown";
import PathDropdown from "./PathDropdown";
import LogEntry from "./LogEntry";
import ThemeToggle from "./ThemeToggle";
import KeywordFilter from "./KeywordFilter";

const TIME_RANGES = [
  { label: 'All', value: 'all' },
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
];
const TIME_RANGE_MS = { '1m': 60000, '5m': 300000, '15m': 900000, '1h': 3600000 };

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const LogPanel = ({
  selectedTopic,
  logsByTopic,
  selectedServer,
  onServerSelect,
  onClearServer,
  onClearLogs,
  isConnected,
  isReconnecting,
  isPaused,
  togglePause,
  logRates,
  theme,
  darkMode,
  onThemeToggle,
  onOpenSidebar,
  splitView,
  onOpenSplit,
  onClosePanel,
  isActivePanel,
  onSetActive,
}) => {
  const [logSearchTerm, setLogSearchTerm] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [showPathDropdown, setShowPathDropdown] = useState(false);
  const [serverSearchTerm, setServerSearchTerm] = useState("");
  const [pathSearchTerm, setPathSearchTerm] = useState("");
  // selectedPath is tied to the current topic — auto-clears when topic changes
  const [pathForTopic, setPathForTopic] = useState({ topic: null, path: null });
  const selectedPath = pathForTopic.topic === selectedTopic ? pathForTopic.path : null;
  const [prevTopic, setPrevTopic] = useState(selectedTopic);
  if (prevTopic !== selectedTopic) {
    setPrevTopic(selectedTopic);
    setAutoScroll(true);
  }
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordMode, setKeywordMode] = useState('or');
  const [isRegex, setIsRegex] = useState(false);
  const [timeRange, setTimeRange] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  const scrollRef = useRef(null);
  const serverButtonRef = useRef(null);
  const pathButtonRef = useRef(null);
  const exportMenuRef = useRef(null);

  // Ticker for relative timestamps (every 30s)
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Close export menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);


  // Scroll tracking — update atTop/atBottom, disable autoScroll when scrolling up
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAtTop(scrollTop < 50);
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    setAtBottom(nearBottom);
    if (!nearBottom && isActivePanel) setAutoScroll(false);
  }, [isActivePanel]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll, selectedTopic]);

  // Regex validation
  const regexError = useMemo(() => {
    if (!isRegex || !logSearchTerm) return false;
    try { new RegExp(logSearchTerm); return false; } catch { return true; }
  }, [isRegex, logSearchTerm]);

  // Unique servers for selected topic
  const serversForSelectedTopic = useMemo(
    () =>
      selectedTopic
        ? [...new Set(logsByTopic[selectedTopic]?.map((l) => l.serverName) || [])].sort()
        : [],
    [selectedTopic, logsByTopic],
  );

  // Unique paths for selected server
  const pathsForSelectedServer = useMemo(() => {
    if (!selectedTopic || !logsByTopic[selectedTopic]) return [];
    let logs = logsByTopic[selectedTopic];
    if (selectedServer) logs = logs.filter((l) => l.serverName === selectedServer);
    return [...new Set(logs.map((l) => l.path))].sort();
  }, [selectedTopic, logsByTopic, selectedServer]);

  const filteredServers = useMemo(
    () => serversForSelectedTopic.filter((s) => s.toLowerCase().includes(serverSearchTerm.toLowerCase())),
    [serversForSelectedTopic, serverSearchTerm],
  );

  const filteredPaths = useMemo(
    () => pathsForSelectedServer.filter((p) => p.toLowerCase().includes(pathSearchTerm.toLowerCase())),
    [pathsForSelectedServer, pathSearchTerm],
  );

  // Main log filter
  const filteredLogs = useMemo(() => {
    if (!selectedTopic || !logsByTopic[selectedTopic]) return [];
    const cutoff = timeRange !== 'all' ? now - TIME_RANGE_MS[timeRange] : null;

    const filtered = logsByTopic[selectedTopic].filter((log) => {
      if (selectedServer && log.serverName !== selectedServer) return false;
      if (selectedPath && log.path !== selectedPath) return false;
      if (cutoff && new Date(log.timestamp).getTime() < cutoff) return false;

      if (logSearchTerm) {
        let matchesSearch = false;
        if (isRegex && !regexError) {
          try {
            const re = new RegExp(logSearchTerm, 'i');
            matchesSearch = re.test(log.message) || re.test(log.serverName) || re.test(log.path);
          } catch { matchesSearch = false; }
        } else {
          const q = logSearchTerm.toLowerCase();
          matchesSearch =
            log.message.toLowerCase().includes(q) ||
            log.serverName.toLowerCase().includes(q) ||
            log.path.toLowerCase().includes(q);
        }
        if (!matchesSearch) return false;
      }

      const pendingInput = keywordInput.trim().toLowerCase();
      const activeKeywords = [...keywords.map((k) => k.text), ...(pendingInput ? [pendingInput] : [])];
      if (activeKeywords.length > 0) {
        const haystack = log.message.toLowerCase();
        const matches =
          keywordMode === 'and'
            ? activeKeywords.every((kw) => haystack.includes(kw))
            : activeKeywords.some((kw) => haystack.includes(kw));
        if (!matches) return false;
      }

      return true;
    });

    return [...filtered].reverse();
  }, [selectedTopic, logsByTopic, selectedServer, selectedPath, logSearchTerm, isRegex, regexError, timeRange, now, keywords, keywordInput, keywordMode]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  // Handlers
  const handleServerSelect = (server) => {
    onServerSelect(server);
    setPathForTopic({ topic: selectedTopic, path: null });
    setShowServerDropdown(false);
    setServerSearchTerm("");
  };

  const handlePathSelect = (path) => {
    setPathForTopic({ topic: selectedTopic, path });
    setShowPathDropdown(false);
    setPathSearchTerm("");
  };

  const handleClearServer = () => {
    onClearServer();
    setPathForTopic({ topic: selectedTopic, path: null });
  };

  const handleClearPath = () => setPathForTopic({ topic: selectedTopic, path: null });

  const exportLogs = (format) => {
    const safeTopic = selectedTopic.replace(/[^a-z0-9]/gi, '_');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const base = `${safeTopic}_${ts}`;
    if (format === 'json') {
      downloadFile(JSON.stringify(filteredLogs, null, 2), `${base}.json`, 'application/json');
    } else {
      const cols = ['timestamp', 'serverName', 'path', 'message'];
      const rows = filteredLogs.map((log) =>
        cols.map((c) => `"${String(log[c] || '').replace(/"/g, '""')}"`).join(',')
      );
      downloadFile([cols.join(','), ...rows].join('\n'), `${base}.csv`, 'text/csv');
    }
    setShowExportMenu(false);
  };

  const getShortPath = (path) => {
    if (!path) return path;
    const parts = path.split("/").filter(Boolean);
    if (parts.length <= 2) return path;
    return `\u2026/${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
  };

  const scrollToTop = () => { if (scrollRef.current) scrollRef.current.scrollTop = 0; };
  const scrollToBottom = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    setAutoScroll(true);
  };

  const accentActive = darkMode ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-600";
  const accentPaused = darkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-500/20 text-amber-600";

  // ─── Empty state ───────────────────────────────────────────────────────────
  if (!selectedTopic) {
    return (
      <div
        className={`flex-1 flex flex-col min-w-0 ${theme.background} ${splitView && !isActivePanel ? 'cursor-pointer opacity-70' : ''} ${splitView && isActivePanel ? `ring-1 ${darkMode ? 'ring-green-500/60' : 'ring-blue-400/60'}` : ''}`}
        onClick={splitView && !isActivePanel ? onSetActive : undefined}
      >
        {/* Desktop header — only shown for split panel 2 so close button is always reachable */}
        {onClosePanel && (
          <div className={`hidden md:flex items-center justify-between px-3 py-3 border-b ${theme.border} ${theme.header}`}>
            <span className={`text-sm ${theme.textMuted}`}>Select a topic</span>
            <button
              onClick={(e) => { e.stopPropagation(); onClosePanel(); }}
              className={`p-1.5 rounded-lg ${theme.input} hover:text-red-400 hover:bg-red-500/10 transition-colors`}
              title="Close this panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className={`md:hidden flex items-center px-3 py-3 border-b ${theme.border} ${theme.header}`}>
          <button onClick={onOpenSidebar} className={`p-2 rounded-lg ${theme.input}`} aria-label="Open sidebar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className={`ml-3 text-sm ${theme.textMuted}`}>Select a topic</span>
        </div>
        <div className={`flex-1 flex items-center justify-center ${theme.textMuted}`}>
          <div className="text-center px-4">
            <svg className="w-12 h-12 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">Select a topic to view logs</p>
            <p className="text-sm">Choose from the sidebar to start monitoring</p>
            <button onClick={onOpenSidebar} className={`md:hidden mt-4 px-4 py-2 rounded-lg ${theme.input} text-sm`}>
              Open Topics
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main panel ────────────────────────────────────────────────────────────
  return (
    <div
      className={`flex-1 flex flex-col min-w-0 ${theme.background} ${splitView && !isActivePanel ? 'cursor-pointer opacity-70' : ''} ${splitView && isActivePanel ? `ring-1 ${darkMode ? 'ring-green-500/60' : 'ring-blue-400/60'}` : ''}`}
      onClick={splitView && !isActivePanel ? onSetActive : undefined}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={`border-b ${theme.border} px-3 sm:px-4 md:px-5 py-3 ${theme.header} backdrop-blur-xl flex-shrink-0 relative z-10`}>

        {/* DESKTOP layout — md: two rows, lg+: single row */}
        <div className="hidden md:block">

          {/* Row 1 (md): topic + right controls — on lg+ this becomes part of a single flex row */}
          <div className="flex items-center gap-2">

            {/* Topic + count + rate */}
            <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
              {splitView && (
                <button
                  onClick={onSetActive}
                  className={`w-4 h-4 rounded-full flex-shrink-0 border-2 transition-colors ${
                    isActivePanel
                      ? darkMode ? 'border-green-400 bg-green-400' : 'border-blue-500 bg-blue-500'
                      : `border-gray-500 ${theme.input}`
                  }`}
                  title={isActivePanel ? 'Active panel' : 'Click to make active'}
                />
              )}
              <h2 className="text-sm lg:text-base font-semibold truncate max-w-[100px] lg:max-w-[200px]">
                <span className={`${darkMode ? "bg-gradient-to-r from-green-400 to-emerald-400" : "bg-gradient-to-r from-blue-500 to-indigo-500"} bg-clip-text text-transparent`}>
                  {selectedTopic}
                </span>
              </h2>
              <span className={`text-xs ${theme.card} px-2 py-0.5 rounded-full ${theme.textMuted} whitespace-nowrap flex-shrink-0`}>
                {filteredLogs?.length || 0}
              </span>
              {logRates?.[selectedTopic] > 0 && (
                <span className={`hidden lg:inline text-xs ${theme.textMuted} whitespace-nowrap`}>
                  {logRates[selectedTopic]}/s
                </span>
              )}
            </div>

            {/* md: Server + Path dropdowns inline with topic on first row */}
            {/* lg+: also inline here, search comes after */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Server dropdown */}
              <div className="relative">
                <button
                  ref={serverButtonRef}
                  onClick={() => setShowServerDropdown(!showServerDropdown)}
                  className={`px-2 lg:px-3 py-1.5 rounded-lg ${theme.input} text-sm flex items-center gap-1.5 max-w-[110px] lg:max-w-[160px] justify-between
                            ${selectedServer ? (darkMode ? "border-green-400/50" : "border-blue-400/50") : ""}
                            cursor-pointer hover:bg-opacity-80 transition-colors`}
                  type="button"
                >
                  <span className="truncate text-xs lg:text-sm">{selectedServer || "All Servers"}</span>
                  <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${showServerDropdown ? "rotate-180" : ""}`}
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <ServerDropdown
                  isOpen={showServerDropdown} onClose={() => setShowServerDropdown(false)}
                  servers={filteredServers} selectedServer={selectedServer}
                  onServerSelect={handleServerSelect} onClearServer={handleClearServer}
                  searchTerm={serverSearchTerm} onSearchChange={setServerSearchTerm}
                  theme={theme} darkMode={darkMode}
                />
              </div>

              {/* Path dropdown */}
              <div className="relative">
                <button
                  ref={pathButtonRef}
                  onClick={() => selectedServer && setShowPathDropdown(!showPathDropdown)}
                  className={`px-2 lg:px-3 py-1.5 rounded-lg ${theme.input} text-sm flex items-center gap-1.5 max-w-[110px] lg:max-w-[160px] justify-between
                            ${!selectedServer ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-opacity-80"}
                            ${selectedPath ? (darkMode ? "border-purple-400/50" : "border-purple-500/50") : ""}`}
                  type="button" disabled={!selectedServer}
                  title={!selectedServer ? "Select a server first" : "Filter by path"}
                >
                  <span className="truncate text-xs lg:text-sm">{selectedPath ? getShortPath(selectedPath) : "All Paths"}</span>
                  <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${showPathDropdown ? "rotate-180" : ""}`}
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {selectedServer && (
                  <PathDropdown
                    isOpen={showPathDropdown} onClose={() => setShowPathDropdown(false)}
                    paths={filteredPaths} selectedPath={selectedPath}
                    onPathSelect={handlePathSelect} onClearPath={handleClearPath}
                    searchTerm={pathSearchTerm} onSearchChange={setPathSearchTerm}
                    theme={theme} darkMode={darkMode}
                  />
                )}
              </div>
            </div>

            {/* Search — hidden on md (shown in row 2), visible on lg+ */}
            <div className="relative flex-1 min-w-0 hidden lg:block">
              <input
                type="text"
                placeholder={isRegex ? "Regex pattern..." : "Search logs..."}
                className={`w-full ${theme.input} rounded-lg px-3 py-1.5 pr-14 text-sm focus:outline-none
                         focus:ring-2 ${regexError ? 'focus:ring-red-500/50 border-red-500/50' : darkMode ? "focus:ring-green-500/50" : "focus:ring-blue-500/50"} focus:border-transparent`}
                value={logSearchTerm}
                onChange={(e) => setLogSearchTerm(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {regexError && <span className="text-red-400 text-xs">!</span>}
                <button
                  onClick={() => setIsRegex((v) => !v)}
                  className={`text-xs px-1.5 py-0.5 rounded font-mono transition-colors ${
                    isRegex
                      ? darkMode ? 'bg-green-500/30 text-green-300' : 'bg-blue-500/20 text-blue-600'
                      : `${theme.textMuted} hover:${theme.textSecondary}`
                  }`}
                  title="Toggle regex search"
                >.*</button>
                <svg className={`w-3.5 h-3.5 ${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-0.5 lg:gap-1 flex-shrink-0 ml-auto">
              {/* Pause */}
              <button
                onClick={togglePause}
                className={`p-1.5 rounded-lg transition-colors ${isPaused ? accentPaused : theme.input}`}
                title={isPaused ? "Resume stream" : "Pause stream"}
              >
                {isPaused ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                )}
              </button>

              {/* Export */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu((v) => !v)}
                  className={`p-1.5 rounded-lg ${theme.input} transition-colors`}
                  title="Export logs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                {showExportMenu && (
                  <div className={`absolute right-0 top-9 z-50 w-32 rounded-lg shadow-xl border ${theme.border} ${theme.card} overflow-hidden`}>
                    <button onClick={() => exportLogs('json')} className={`w-full text-left px-4 py-2 text-sm ${theme.hover} ${theme.textSecondary}`}>
                      Export JSON
                    </button>
                    <button onClick={() => exportLogs('csv')} className={`w-full text-left px-4 py-2 text-sm ${theme.hover} ${theme.textSecondary}`}>
                      Export CSV
                    </button>
                  </div>
                )}
              </div>

              <div className={`w-px h-4 bg-current opacity-20`} />

              <ThemeToggle darkMode={darkMode} onToggle={onThemeToggle} />

              {/* Auto-scroll */}
              <button
                onClick={() => setAutoScroll(!autoScroll)}
              className={`p-1.5 rounded-lg transition-colors ${autoScroll ? accentActive : theme.input}`}
              title="Auto-scroll"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

              {/* Split view open (panel 1 only) */}
              {!onClosePanel && (
                <button
                  onClick={onOpenSplit}
                  className={`hidden md:flex p-1.5 rounded-lg transition-colors ${splitView ? accentActive : theme.input}`}
                  title="Open split view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                  </svg>
                </button>
              )}
              {/* Close panel (panel 2 only) */}
              {onClosePanel && (
                <button
                  onClick={onClosePanel}
                  className={`hidden md:flex p-1.5 rounded-lg transition-colors ${theme.input} hover:text-red-400 hover:bg-red-500/10`}
                  title="Close this panel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Clear */}
              <button
                onClick={() => { onClearLogs(selectedTopic); handleClearServer(); handleClearPath(); setKeywords([]); }}
                className={`p-1.5 rounded-lg ${theme.input} hover:text-red-400 hover:bg-red-500/10 transition-colors`}
                title="Clear logs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Row 2 (md only): search full width — hidden on lg+ (search is in row 1) */}
          <div className="flex lg:hidden mt-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={isRegex ? "Regex pattern..." : "Search logs..."}
                className={`w-full ${theme.input} rounded-lg px-3 py-1.5 pr-14 text-sm focus:outline-none
                         focus:ring-2 ${regexError ? 'focus:ring-red-500/50 border-red-500/50' : darkMode ? "focus:ring-green-500/50" : "focus:ring-blue-500/50"} focus:border-transparent`}
                value={logSearchTerm}
                onChange={(e) => setLogSearchTerm(e.target.value)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {regexError && <span className="text-red-400 text-xs">!</span>}
                <button
                  onClick={() => setIsRegex((v) => !v)}
                  className={`text-xs px-1.5 py-0.5 rounded font-mono transition-colors ${
                    isRegex
                      ? darkMode ? 'bg-green-500/30 text-green-300' : 'bg-blue-500/20 text-blue-600'
                      : `${theme.textMuted} hover:${theme.textSecondary}`
                  }`}
                  title="Toggle regex search"
                >.*</button>
                <svg className={`w-3.5 h-3.5 ${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 min-w-0">
              <button onClick={onOpenSidebar} className={`p-2 rounded-lg ${theme.input} flex-shrink-0`} aria-label="Open sidebar">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-base font-semibold truncate max-w-[130px]">
                <span className={`${darkMode ? "bg-gradient-to-r from-green-400 to-emerald-400" : "bg-gradient-to-r from-blue-500 to-indigo-500"} bg-clip-text text-transparent`}>
                  {selectedTopic}
                </span>
              </h2>
              <span className={`text-xs ${theme.card} px-2 py-0.5 rounded-full ${theme.textMuted} flex-shrink-0`}>
                {filteredLogs?.length || 0}
              </span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <ThemeToggle darkMode={darkMode} onToggle={onThemeToggle} />
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`p-2 rounded-lg ${theme.input}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="space-y-2 mb-3 p-2 rounded-lg bg-opacity-50">
              {/* Server dropdown mobile */}
              <div className="relative w-full">
                <button
                  ref={serverButtonRef}
                  onClick={() => setShowServerDropdown(!showServerDropdown)}
                  className={`w-full px-3 py-2 rounded-lg ${theme.input} text-sm flex items-center justify-between
                            ${selectedServer ? (darkMode ? "border-green-400/50" : "border-blue-400/50") : ""}`}
                  type="button"
                >
                  <span className="truncate">{selectedServer || "All Servers"}</span>
                  <svg className={`w-4 h-4 transition-transform ${showServerDropdown ? "rotate-180" : ""}`}
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <ServerDropdown
                  isOpen={showServerDropdown} onClose={() => setShowServerDropdown(false)}
                  servers={filteredServers} selectedServer={selectedServer}
                  onServerSelect={handleServerSelect} onClearServer={handleClearServer}
                  searchTerm={serverSearchTerm} onSearchChange={setServerSearchTerm}
                  theme={theme} darkMode={darkMode}
                />
              </div>

              {/* Path dropdown mobile */}
              <div className="relative w-full">
                <button
                  ref={pathButtonRef}
                  onClick={() => selectedServer && setShowPathDropdown(!showPathDropdown)}
                  className={`w-full px-3 py-2 rounded-lg ${theme.input} text-sm flex items-center justify-between
                            ${!selectedServer ? "opacity-50" : ""}
                            ${selectedPath ? (darkMode ? "border-purple-400/50" : "border-purple-500/50") : ""}`}
                  type="button" disabled={!selectedServer}
                >
                  <span className="truncate">{selectedPath ? getShortPath(selectedPath) : "All Paths"}</span>
                  <svg className={`w-4 h-4 transition-transform ${showPathDropdown ? "rotate-180" : ""}`}
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {selectedServer && (
                  <PathDropdown
                    isOpen={showPathDropdown} onClose={() => setShowPathDropdown(false)}
                    paths={filteredPaths} selectedPath={selectedPath}
                    onPathSelect={handlePathSelect} onClearPath={handleClearPath}
                    searchTerm={pathSearchTerm} onSearchChange={setPathSearchTerm}
                    theme={theme} darkMode={darkMode}
                  />
                )}
              </div>

              {/* Time range mobile */}
              <div className="flex flex-wrap gap-1">
                {TIME_RANGES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setTimeRange(r.value)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      timeRange === r.value ? accentActive : `${theme.input} ${theme.textMuted}`
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Mobile action buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={togglePause}
                  className={`flex-1 p-2 rounded-lg text-sm flex items-center justify-center space-x-1 ${isPaused ? accentPaused : theme.input}`}
                >
                  <span>{isPaused ? '▶ Resume' : '⏸ Pause'}</span>
                </button>
                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`flex-1 p-2 rounded-lg text-sm flex items-center justify-center space-x-1 ${autoScroll ? accentActive : theme.input}`}
                >
                  <span>Auto-scroll</span>
                </button>
                <button
                  onClick={() => exportLogs('json')}
                  className={`flex-1 p-2 rounded-lg ${theme.input} text-sm flex items-center justify-center`}
                >
                  Export JSON
                </button>
                <button
                  onClick={() => exportLogs('csv')}
                  className={`flex-1 p-2 rounded-lg ${theme.input} text-sm flex items-center justify-center`}
                >
                  Export CSV
                </button>
                <button
                  onClick={() => { onClearLogs(selectedTopic); handleClearServer(); handleClearPath(); setKeywords([]); }}
                  className={`flex-1 p-2 rounded-lg ${theme.input} hover:text-red-400 text-sm flex items-center justify-center`}
                >
                  Clear logs
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search — mobile only (desktop search is in the header row above) */}
        <div className="mt-2 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder={isRegex ? "Regex pattern..." : "Search logs..."}
              className={`w-full ${theme.input} rounded-lg px-3 py-2 pr-16 text-sm focus:outline-none
                       focus:ring-2 ${regexError ? 'focus:ring-red-500/50' : darkMode ? "focus:ring-green-500/50" : "focus:ring-blue-500/50"} focus:border-transparent`}
              value={logSearchTerm}
              onChange={(e) => setLogSearchTerm(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => setIsRegex((v) => !v)}
                className={`text-xs px-1.5 py-0.5 rounded font-mono transition-colors ${
                  isRegex ? (darkMode ? 'bg-green-500/30 text-green-300' : 'bg-blue-500/20 text-blue-600') : theme.textMuted
                }`}
                title="Toggle regex"
              >.*</button>
              <svg className={`w-4 h-4 ${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Time range filter — desktop (shown below header row) */}
        <div className="hidden md:flex items-center gap-1.5 mt-2">
          <span className={`text-xs ${theme.textMuted} mr-1`}>Range:</span>
          {TIME_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setTimeRange(r.value)}
              className={`px-2.5 py-0.5 rounded-full text-xs transition-colors ${
                timeRange === r.value ? accentActive : `${theme.input} ${theme.textMuted}`
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Keyword filter */}
        <div className="mt-2">
          <KeywordFilter
            keywords={keywords}
            inputValue={keywordInput}
            onInputChange={setKeywordInput}
            onAdd={(kw) => setKeywords((prev) => [...prev, kw])}
            onRemove={(text) => setKeywords((prev) => prev.filter((k) => k.text !== text))}
            onClearAll={() => { setKeywords([]); setKeywordInput(''); }}
            mode={keywordMode}
            onModeChange={setKeywordMode}
            theme={theme}
            darkMode={darkMode}
          />
        </div>

        {/* Active filters */}
        {(selectedServer || selectedPath || logSearchTerm || keywords.length > 0) && (
          <div className="flex items-center flex-wrap gap-2 text-xs mt-2">
            <span className={theme.textMuted}>Active filters:</span>
            {selectedServer && (
              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${darkMode ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-600"}`}>
                <span className="max-w-[120px] truncate">Server: {selectedServer}</span>
                <button onClick={handleClearServer} className="hover:text-red-400 ml-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {selectedPath && (
              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-500/20 text-purple-600"}`}>
                <span className="max-w-[120px] truncate">Path: {getShortPath(selectedPath)}</span>
                <button onClick={handleClearPath} className="hover:text-red-400 ml-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {logSearchTerm && (
              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${darkMode ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-500/20 text-yellow-600"}`}>
                <span className="max-w-[120px] truncate">{isRegex ? 'Regex:' : 'Search:'} {logSearchTerm}</span>
                <button onClick={() => setLogSearchTerm("")} className="hover:text-red-400 ml-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Logs Area ──────────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-auto font-mono text-sm" ref={scrollRef}>
          <div className="p-3 sm:p-4 md:p-5 space-y-2">
            {isPaused && (
              <div className={`text-center py-2 px-4 rounded-lg text-xs ${accentPaused} mb-2`}>
                Stream paused — new logs are buffered
              </div>
            )}
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, i) => (
                <LogEntry key={i} log={log} theme={theme} darkMode={darkMode} keywords={keywords} now={now} />
              ))
            ) : (
              <div className={`flex flex-col items-center justify-center h-64 ${theme.textMuted}`}>
                <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg">No logs to display</p>
                <p className="text-sm px-4 text-center">
                  {selectedServer && selectedPath
                    ? `No logs from "${selectedServer}" at "${getShortPath(selectedPath)}"`
                    : selectedServer
                      ? `No logs from "${selectedServer}"`
                      : timeRange !== 'all'
                        ? `No logs in the last ${TIME_RANGES.find(r => r.value === timeRange)?.label}`
                        : "Waiting for incoming logs..."}
                </p>
                {(selectedServer || selectedPath) && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedPath && (
                      <button onClick={handleClearPath} className={`px-3 py-2 rounded-lg ${theme.input} text-sm`}>Clear path</button>
                    )}
                    {selectedServer && (
                      <button onClick={handleClearServer} className={`px-3 py-2 rounded-lg ${theme.input} text-sm`}>Clear server</button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating scroll buttons */}
        <div className="absolute right-3 bottom-4 flex flex-col gap-2 z-10">
          {!atTop && (
            <button
              onClick={scrollToTop}
              className={`p-2 rounded-full shadow-lg ${theme.card} border ${theme.border} ${theme.textMuted} hover:${theme.textSecondary} transition-all`}
              title="Scroll to top"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          )}
          {!atBottom && (
            <button
              onClick={scrollToBottom}
              className={`p-2 rounded-full shadow-lg ${theme.card} border ${theme.border} ${theme.textMuted} hover:${theme.textSecondary} transition-all`}
              title="Scroll to bottom"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Status Bar ─────────────────────────────────────────────────────── */}
      <div className={`border-t ${theme.border} px-3 sm:px-4 md:px-5 py-2 ${theme.statusBar} backdrop-blur-xl text-xs ${theme.textMuted} flex items-center justify-between gap-2 flex-shrink-0`}>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
          {/* Connection status */}
          <div className="flex items-center space-x-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${
              isConnected
                ? `${darkMode ? 'bg-green-400' : 'bg-blue-500'} animate-pulse`
                : isReconnecting
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-red-500'
            }`} />
            <span>
              {isConnected ? 'Connected' : isReconnecting ? 'Reconnecting…' : 'Disconnected'}
            </span>
          </div>

          {/* Log rate */}
          {logRates?.[selectedTopic] > 0 && (
            <span>{logRates[selectedTopic]} logs/s</span>
          )}

          {/* Pause indicator */}
          {isPaused && <span className="text-amber-400">Paused</span>}

          {/* Server filter */}
          {selectedServer && (
            <button
              onClick={handleClearServer}
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded
                       ${darkMode ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-600"}
                       hover:bg-red-500/20 hover:text-red-400 transition-colors group`}
            >
              <span className="max-w-[100px] truncate">{selectedServer}</span>
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Path filter */}
          {selectedPath && (
            <button
              onClick={handleClearPath}
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded
                       ${darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-500/20 text-purple-600"}
                       hover:bg-red-500/20 hover:text-red-400 transition-colors group`}
            >
              <span className="max-w-[100px] truncate">{getShortPath(selectedPath)}</span>
              <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <span className="text-xs whitespace-nowrap">{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default LogPanel;
