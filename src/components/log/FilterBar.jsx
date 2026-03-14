import React from 'react';
import { ServerDropdown, PathDropdown } from '../filters';
import { TIME_RANGES, getShortPath } from './constants';

const FilterBar = ({
  theme, darkMode,
  serverButtonRef, pathButtonRef,
  showServerDropdown, onToggleServerDropdown,
  showPathDropdown, onTogglePathDropdown,
  filteredServers, selectedServer, onServerSelect, onClearServer,
  serverSearchTerm, onServerSearchChange,
  filteredPaths, selectedPath, onPathSelect, onClearPath,
  pathSearchTerm, onPathSearchChange,
  timeRange, onTimeRangeChange,
}) => (
  <div className="hidden md:flex items-center gap-2 mt-2.5 flex-wrap">
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <div className="relative">
        <button
          ref={serverButtonRef}
          onClick={onToggleServerDropdown}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1.5
    max-w-[140px] justify-between transition-all duration-150 ease-in-out active:scale-95
    ${darkMode
      ? 'border-[#2e2e2e] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]'
      : 'border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]'
    }`}
          type="button"
        >
          <span className="truncate">{selectedServer || "All Servers"}</span>
          <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${showServerDropdown ? "rotate-180" : ""}`}
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <ServerDropdown
          isOpen={showServerDropdown} onClose={() => onToggleServerDropdown(false)}
          servers={filteredServers} selectedServer={selectedServer}
          onServerSelect={onServerSelect} onClearServer={onClearServer}
          searchTerm={serverSearchTerm} onSearchChange={onServerSearchChange}
          theme={theme} darkMode={darkMode}
        />
      </div>
      <div className="relative">
        <button
          ref={pathButtonRef}
          onClick={() => selectedServer && onTogglePathDropdown()}
          className={`px-3 py-1.5 rounded-md border text-xs font-medium flex items-center gap-1.5
    max-w-[140px] justify-between transition-all duration-150 ease-in-out active:scale-95
    ${!selectedServer ? 'opacity-40 cursor-not-allowed' : ''}
    ${darkMode
      ? 'border-[#2e2e2e] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]'
      : 'border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]'
    }`}
          type="button" disabled={!selectedServer}
          title={!selectedServer ? "Select a server first" : "Filter by path"}
        >
          <span className="truncate">{selectedPath ? getShortPath(selectedPath) : "All Paths"}</span>
          <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${showPathDropdown ? "rotate-180" : ""}`}
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {selectedServer && (
          <PathDropdown
            isOpen={showPathDropdown} onClose={() => onTogglePathDropdown(false)}
            paths={filteredPaths} selectedPath={selectedPath}
            onPathSelect={onPathSelect} onClearPath={onClearPath}
            searchTerm={pathSearchTerm} onSearchChange={onPathSearchChange}
            theme={theme} darkMode={darkMode}
          />
        )}
      </div>
    </div>

    <span className={`text-[10px] font-medium uppercase tracking-wider ${theme.textMuted}`}>Range</span>
    {TIME_RANGES.map((r) => (
      <button
        key={r.value}
        onClick={() => onTimeRangeChange(r.value)}
        className={`px-3 py-1.5 text-[11px] font-medium rounded-md border
    transition-all duration-150 ease-in-out active:scale-95
    ${timeRange === r.value
      ? 'border-[#0070f3] bg-[#0070f3] text-white hover:bg-[#0060d3] hover:border-[#0060d3]'
      : darkMode
        ? 'border-[#2e2e2e] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]'
        : 'border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]'
    }`}
      >
        {r.label}
      </button>
    ))}
  </div>
);

export default FilterBar;
