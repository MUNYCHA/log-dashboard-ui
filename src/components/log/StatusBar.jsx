import React from 'react';
import { getShortPath } from './constants';

const StatusBar = ({
  isConnected, isReconnecting, isPaused,
  selectedServer, selectedPath,
  logRate, darkMode, theme,
  onClearServer, onClearPath,
}) => {
  const connectionTone = isConnected
    ? (darkMode ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700')
    : isReconnecting
      ? (darkMode ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700')
      : (darkMode ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700');

  return (
    <div className={`px-3 sm:px-4 md:px-5 py-2 ${theme.statusBar} text-xs ${theme.textMuted} flex items-center justify-between gap-3 flex-shrink-0`}>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium ${connectionTone}`}>
          <span className={`h-2 w-2 rounded-full ${
            isConnected
              ? 'bg-current animate-pulse'
              : isReconnecting
                ? 'bg-current animate-pulse'
                : 'bg-current'
          }`} />
          {isConnected ? 'Connected' : isReconnecting ? 'Reconnecting' : 'Disconnected'}
        </span>

        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono tabular-nums ${
          darkMode ? 'border-gray-800 bg-black/20 text-gray-300' : 'border-gray-200 bg-white text-gray-600'
        }`}>
          {logRate} logs/s
        </span>

        {isPaused && (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-medium ${
            darkMode ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}>
            Paused
          </span>
        )}

        {selectedServer && (
          <button
            onClick={onClearServer}
            className={`inline-flex max-w-[180px] items-center gap-1.5 rounded-full border px-2.5 py-1 transition-colors ${
              darkMode
                ? 'border-blue-500/20 bg-blue-500/10 text-blue-300 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300'
                : 'border-blue-200 bg-blue-50 text-blue-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700'
            }`}
          >
            <svg className="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2M5 12a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 00-2-2" />
            </svg>
            <span className="truncate">{selectedServer}</span>
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {selectedPath && (
          <button
            onClick={onClearPath}
            className={`inline-flex max-w-[180px] items-center gap-1.5 rounded-full border px-2.5 py-1 transition-colors ${
              darkMode
                ? 'border-blue-500/20 bg-blue-500/10 text-blue-300 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300'
                : 'border-blue-200 bg-blue-50 text-blue-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700'
            }`}
          >
            <svg className="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 7V5a1 1 0 011-1h10a1 1 0 011 1v2M6 7v12a1 1 0 001 1h10a1 1 0 001-1V7" />
            </svg>
            <span className="truncate">{getShortPath(selectedPath)}</span>
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <span className={`text-xs font-mono tabular-nums whitespace-nowrap ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        {new Date().toLocaleTimeString()}
      </span>
    </div>
  );
};

export default StatusBar;
