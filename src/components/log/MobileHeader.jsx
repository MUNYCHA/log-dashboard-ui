import React from 'react';
import ThemeToggle from '../common/ThemeToggle';
import { ServerDropdown, PathDropdown } from '../filters';
import { TIME_RANGES, getShortPath } from './constants';

const MobileHeader = ({
  selectedTopic, displayedLogs, logRate, darkMode, theme,
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
}) => {
  const btnIdle = darkMode
    ? 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]'
    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100';
  const btnActive = darkMode
    ? 'text-white bg-[#1a1a1a]'
    : 'text-gray-900 bg-gray-100';
  const btnBase = 'inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors';

  return (
    <>
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex flex-1 items-center gap-1.5">
            <button onClick={onOpenSidebar} className={`${btnBase} ${btnIdle}`} aria-label="Open sidebar">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="min-w-0 truncate text-sm font-semibold">
              {selectedTopic}
            </h2>
            <span className={`text-[11px] font-mono tabular-nums ${theme.textMuted}`}>
              {displayedLogs?.length || 0}
            </span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-mono tabular-nums ${
              logRate > 0 ? (darkMode ? 'text-green-400' : 'text-green-600') : theme.textMuted
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${logRate > 0 ? 'bg-green-500' : (darkMode ? 'bg-[#333]' : 'bg-gray-300')}`} />
              {logRate}/s
            </span>
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            <ThemeToggle darkMode={darkMode} onToggle={onThemeToggle} />
            <button onClick={onToggleMobileMenu} className={`${btnBase} ${isMobileMenuOpen ? btnActive : btnIdle}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className={`mt-2 space-y-2 rounded-md border p-2.5 ${
            darkMode ? 'border-[#282828] bg-[#141414]' : 'border-gray-200 bg-gray-50'
          } ${mobileMenuReady ? '' : 'pointer-events-none'}`}>
            {/* Server / Path dropdowns */}
            <div className="relative w-full">
              <button
                onClick={() => onToggleMobileServerDropdown()}
                className={`w-full px-2.5 py-1.5 rounded-md border text-xs flex items-center justify-between transition-colors ${
                  darkMode ? 'border-[#282828] bg-[#1a1a1a] text-gray-400' : 'border-gray-200 bg-white text-gray-600'
                }`}
                type="button"
              >
                <span className="truncate">{selectedServer || "All Servers"}</span>
                <svg className={`w-3 h-3 transition-transform ${showMobileServerDropdown ? "rotate-180" : ""}`}
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

            <div className="relative w-full">
              <button
                onClick={() => selectedServer && onToggleMobilePathDropdown()}
                className={`w-full px-2.5 py-1.5 rounded-md border text-xs flex items-center justify-between transition-colors
                          ${!selectedServer ? "opacity-40 cursor-not-allowed" : ""} ${
                  darkMode ? 'border-[#282828] bg-[#1a1a1a] text-gray-400' : 'border-gray-200 bg-white text-gray-600'
                }`}
                type="button" disabled={!selectedServer}
              >
                <span className="truncate">{selectedPath ? getShortPath(selectedPath) : "All Paths"}</span>
                <svg className={`w-3 h-3 transition-transform ${showMobilePathDropdown ? "rotate-180" : ""}`}
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

            {/* Time range — segmented toggle */}
            <div className={`inline-flex rounded-md border overflow-hidden ${
              darkMode ? 'border-[#282828]' : 'border-gray-200'
            }`}>
              {TIME_RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => onTimeRangeChange(r.value)}
                  className={`px-2.5 py-1 text-[11px] font-mono transition-colors ${
                    timeRange === r.value
                      ? (darkMode ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-gray-900')
                      : darkMode
                        ? 'text-gray-600 hover:text-gray-300'
                        : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Action buttons — grid */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={onTogglePause}
                className={`py-1.5 rounded-md text-xs font-medium transition-colors ${isPaused ? btnActive : `border ${
                  darkMode ? 'border-[#282828] text-gray-400' : 'border-gray-200 text-gray-600'
                }`}`}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={onToggleAutoScroll}
                className={`py-1.5 rounded-md text-xs font-medium transition-colors ${autoScroll ? btnActive : `border ${
                  darkMode ? 'border-[#282828] text-gray-400' : 'border-gray-200 text-gray-600'
                }`}`}
              >
                Auto-scroll
              </button>
              <button
                onClick={() => onExport('json')}
                className={`py-1.5 rounded-md border text-xs transition-colors ${
                  darkMode ? 'border-[#282828] text-gray-400 hover:text-gray-200' : 'border-gray-200 text-gray-600 hover:text-gray-800'
                }`}
              >
                Export JSON
              </button>
              <button
                onClick={() => onExport('csv')}
                className={`py-1.5 rounded-md border text-xs transition-colors ${
                  darkMode ? 'border-[#282828] text-gray-400 hover:text-gray-200' : 'border-gray-200 text-gray-600 hover:text-gray-800'
                }`}
              >
                Export CSV
              </button>
              <button
                onClick={() => onClearLogs(selectedTopic)}
                className={`col-span-2 py-1.5 rounded-md border text-xs transition-colors ${
                  darkMode ? 'border-[#282828] text-gray-500 hover:text-gray-300' : 'border-gray-200 text-gray-400 hover:text-gray-600'
                }`}
              >
                Clear logs
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile search */}
      <div className="mt-2 md:hidden">
        <div className="relative">
          <input
            type="text"
            placeholder={isRegex ? "Regex pattern..." : "Search logs..."}
            className={`w-full rounded-md border px-3 py-1.5 pr-16 text-xs font-mono focus:outline-none
                     focus:ring-1 ${regexError ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500'} transition-colors ${
              darkMode
                ? 'border-[#282828] bg-[#1a1a1a] text-gray-200 placeholder:text-gray-600'
                : 'border-gray-200 bg-white text-gray-900 placeholder:text-gray-400'
            }`}
            value={logSearchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <button
              onClick={onToggleRegex}
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors ${
                isRegex
                  ? darkMode ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-gray-900'
                  : darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Toggle regex"
            >.*</button>
            <svg className={`w-3.5 h-3.5 ${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileHeader;
