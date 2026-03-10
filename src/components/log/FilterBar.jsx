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
  <div className="hidden md:flex items-center gap-2 mt-2 flex-wrap">
    {/* Server + path dropdowns */}
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <div className="relative">
        <button
          ref={serverButtonRef}
          onClick={onToggleServerDropdown}
          className={`px-2 py-1.5 rounded-lg ${theme.input} text-sm flex items-center gap-1.5 max-w-[120px] justify-between
                    ${selectedServer ? (darkMode ? "border-green-400/50" : "border-indigo-400/50") : ""}
                    cursor-pointer transition-all duration-150 active:scale-95`}
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
          className={`px-2 py-1.5 rounded-lg ${theme.input} text-sm flex items-center gap-1.5 max-w-[120px] justify-between
                    ${!selectedServer ? "opacity-50 cursor-not-allowed" : "cursor-pointer transition-all duration-150 active:scale-95"}
                    ${selectedPath ? (darkMode ? "border-purple-400/50" : "border-purple-500/50") : ""}`}
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
      <div className="w-px h-4 bg-current opacity-20 mx-1" />
    </div>

    {/* Range pills */}
    <span className={`text-xs ${theme.textMuted}`}>Range:</span>
    {TIME_RANGES.map((r) => (
      <button
        key={r.value}
        onClick={() => onTimeRangeChange(r.value)}
        className={`px-2.5 py-0.5 rounded-full text-xs transition-all duration-150 hover:scale-105 active:scale-95 ${
          timeRange === r.value ? accentActive : `${theme.input} ${theme.textMuted}`
        }`}
      >
        {r.label}
      </button>
    ))}
  </div>
);

export default FilterBar;
