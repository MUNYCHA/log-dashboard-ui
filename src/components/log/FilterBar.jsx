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
  accentActive,
}) => (
  <div className="hidden md:flex items-center gap-2 mt-3 flex-wrap">
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="relative">
        <button
          ref={serverButtonRef}
          onClick={onToggleServerDropdown}
          className={`px-2.5 py-1.5 rounded-full border ${theme.input} text-sm flex items-center gap-1.5 max-w-[140px] justify-between
                    cursor-pointer transition-colors`}
          type="button"
        >
          <span className="truncate text-xs">{selectedServer || "All Servers"}</span>
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
          className={`px-2.5 py-1.5 rounded-full border ${theme.input} text-sm flex items-center gap-1.5 max-w-[140px] justify-between
                    ${!selectedServer ? "opacity-50 cursor-not-allowed" : "cursor-pointer transition-colors"}`}
          type="button" disabled={!selectedServer}
          title={!selectedServer ? "Select a server first" : "Filter by path"}
        >
          <span className="truncate text-xs">{selectedPath ? getShortPath(selectedPath) : "All Paths"}</span>
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

    <span className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${theme.textMuted}`}>Range</span>
    {TIME_RANGES.map((r) => (
      <button
        key={r.value}
        onClick={() => onTimeRangeChange(r.value)}
        className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors ${
          timeRange === r.value
            ? accentActive
            : darkMode
              ? 'border-gray-800 bg-black/20 text-gray-500 hover:text-gray-300'
              : 'border-gray-200 bg-white text-gray-500 hover:text-gray-700'
        }`}
      >
        {r.label}
      </button>
    ))}
  </div>
);

export default FilterBar;
