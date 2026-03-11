import React from 'react';
import { getShortPath } from './constants';

const StatusBar = ({
  isConnected, isReconnecting, isPaused,
  selectedServer, selectedPath,
  logRate, darkMode, theme,
  onClearServer, onClearPath,
}) => (
  <div className={`px-3 sm:px-4 md:px-5 py-1.5 ${theme.statusBar} text-xs ${theme.textMuted} flex items-center justify-between gap-2 flex-shrink-0`}>
    <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
      <div className="flex items-center gap-1.5">
        {isConnected ? (
          <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        ) : isReconnecting ? (
          <svg className="w-3.5 h-3.5 text-amber-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88" />
            <path d="M8.53 16.11a6 6 0 016.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        )}
        <span className={isConnected ? (darkMode ? 'text-green-400' : 'text-green-600') : ''}>
          {isConnected ? 'Connected' : isReconnecting ? 'Reconnecting\u2026' : 'Disconnected'}
        </span>
      </div>

      {logRate > 0 && (
        <span className="font-mono tabular-nums">{logRate} logs/s</span>
      )}

      {isPaused && <span className="text-amber-500">Paused</span>}

      {selectedServer && (
        <button
          onClick={onClearServer}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded
                   ${darkMode ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"}
                   hover:bg-red-500/15 hover:text-red-400 transition-colors`}
        >
          <span className="max-w-[100px] truncate">{selectedServer}</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {selectedPath && (
        <button
          onClick={onClearPath}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded
                   ${darkMode ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"}
                   hover:bg-red-500/15 hover:text-red-400 transition-colors`}
        >
          <span className="max-w-[100px] truncate">{getShortPath(selectedPath)}</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>

    <span className="text-xs font-mono tabular-nums whitespace-nowrap">{new Date().toLocaleTimeString()}</span>
  </div>
);

export default StatusBar;
