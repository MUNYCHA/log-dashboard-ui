import React, { useState, useRef, useEffect, useMemo } from 'react';
import ServerDropdown from './ServerDropdown';
import LogEntry from './LogEntry';
import ThemeToggle from './ThemeToggle'; // Add this import

const LogPanel = ({ 
  selectedTopic,
  logsByTopic,
  selectedServer,
  onServerSelect,
  onClearServer,
  onClearLogs,
  theme,
  darkMode,
  onThemeToggle // Add this prop
}) => {
  const [logSearchTerm, setLogSearchTerm] = useState("");
  const [logLevel, setLogLevel] = useState("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [showServerDropdown, setShowServerDropdown] = useState(false);
  const [serverSearchTerm, setServerSearchTerm] = useState("");
  const scrollRef = useRef(null);
  const dropdownButtonRef = useRef(null);

  const serversForSelectedTopic = useMemo(() => 
    selectedTopic 
      ? [...new Set(logsByTopic[selectedTopic]?.map(log => log.serverName) || [])].sort()
      : []
  , [selectedTopic, logsByTopic]);

  const filteredServers = useMemo(() => 
    serversForSelectedTopic.filter(server =>
      server.toLowerCase().includes(serverSearchTerm.toLowerCase())
    )
  , [serversForSelectedTopic, serverSearchTerm]);

  const filteredLogs = useMemo(() => 
    selectedTopic
      ? logsByTopic[selectedTopic]?.filter(log => {
          if (selectedServer && log.serverName !== selectedServer) {
            return false;
          }
          
          const matchesSearch = logSearchTerm === "" || 
            log.message.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
            log.serverName.toLowerCase().includes(logSearchTerm.toLowerCase());
          
          const matchesLevel = logLevel === "all" || log.level === logLevel;
          
          return matchesSearch && matchesLevel;
        }) || []
      : []
  , [selectedTopic, logsByTopic, selectedServer, logSearchTerm, logLevel]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const handleServerSelect = (server) => {
    onServerSelect(server);
    setShowServerDropdown(false);
    setServerSearchTerm("");
  };

  if (!selectedTopic) {
    return (
      <div className={`flex-1 flex flex-col ${theme.background}`}>
        <div className={`flex-1 flex items-center justify-center ${theme.textMuted}`}>
          <div className="text-center">
            <svg className="w-12 h-12 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">Select a topic to view logs</p>
            <p className="text-sm">Choose from the sidebar to start monitoring</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col ${theme.background}`}>
      <div className={`border-b ${theme.border} px-6 py-4 ${theme.header} backdrop-blur-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">
              <span className={`${darkMode ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'} bg-clip-text text-transparent`}>
                {selectedTopic}
              </span>
            </h2>
            <span className={`text-xs ${theme.card} px-3 py-1 rounded-full ${theme.textMuted}`}>
              {filteredLogs?.length || 0} logs
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle - Add this at the beginning of controls */}
            <ThemeToggle darkMode={darkMode} onToggle={onThemeToggle} />

            {/* Server Dropdown */}
            <div className="relative">
              <button
                ref={dropdownButtonRef}
                onClick={() => setShowServerDropdown(!showServerDropdown)}
                className={`px-3 py-1.5 rounded-lg ${theme.input} text-sm flex items-center space-x-2 min-w-[160px] justify-between
                          ${selectedServer ? (darkMode ? 'border-green-400/50' : 'border-blue-400/50') : ''}
                          cursor-pointer hover:bg-opacity-80 transition-colors`}
                type="button"
              >
                <span className="truncate">
                  {selectedServer ? selectedServer : "All Servers"}
                </span>
                <svg className={`w-4 h-4 transition-transform flex-shrink-0 ${showServerDropdown ? 'rotate-180' : ''}`} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <ServerDropdown
                isOpen={showServerDropdown}
                onClose={() => setShowServerDropdown(false)}
                servers={filteredServers}
                selectedServer={selectedServer}
                onServerSelect={handleServerSelect}
                onClearServer={onClearServer}
                searchTerm={serverSearchTerm}
                onSearchChange={setServerSearchTerm}
                theme={theme}
                darkMode={darkMode}
              />
            </div>

            {/* Level Select */}
            <select
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
              className={`${theme.input} rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 
                       ${darkMode ? 'focus:ring-green-500/50' : 'focus:ring-blue-500/50'} cursor-pointer`}
            >
              <option value="all">All Levels</option>
              <option value="error">Errors</option>
              <option value="warn">Warnings</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>

            {/* Auto-scroll Button */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`p-2 rounded-lg transition-colors ${
                autoScroll 
                  ? darkMode ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-600'
                  : theme.input
              }`}
              title="Auto-scroll"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Clear Logs Button */}
            <button
              onClick={() => {
                onClearLogs(selectedTopic);
                onClearServer();
              }}
              className={`p-2 rounded-lg ${theme.input} hover:text-red-400 
                       hover:bg-red-500/10 transition-colors`}
              title="Clear logs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <input
            type="text"
            placeholder="Search in logs (message or server)..."
            className={`w-full ${theme.input} rounded-lg px-4 py-2 text-sm focus:outline-none 
                     focus:ring-2 ${darkMode ? 'focus:ring-green-500/50' : 'focus:ring-blue-500/50'} focus:border-transparent`}
            value={logSearchTerm}
            onChange={(e) => setLogSearchTerm(e.target.value)}
          />
          
          {(selectedServer || logLevel !== 'all' || logSearchTerm) && (
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <span className={theme.textMuted}>Active filters:</span>
              {selectedServer && (
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full 
                               ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-600'}`}>
                  <span>Server: {selectedServer}</span>
                  <button
                    onClick={onClearServer}
                    className="hover:text-red-400 ml-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {logLevel !== 'all' && (
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full 
                               ${darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-500/20 text-purple-600'}`}>
                  <span>Level: {logLevel}</span>
                  <button
                    onClick={() => setLogLevel('all')}
                    className="hover:text-red-400 ml-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {logSearchTerm && (
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full 
                               ${darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-500/20 text-yellow-600'}`}>
                  <span>Search: "{logSearchTerm}"</span>
                  <button
                    onClick={() => setLogSearchTerm('')}
                    className="hover:text-red-400 ml-1"
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

      <div 
        className="flex-1 overflow-auto font-mono text-sm"
        ref={scrollRef}
      >
        <div className="p-6 space-y-2">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, i) => (
              <LogEntry
                key={i}
                log={log}
                onServerSelect={handleServerSelect}
                selectedServer={selectedServer}
                theme={theme}
                darkMode={darkMode}
              />
            ))
          ) : (
            <div className={`flex flex-col items-center justify-center h-64 ${theme.textMuted}`}>
              <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">No logs to display</p>
              <p className="text-sm">
                {selectedServer 
                  ? `No logs from server "${selectedServer}" match your criteria` 
                  : "Waiting for incoming logs..."}
              </p>
              {selectedServer && (
                <button
                  onClick={onClearServer}
                  className={`mt-4 px-4 py-2 rounded-lg ${theme.input} text-sm transition-colors
                           ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                >
                  Clear server filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={`border-t ${theme.border} px-6 py-2 ${theme.statusBar} backdrop-blur-xl 
                    text-xs ${theme.textMuted} flex items-center justify-between`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span>Connected</span>
            <span className={`w-1.5 h-1.5 ${darkMode ? 'bg-green-400' : 'bg-blue-500'} rounded-full animate-pulse`} />
          </div>
          {selectedServer && (
            <div className="flex items-center space-x-1">
              <span>Filtering:</span>
              <button
                onClick={onClearServer}
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded 
                         ${darkMode ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-600'}
                         hover:bg-red-500/20 hover:text-red-400 transition-colors group`}
              >
                <span>{selectedServer}</span>
                <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <span>
          Last update: {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default LogPanel;