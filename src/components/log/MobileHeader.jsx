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
    ? 'rounded-md border border-[#2e2e2e] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]'
    : 'rounded-md border border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]';
  const btnActive = darkMode
    ? 'rounded-md border border-[#fafafa] bg-[#fafafa] text-[#0a0a0a] hover:bg-[#e5e5e5] hover:border-[#e5e5e5]'
    : 'rounded-md border border-[#0a0a0a] bg-[#0a0a0a] text-[#fafafa] hover:bg-[#242424] hover:border-[#242424]';
  const btnAccent = 'rounded-md border border-[#0070f3] bg-[#0070f3] text-white hover:bg-[#0060d3] hover:border-[#0060d3]';
  const btnBase = 'inline-flex h-8 w-8 items-center justify-center transition-all duration-150 ease-in-out active:scale-95';
  const actionButtonIdle = `py-2 rounded-md border text-xs font-medium transition-all duration-150 ease-in-out active:scale-95 ${darkMode ? 'border-[#2e2e2e] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]' : 'border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]'}`;
  const actionButtonActive = `py-2 rounded-md border text-xs font-medium transition-all duration-150 ease-in-out active:scale-95 ${btnActive}`;

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
              logRate > 0 ? 'text-[#0070f3]' : theme.textMuted
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${logRate > 0 ? 'bg-[#0070f3]' : (darkMode ? 'bg-[#333]' : 'bg-slate-400')}`} />
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
          <div
            className={`mt-2 space-y-2 rounded-md border p-2.5 overflow-hidden ${
              darkMode ? 'border-[#2e2e2e] bg-[#0f0f0f]' : 'border-[#e5e5e5] bg-[#fafafa]'
            } ${mobileMenuReady ? '' : 'pointer-events-none'}`}
          >
            {/* Server / Path dropdowns */}
            <div className="relative w-full">
              <button
                onClick={() => onToggleMobileServerDropdown()}
                className={`w-full px-2.5 py-1.5 rounded-md border text-xs font-medium flex items-center justify-between transition-all duration-150 ease-in-out active:scale-95 ${
                  darkMode
                    ? 'border-[#2e2e2e] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]'
                    : 'border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]'
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
                className={`w-full px-2.5 py-1.5 rounded-md border text-xs font-medium flex items-center justify-between transition-all duration-150 ease-in-out active:scale-95
                          ${!selectedServer ? "opacity-40 cursor-not-allowed" : ""} ${
                  darkMode
                    ? 'border-[#2e2e2e] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]'
                    : 'border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]'
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
              darkMode ? 'border-[#2e2e2e]' : 'border-[#e5e5e5]'
            }`}>
              {TIME_RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => onTimeRangeChange(r.value)}
                  className={`px-3 py-1.5 text-[11px] font-medium rounded-md border transition-all duration-150 ease-in-out active:scale-95 ${
                    timeRange === r.value
                      ? btnAccent
                      : (darkMode ? 'border-[#2e2e2e] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]' : 'border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]')
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
                className={isPaused ? actionButtonActive : actionButtonIdle}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={onToggleAutoScroll}
                className={autoScroll ? actionButtonActive : actionButtonIdle}
              >
                Auto-scroll
              </button>
              <button
                onClick={() => onExport('json')}
                className={actionButtonIdle}
              >
                Export JSON
              </button>
              <button
                onClick={() => onExport('csv')}
                className={actionButtonIdle}
              >
                Export CSV
              </button>
              <button
                onClick={() => onClearLogs(selectedTopic)}
                className={`col-span-2 ${actionButtonIdle}`}
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
                     focus:ring-1 ${regexError ? 'focus:ring-red-500 ring-1 ring-red-500/30 border-red-500' : 'focus:ring-[#0070f3]'} transition-all duration-150 ease-in-out ${
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
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded-md border transition-all duration-150 ease-in-out active:scale-95 ${
                isRegex
                  ? btnAccent
                  : (darkMode ? 'border-[#2e2e2e] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]' : 'border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]')
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
