import React from 'react';
import { getShortPath } from './constants';

const StatusBar = ({
  isConnected, isReconnecting,
  selectedServer, selectedPath,
  logRate, darkMode, theme,
  streamMode, visibleCount, bufferedCount, hasActiveFilters,
  onClearServer, onClearPath,
}) => {
  const dotColor = isConnected
    ? 'bg-green-500'
    : isReconnecting
      ? 'bg-yellow-500 animate-pulse'
      : 'bg-red-500';
  const connectionLabel = isConnected ? 'Connected' : isReconnecting ? 'Reconnecting' : 'Disconnected';

  const sep = darkMode ? 'text-[#333]' : 'text-gray-300';

  return (
    <div className={`px-3 sm:px-4 py-1.5 ${theme.statusBar} text-[11px] font-mono flex items-center gap-0 flex-shrink-0 overflow-x-auto`}>
      <span className="inline-flex items-center gap-1.5 px-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        <span className={theme.textMuted}>{connectionLabel}</span>
      </span>

      <span className={sep}>|</span>

      <span className={`px-2 tabular-nums ${theme.textMuted}`}>
        {logRate}/s
      </span>

      <span className={sep}>|</span>

      <span className={`px-2 ${
        streamMode === 'Live tail'
          ? (darkMode ? 'text-blue-400' : 'text-blue-600')
          : streamMode === 'Paused'
            ? (darkMode ? 'text-yellow-400' : 'text-yellow-600')
            : theme.textMuted
      }`}>
        {streamMode}
      </span>

      <span className={sep}>|</span>

      <span className={`px-2 tabular-nums ${theme.textMuted}`}>
        {visibleCount} visible
      </span>

      <span className={`hidden sm:inline ${sep}`}>|</span>

      <span className={`hidden sm:inline px-2 tabular-nums ${theme.textMuted}`}>
        {bufferedCount} buffered
      </span>

      {hasActiveFilters && (
        <>
          <span className={sep}>|</span>
          <span className={`px-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            Filtered
          </span>
        </>
      )}

      {selectedServer && (
        <>
          <span className={sep}>|</span>
          <button
            onClick={onClearServer}
            className={`inline-flex items-center gap-1 px-2 max-w-[160px] transition-colors ${
              darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="truncate">{selectedServer}</span>
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      )}

      {selectedPath && (
        <>
          <span className={sep}>|</span>
          <button
            onClick={onClearPath}
            className={`inline-flex items-center gap-1 px-2 max-w-[160px] transition-colors ${
              darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="truncate">{getShortPath(selectedPath)}</span>
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default StatusBar;

