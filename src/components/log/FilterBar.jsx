import React from 'react';
import { ServerDropdown, PathDropdown } from '../filters';
import { TIME_RANGES, getShortPath } from './constants';

const chip = (active, darkMode) =>
  `h-8 inline-flex items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium
  transition-all duration-150 ease-in-out active:scale-95 cursor-pointer select-none
  ${active
    ? 'border-[#0B57D0] bg-[#D3E3FD] text-[#0B57D0]'
    : darkMode
      ? 'border-[#3F3A34] bg-transparent text-[#CAC4BC] hover:bg-[#2E2B28] hover:text-[#E8E2DC]'
      : 'border-[#C5BEB7] bg-transparent text-[#4A4540] hover:bg-[#EEE8E2] hover:text-[#1C1B1A]'
  }`;

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
  logSearchTerm, onSearchChange,
}) => (
  <div className="hidden md:flex items-center gap-2 mt-3 flex-wrap">

    {/* Filter chips: Server + Path */}
    <div className="relative">
      <button
        ref={serverButtonRef}
        onClick={onToggleServerDropdown}
        className={chip(!!selectedServer, darkMode)}
        type="button"
      >
        {selectedServer ? (
          <>
            <span className="truncate max-w-[100px]">{selectedServer}</span>
            <span
              className="ml-0.5 opacity-60 hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); onClearServer(); }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </>
        ) : (
          <>
            <span>Server</span>
            <svg className={`w-3.5 h-3.5 opacity-50 transition-transform ${showServerDropdown ? 'rotate-180' : ''}`}
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
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
        className={`${chip(!!selectedPath, darkMode)} ${!selectedServer ? 'opacity-35 cursor-not-allowed' : ''}`}
        type="button"
        disabled={!selectedServer}
        title={!selectedServer ? "Select a server first" : undefined}
      >
        {selectedPath ? (
          <>
            <span className="truncate max-w-[100px]">{getShortPath(selectedPath)}</span>
            <span
              className="ml-0.5 opacity-60 hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); onClearPath(); }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </>
        ) : (
          <>
            <span>Path</span>
            <svg className={`w-3.5 h-3.5 opacity-50 transition-transform ${showPathDropdown ? 'rotate-180' : ''}`}
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
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

    {/* Thin divider */}
    <div className={`w-px h-5 ${darkMode ? 'bg-[#4A4540]' : 'bg-[#DDD7D0]'}`} />

    {/* Time range chips */}
    {TIME_RANGES.map((r) => (
      <button
        key={r.value}
        onClick={() => onTimeRangeChange(r.value)}
        className={chip(timeRange === r.value, darkMode)}
      >
        {r.label}
      </button>
    ))}

    {/* Thin divider */}
    <div className={`w-px h-5 ${darkMode ? 'bg-[#4A4540]' : 'bg-[#DDD7D0]'}`} />

    {/* Search */}
    <div className="relative min-w-[240px] flex-1">
      <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.textMuted}`}
           fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Search logs"
        className={`w-full h-9 rounded-full border pl-10 pr-4 text-[13px] focus:outline-none
          focus:ring-2 transition-all duration-150 ease-in-out
          ${darkMode
            ? 'bg-[#252219] border-[#4A4540] text-[#ECE6DF] placeholder:text-[#8E8882] focus:ring-[#A8C7FA]/20 focus:border-[#A8C7FA]'
            : 'bg-white border-[#C5BEB7] text-[#1C1B1A] placeholder:text-[#79736D] focus:ring-[#0B57D0]/20 focus:border-[#0B57D0]'
          }`}
        value={logSearchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  </div>
);

export default FilterBar;
