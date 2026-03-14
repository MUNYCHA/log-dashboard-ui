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
          className={`px-2.5 py-1 rounded-md border text-xs flex items-center gap-1.5 max-w-[140px] justify-between
                    cursor-pointer transition-colors ${
            darkMode
              ? 'border-[#282828] bg-[#1a1a1a] text-gray-400 hover:text-gray-200'
              : 'border-gray-200 bg-white text-gray-600 hover:text-gray-800'
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
          className={`px-2.5 py-1 rounded-md border text-xs flex items-center gap-1.5 max-w-[140px] justify-between
                    ${!selectedServer ? "opacity-40 cursor-not-allowed" : "cursor-pointer transition-colors"} ${
            darkMode
              ? 'border-[#282828] bg-[#1a1a1a] text-gray-400 hover:text-gray-200'
              : 'border-gray-200 bg-white text-gray-600 hover:text-gray-800'
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
        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
          timeRange === r.value
            ? (darkMode ? 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30' : 'bg-gray-900 text-white')
            : darkMode
              ? 'text-gray-600 hover:text-gray-300'
              : 'text-gray-400 hover:text-gray-700'
        }`}
      >
        {r.label}
      </button>
    ))}
  </div>
);

export default FilterBar;
