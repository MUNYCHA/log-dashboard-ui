import React, { useState, useRef, useEffect, useMemo } from "react";
import ServerDropdown from "./ServerDropdown";
import PathDropdown from "./PathDropdown";
import LogEntry from "./LogEntry";
import ThemeToggle from "./ThemeToggle";
import KeywordFilter from "./KeywordFilter";

const LogPanel = ({
  selectedTopic,
  logsByTopic,
  selectedServer,
  onServerSelect,
  onClearServer,
  onClearLogs,
  isConnected,
  theme,
  darkMode,
  onThemeToggle,
}) => {
  const [logSearchTerm, setLogSearchTerm] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [showPathDropdown, setShowPathDropdown] = useState(false);
  const [serverSearchTerm, setServerSearchTerm] = useState("");
  const [pathSearchTerm, setPathSearchTerm] = useState("");
  const [selectedPath, setSelectedPath] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');

  const scrollRef = useRef(null);
  const serverButtonRef = useRef(null);
  const pathButtonRef = useRef(null);

  // Get unique servers for selected topic
  const serversForSelectedTopic = useMemo(
    () =>
      selectedTopic
        ? [
            ...new Set(
              logsByTopic[selectedTopic]?.map((log) => log.serverName) || [],
            ),
          ].sort()
        : [],
    [selectedTopic, logsByTopic],
  );

  // Get unique paths for selected server (or all paths if no server selected)
  const pathsForSelectedServer = useMemo(() => {
    if (!selectedTopic || !logsByTopic[selectedTopic]) return [];

    let logs = logsByTopic[selectedTopic];
    if (selectedServer) {
      logs = logs.filter((log) => log.serverName === selectedServer);
    }

    return [...new Set(logs.map((log) => log.path) || [])].sort();
  }, [selectedTopic, logsByTopic, selectedServer]);

  // Filter servers by search term
  const filteredServers = useMemo(
    () =>
      serversForSelectedTopic.filter((server) =>
        server.toLowerCase().includes(serverSearchTerm.toLowerCase()),
      ),
    [serversForSelectedTopic, serverSearchTerm],
  );

  // Filter paths by search term
  const filteredPaths = useMemo(
    () =>
      pathsForSelectedServer.filter((path) =>
        path.toLowerCase().includes(pathSearchTerm.toLowerCase()),
      ),
    [pathsForSelectedServer, pathSearchTerm],
  );

  // Filter logs based on server and path selection
  const filteredLogs = useMemo(() => {
    if (!selectedTopic || !logsByTopic[selectedTopic]) return [];

    // First, filter the logs
    const filtered = logsByTopic[selectedTopic].filter((log) => {
      // Server filter
      if (selectedServer && log.serverName !== selectedServer) {
        return false;
      }

      // Path filter
      if (selectedPath && log.path !== selectedPath) {
        return false;
      }

      // Search filter
      const matchesSearch =
        logSearchTerm === "" ||
        log.message.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
        log.serverName.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
        log.path.toLowerCase().includes(logSearchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Keyword filter — includes uncommitted input text as a live keyword (OR logic, case-insensitive)
      const pendingInput = keywordInput.trim().toLowerCase();
      const activeKeywords = [
        ...keywords.map((k) => k.text),
        ...(pendingInput ? [pendingInput] : []),
      ];
      if (activeKeywords.length > 0) {
        const haystack = log.message.toLowerCase();
        if (!activeKeywords.some((kw) => haystack.includes(kw))) return false;
      }

      return true;
    });

    // Create a new array with spread, then reverse
    return [...filtered].reverse();
  }, [selectedTopic, logsByTopic, selectedServer, selectedPath, logSearchTerm, keywords, keywordInput]);
  
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const handleServerSelect = (server) => {
    onServerSelect(server);
    setSelectedPath(null);
    setShowServerDropdown(false);
    setServerSearchTerm("");
  };

  const handlePathSelect = (path) => {
    setSelectedPath(path);
    setShowPathDropdown(false);
    setPathSearchTerm("");
  };

  const handleClearServer = () => {
    onClearServer();
    setSelectedPath(null);
  };

  const handleClearPath = () => {
    setSelectedPath(null);
  };

  // Show last two path segments with ellipsis prefix when path is deeper
  const getShortPath = (path) => {
    if (!path) return path;
    const parts = path.split("/").filter(Boolean);
    if (parts.length <= 2) return path;
    return `\u2026/${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
  };

  if (!selectedTopic) {
    return (
      <div className={`flex-1 flex flex-col ${theme.background}`}>
        <div
          className={`flex-1 flex items-center justify-center ${theme.textMuted}`}
        >
          <div className="text-center">
            <svg
              className="w-12 h-12 mb-4 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg">Select a topic to view logs</p>
            <p className="text-sm">
              Choose from the sidebar to start monitoring
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col ${theme.background}`}>
      <div
        className={`border-b ${theme.border} px-3 sm:px-4 md:px-6 py-3 sm:py-4 ${theme.header} backdrop-blur-xl`}
      >
        {/* Desktop Layout - visible on md screens and up */}
        <div className="hidden md:block">
          {/* Single row with all controls for desktop */}
          <div className="flex items-center justify-between">
            {/* Left side: Topic and log count */}
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold">
                <span
                  className={`${darkMode ? "bg-gradient-to-r from-green-400 to-emerald-400" : "bg-gradient-to-r from-blue-500 to-indigo-500"} bg-clip-text text-transparent`}
                >
                  {selectedTopic}
                </span>
              </h2>
              <span
                className={`text-xs ${theme.card} px-3 py-1 rounded-full ${theme.textMuted}`}
              >
                {filteredLogs?.length || 0} logs
              </span>
            </div>

            {/* Middle: Server and Path dropdowns */}
            <div className="flex items-center space-x-3">
              {/* Server Dropdown */}
              <div className="relative">
                <button
                  ref={serverButtonRef}
                  onClick={() => setShowServerDropdown(!showServerDropdown)}
                  className={`px-3 py-1.5 rounded-lg ${theme.input} text-sm flex items-center space-x-2 min-w-[160px] justify-between
                            ${selectedServer ? (darkMode ? "border-green-400/50" : "border-blue-400/50") : ""}
                            cursor-pointer hover:bg-opacity-80 transition-colors`}
                  type="button"
                >
                  <span className="truncate">
                    {selectedServer ? selectedServer : "All Servers"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform flex-shrink-0 ${showServerDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <ServerDropdown
                  isOpen={showServerDropdown}
                  onClose={() => setShowServerDropdown(false)}
                  servers={filteredServers}
                  selectedServer={selectedServer}
                  onServerSelect={handleServerSelect}
                  onClearServer={handleClearServer}
                  searchTerm={serverSearchTerm}
                  onSearchChange={setServerSearchTerm}
                  theme={theme}
                  darkMode={darkMode}
                />
              </div>

              {/* Path Dropdown */}
              <div className="relative">
                <button
                  ref={pathButtonRef}
                  onClick={() =>
                    selectedServer && setShowPathDropdown(!showPathDropdown)
                  }
                  className={`px-3 py-1.5 rounded-lg ${theme.input} text-sm flex items-center space-x-2 min-w-[160px] justify-between
                            ${!selectedServer ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-opacity-80"}
                            ${selectedPath ? (darkMode ? "border-purple-400/50" : "border-purple-500/50") : ""}`}
                  type="button"
                  disabled={!selectedServer}
                  title={
                    !selectedServer ? "Select a server first" : "Filter by path"
                  }
                >
                  <span className="truncate">
                    {selectedPath ? getShortPath(selectedPath) : "All Paths"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform flex-shrink-0 ${showPathDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {selectedServer && (
                  <PathDropdown
                    isOpen={showPathDropdown}
                    onClose={() => setShowPathDropdown(false)}
                    paths={filteredPaths}
                    selectedPath={selectedPath}
                    onPathSelect={handlePathSelect}
                    onClearPath={handleClearPath}
                    searchTerm={pathSearchTerm}
                    onSearchChange={setPathSearchTerm}
                    theme={theme}
                    darkMode={darkMode}
                  />
                )}
              </div>
            </div>

            {/* Right side: Controls */}
            <div className="flex items-center space-x-2">
              <ThemeToggle darkMode={darkMode} onToggle={onThemeToggle} />

              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`p-2 rounded-lg transition-colors ${
                  autoScroll
                    ? darkMode
                      ? "bg-green-500/20 text-green-400"
                      : "bg-blue-500/20 text-blue-600"
                    : theme.input
                }`}
                title="Auto-scroll"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              <button
                onClick={() => {
                  onClearLogs(selectedTopic);
                  handleClearServer();
                  handleClearPath();
                  setKeywords([]);
                }}
                className={`p-2 rounded-lg ${theme.input} hover:text-red-400 
                         hover:bg-red-500/10 transition-colors`}
                title="Clear logs"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout - visible on smaller screens */}
        <div className="md:hidden">
          {/* Top row: Topic and mobile menu button */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold truncate max-w-[150px]">
                <span
                  className={`${darkMode ? "bg-gradient-to-r from-green-400 to-emerald-400" : "bg-gradient-to-r from-blue-500 to-indigo-500"} bg-clip-text text-transparent`}
                >
                  {selectedTopic}
                </span>
              </h2>
              <span
                className={`text-xs ${theme.card} px-2 py-0.5 rounded-full ${theme.textMuted}`}
              >
                {filteredLogs?.length || 0}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <ThemeToggle darkMode={darkMode} onToggle={onThemeToggle} />
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg ${theme.input}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile dropdowns (visible when menu is open) */}
          {isMobileMenuOpen && (
            <div className="space-y-2 mb-3 p-2 rounded-lg bg-opacity-50 backdrop-blur-sm">
              {/* Server Dropdown - Mobile */}
              <div className="relative w-full">
                <button
                  ref={serverButtonRef}
                  onClick={() => setShowServerDropdown(!showServerDropdown)}
                  className={`w-full px-3 py-2 rounded-lg ${theme.input} text-sm flex items-center justify-between
                            ${selectedServer ? (darkMode ? "border-green-400/50" : "border-blue-400/50") : ""}`}
                  type="button"
                >
                  <span className="truncate">
                    {selectedServer ? selectedServer : "All Servers"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showServerDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <ServerDropdown
                  isOpen={showServerDropdown}
                  onClose={() => setShowServerDropdown(false)}
                  servers={filteredServers}
                  selectedServer={selectedServer}
                  onServerSelect={handleServerSelect}
                  onClearServer={handleClearServer}
                  searchTerm={serverSearchTerm}
                  onSearchChange={setServerSearchTerm}
                  theme={theme}
                  darkMode={darkMode}
                />
              </div>

              {/* Path Dropdown - Mobile */}
              <div className="relative w-full">
                <button
                  ref={pathButtonRef}
                  onClick={() => selectedServer && setShowPathDropdown(!showPathDropdown)}
                  className={`w-full px-3 py-2 rounded-lg ${theme.input} text-sm flex items-center justify-between
                            ${!selectedServer ? "opacity-50" : ""}
                            ${selectedPath ? (darkMode ? "border-purple-400/50" : "border-purple-500/50") : ""}`}
                  type="button"
                  disabled={!selectedServer}
                >
                  <span className="truncate">
                    {selectedPath ? getShortPath(selectedPath) : "All Paths"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showPathDropdown ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {selectedServer && (
                  <PathDropdown
                    isOpen={showPathDropdown}
                    onClose={() => setShowPathDropdown(false)}
                    paths={filteredPaths}
                    selectedPath={selectedPath}
                    onPathSelect={handlePathSelect}
                    onClearPath={handleClearPath}
                    searchTerm={pathSearchTerm}
                    onSearchChange={setPathSearchTerm}
                    theme={theme}
                    darkMode={darkMode}
                  />
                )}
              </div>

              {/* Action buttons - Mobile */}
              <div className="flex space-x-2 pt-1">
                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`flex-1 p-2 rounded-lg text-sm flex items-center justify-center space-x-1
                            ${autoScroll
                              ? darkMode ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-600"
                              : theme.input
                            }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span>Auto</span>
                </button>

                <button
                  onClick={() => {
                    onClearLogs(selectedTopic);
                    handleClearServer();
                    handleClearPath();
                  }}
                  className={`flex-1 p-2 rounded-lg ${theme.input} hover:text-red-400 text-sm flex items-center justify-center space-x-1`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Clear</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search input - same for both layouts */}
        <div className="mt-2 md:mt-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search in logs (message, server, or path)..."
              className={`w-full ${theme.input} rounded-lg px-3 sm:px-4 py-2 pr-9 text-sm focus:outline-none
                       focus:ring-2 ${darkMode ? "focus:ring-green-500/50" : "focus:ring-blue-500/50"} focus:border-transparent`}
              value={logSearchTerm}
              onChange={(e) => setLogSearchTerm(e.target.value)}
            />
            <svg className={`absolute right-3 top-2.5 w-4 h-4 ${theme.textMuted}`}
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Keyword filter */}
          <KeywordFilter
            keywords={keywords}
            inputValue={keywordInput}
            onInputChange={setKeywordInput}
            onAdd={(kw) => setKeywords((prev) => [...prev, kw])}
            onRemove={(text) => setKeywords((prev) => prev.filter((k) => k.text !== text))}
            onClearAll={() => { setKeywords([]); setKeywordInput(''); }}
            theme={theme}
            darkMode={darkMode}
          />

          {/* Active filters */}
          {(selectedServer || selectedPath || logSearchTerm || keywords.length > 0) && (
            <div className="flex items-center flex-wrap gap-2 text-xs mt-2">
              <span className={theme.textMuted}>Active filters:</span>

              {selectedServer && (
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full 
                               ${darkMode ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-600"}`}
                >
                  <span className="max-w-[100px] sm:max-w-[150px] truncate">Server: {selectedServer}</span>
                  <button
                    onClick={handleClearServer}
                    className="hover:text-red-400 ml-1 flex-shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              {selectedPath && (
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full 
                               ${darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-500/20 text-purple-600"}`}
                >
                  <span className="max-w-[100px] sm:max-w-[150px] truncate">Path: {getShortPath(selectedPath)}</span>
                  <button
                    onClick={handleClearPath}
                    className="hover:text-red-400 ml-1 flex-shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              {logSearchTerm && (
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full 
                               ${darkMode ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-500/20 text-yellow-600"}`}
                >
                  <span className="max-w-[100px] sm:max-w-[150px] truncate">"{logSearchTerm}"</span>
                  <button
                    onClick={() => setLogSearchTerm("")}
                    className="hover:text-red-400 ml-1 flex-shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Logs Area */}
      <div className="flex-1 overflow-auto font-mono text-sm" ref={scrollRef}>
        <div className="p-3 sm:p-4 md:p-6 space-y-2">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, i) => (
              <LogEntry key={i} log={log} theme={theme} darkMode={darkMode} keywords={keywords} />
            ))
          ) : (
            <div
              className={`flex flex-col items-center justify-center h-64 ${theme.textMuted}`}
            >
              <svg
                className="w-12 h-12 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg">No logs to display</p>
              <p className="text-sm px-4 text-center">
                {selectedServer && selectedPath
                  ? `No logs from "${selectedServer}" with path "${getShortPath(selectedPath)}"`
                  : selectedServer
                    ? `No logs from "${selectedServer}"`
                    : "Waiting for incoming logs..."}
              </p>
              {(selectedServer || selectedPath) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedPath && (
                    <button
                      onClick={handleClearPath}
                      className={`px-3 py-2 rounded-lg ${theme.input} text-sm`}
                    >
                      Clear path
                    </button>
                  )}
                  {selectedServer && (
                    <button
                      onClick={handleClearServer}
                      className={`px-3 py-2 rounded-lg ${theme.input} text-sm`}
                    >
                      Clear server
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div
        className={`border-t ${theme.border} px-3 sm:px-4 md:px-6 py-2 ${theme.statusBar} backdrop-blur-xl 
                    text-xs ${theme.textMuted} flex flex-wrap items-center justify-between gap-2`}
      >
        <div className="flex items-center flex-wrap gap-2 sm:gap-4">
          <div className="flex items-center space-x-2">
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected
                  ? `${darkMode ? 'bg-green-400' : 'bg-blue-500'} animate-pulse`
                  : 'bg-red-500'
              }`}
            />
          </div>
          {selectedServer && (
            <div className="flex items-center space-x-1">
              <span className="hidden xs:inline">Server:</span>
              <button
                onClick={handleClearServer}
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded 
                         ${darkMode ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-600"}
                         hover:bg-red-500/20 hover:text-red-400 transition-colors group`}
              >
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{selectedServer}</span>
                <svg
                  className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {selectedPath && (
            <div className="flex items-center space-x-1">
              <span className="hidden xs:inline">Path:</span>
              <button
                onClick={handleClearPath}
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded 
                         ${darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-500/20 text-purple-600"}
                         hover:bg-red-500/20 hover:text-red-400 transition-colors group`}
              >
                <span className="max-w-[80px] sm:max-w-[120px] truncate">
                  {getShortPath(selectedPath)}
                </span>
                <svg
                  className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <span className="text-xs whitespace-nowrap">
          {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default LogPanel;