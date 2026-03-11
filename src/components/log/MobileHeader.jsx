import React from 'react';
import HeartbeatLine from '../common/HeartbeatLine';
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
  accentActive, accentPaused,
}) => (
  <>
    <div className="md:hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onOpenSidebar} className={`p-1.5 rounded-md ${theme.textMuted} hover:${theme.text}`} aria-label="Open sidebar">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-sm font-semibold truncate max-w-[130px]">
            {selectedTopic}
          </h2>
          <span className={`text-xs font-mono tabular-nums ${theme.textMuted}`}>
            {displayedLogs?.length || 0}
          </span>
          {logRate > 0 && (
            <span className="inline-flex items-center gap-1 flex-shrink-0">
              <span className={`text-xs font-mono tabular-nums ${theme.textMuted}`}>
                {logRate}/s
              </span>
              <HeartbeatLine rate={logRate} darkMode={darkMode} />
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <ThemeToggle darkMode={darkMode} onToggle={onThemeToggle} />
          <button onClick={onToggleMobileMenu} className={`p-1.5 rounded-md ${theme.textMuted} hover:${theme.text}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={`space-y-2 mb-3 p-2 rounded-md ${darkMode ? 'bg-[#161b22]' : 'bg-gray-50'} ${mobileMenuReady ? '' : 'pointer-events-none'}`}>
          <div className="relative w-full">
            <button
              onClick={() => onToggleMobileServerDropdown()}
              className={`w-full px-3 py-2 rounded-md ${theme.input} text-sm flex items-center justify-between`}
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

          <div className="relative w-full">
            <button
              onClick={() => selectedServer && onToggleMobilePathDropdown()}
              className={`w-full px-3 py-2 rounded-md ${theme.input} text-sm flex items-center justify-between
                        ${!selectedServer ? "opacity-50" : ""}`}
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

          <div className="flex flex-wrap gap-1">
            {TIME_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => onTimeRangeChange(r.value)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  timeRange === r.value ? accentActive : `${theme.input} ${theme.textMuted}`
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={onTogglePause}
              className={`flex-1 p-2 rounded-md text-sm ${isPaused ? accentPaused : theme.input}`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={onToggleAutoScroll}
              className={`flex-1 p-2 rounded-md text-sm ${autoScroll ? accentActive : theme.input}`}
            >
              Auto-scroll
            </button>
            <button
              onClick={() => onExport('json')}
              className={`flex-1 p-2 rounded-md ${theme.input} text-sm`}
            >
              JSON
            </button>
            <button
              onClick={() => onExport('csv')}
              className={`flex-1 p-2 rounded-md ${theme.input} text-sm`}
            >
              CSV
            </button>
            <button
              onClick={() => onClearLogs(selectedTopic)}
              className={`flex-1 p-2 rounded-md ${theme.input} text-sm ${darkMode ? 'hover:text-red-400' : 'hover:text-red-500'}`}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>

    <div className="mt-2 md:hidden">
      <div className="relative">
        <input
          type="text"
          placeholder={isRegex ? "Regex pattern..." : "Search logs..."}
          className={`w-full ${theme.input} rounded-md px-3 py-2 pr-16 text-sm focus:outline-none
                   focus:ring-1 ${regexError ? 'focus:ring-red-500' : 'focus:ring-blue-500'} transition-colors`}
          value={logSearchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            onClick={onToggleRegex}
            className={`text-xs px-1.5 py-0.5 rounded font-mono transition-colors ${
              isRegex ? (darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600') : theme.textMuted
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
