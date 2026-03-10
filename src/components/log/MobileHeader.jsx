import React from 'react';
import HeartbeatLine from '../common/HeartbeatLine';
import ThemeToggle from '../common/ThemeToggle';
import { ServerDropdown, PathDropdown } from '../filters';
import { TIME_RANGES, getShortPath } from './constants';

const MobileHeader = ({
  selectedTopic, displayedLogs, logRates, darkMode, theme,
  onOpenSidebar, onThemeToggle,
  isMobileMenuOpen, onToggleMobileMenu, mobileMenuReady,
  isPaused, onTogglePause,
  autoScroll, onToggleAutoScroll,
  onExport, onClearLogs,
  logSearchTerm, onSearchChange, isRegex, onToggleRegex, regexError,
  showMobileServerDropdown, onToggleMobileServerDropdown,
  showMobilePathDropdown, onToggleMobilePathDropdown,
  filteredServers, selectedServer, onServerSelect, onClearServer,
  serverSearchTerm, onServerSearchChange,
  filteredPaths, selectedPath, onPathSelect, onClearPath,
  pathSearchTerm, onPathSearchChange,
  timeRange, onTimeRangeChange,
  accentActive, accentPaused,
}) => (
  <>
    {/* Mobile layout */}
    <div className="md:hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 min-w-0">
          <button onClick={onOpenSidebar} className={`p-2 rounded-lg ${theme.input} flex-shrink-0`} aria-label="Open sidebar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-base font-semibold truncate max-w-[130px]">
            <span className={`${darkMode ? "bg-gradient-to-r from-green-400 to-emerald-400" : "bg-gradient-to-r from-indigo-500 to-violet-500"} bg-clip-text text-transparent`}>
              {selectedTopic}
            </span>
          </h2>
          <span className={`text-xs ${theme.card} px-2 py-0.5 rounded-full ${theme.textMuted} flex-shrink-0`}>
            {displayedLogs?.length || 0}
          </span>
          {logRates?.[selectedTopic] > 0 && (
            <span className="inline-flex items-center gap-1 flex-shrink-0">
              <span className={`text-xs ${theme.textMuted} whitespace-nowrap`}>
                {logRates[selectedTopic]}/s
              </span>
              <HeartbeatLine rate={logRates[selectedTopic]} darkMode={darkMode} />
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <ThemeToggle darkMode={darkMode} onToggle={onThemeToggle} />
          <button onClick={onToggleMobileMenu} className={`p-2 rounded-lg ${theme.input}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={`space-y-2 mb-3 p-2 rounded-lg bg-opacity-50 ${mobileMenuReady ? '' : 'pointer-events-none'}`}>
          {/* Server dropdown mobile */}
          <div className="relative w-full">
            <button
              onClick={() => onToggleMobileServerDropdown()}
              className={`w-full px-3 py-2 rounded-lg ${theme.input} text-sm flex items-center justify-between
                        ${selectedServer ? (darkMode ? "border-green-400/50" : "border-blue-400/50") : ""}`}
              type="button"
            >
              <span className="truncate">{selectedServer || "All Servers"}</span>
              <svg className={`w-4 h-4 transition-transform ${showMobileServerDropdown ? "rotate-180" : ""}`}
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ServerDropdown
              isOpen={showMobileServerDropdown} onClose={() => onToggleMobileServerDropdown(false)}
              servers={filteredServers} selectedServer={selectedServer}
              onServerSelect={onServerSelect} onClearServer={onClearServer}
              searchTerm={serverSearchTerm} onSearchChange={onServerSearchChange}
              theme={theme} darkMode={darkMode}
            />
          </div>

          {/* Path dropdown mobile */}
          <div className="relative w-full">
            <button
              onClick={() => selectedServer && onToggleMobilePathDropdown()}
              className={`w-full px-3 py-2 rounded-lg ${theme.input} text-sm flex items-center justify-between
                        ${!selectedServer ? "opacity-50" : ""}
                        ${selectedPath ? (darkMode ? "border-purple-400/50" : "border-purple-500/50") : ""}`}
              type="button" disabled={!selectedServer}
            >
              <span className="truncate">{selectedPath ? getShortPath(selectedPath) : "All Paths"}</span>
              <svg className={`w-4 h-4 transition-transform ${showMobilePathDropdown ? "rotate-180" : ""}`}
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {selectedServer && (
              <PathDropdown
                isOpen={showMobilePathDropdown} onClose={() => onToggleMobilePathDropdown(false)}
                paths={filteredPaths} selectedPath={selectedPath}
                onPathSelect={onPathSelect} onClearPath={onClearPath}
                searchTerm={pathSearchTerm} onSearchChange={onPathSearchChange}
                theme={theme} darkMode={darkMode}
              />
            )}
          </div>

          {/* Time range mobile */}
          <div className="flex flex-wrap gap-1">
            {TIME_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => onTimeRangeChange(r.value)}
                className={`px-3 py-1 rounded-full text-xs transition-all duration-150 hover:scale-105 active:scale-95 ${
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
              onClick={onTogglePause}
              className={`flex-1 p-2 rounded-lg text-sm flex items-center justify-center space-x-1 ${isPaused ? accentPaused : theme.input}`}
            >
              <span>{isPaused ? '\u25B6 Resume' : '\u23F8 Pause'}</span>
            </button>
            <button
              onClick={onToggleAutoScroll}
              className={`flex-1 p-2 rounded-lg text-sm flex items-center justify-center space-x-1 ${autoScroll ? accentActive : theme.input}`}
            >
              <span>Auto-scroll</span>
            </button>
            <button
              onClick={() => onExport('json')}
              className={`flex-1 p-2 rounded-lg ${theme.input} text-sm flex items-center justify-center`}
            >
              Export JSON
            </button>
            <button
              onClick={() => onExport('csv')}
              className={`flex-1 p-2 rounded-lg ${theme.input} text-sm flex items-center justify-center`}
            >
              Export CSV
            </button>
            <button
              onClick={() => onClearLogs(selectedTopic)}
              className={`flex-1 p-2 rounded-lg ${theme.input} hover:text-red-400 text-sm flex items-center justify-center`}
            >
              Clear logs
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Search — mobile only */}
    <div className="mt-2 md:hidden">
      <div className="relative">
        <input
          type="text"
          placeholder={isRegex ? "Regex pattern..." : "Search logs..."}
          className={`w-full ${theme.input} rounded-lg px-3 py-2 pr-16 text-sm focus:outline-none
                   focus:ring-2 ${regexError ? 'focus:ring-red-500/50' : darkMode ? "focus:ring-green-500/50" : "focus:ring-indigo-500/50"} focus:border-transparent`}
          value={logSearchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            onClick={onToggleRegex}
            className={`text-xs px-1.5 py-0.5 rounded font-mono transition-colors ${
              isRegex ? (darkMode ? 'bg-green-500/30 text-green-300' : 'bg-indigo-500/20 text-indigo-600') : theme.textMuted
            }`}
            title="Toggle regex"
          >.*</button>
          <svg className={`w-4 h-4 ${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  </>
);

export default MobileHeader;
