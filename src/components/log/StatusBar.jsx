import React from 'react';
import { getShortPath } from './constants';

const CloseIcon = () => (
  <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const StatusBar = ({
  isConnected, isReconnecting, isPaused,
  selectedServer, selectedPath,
  logRate, darkMode, theme,
  onClearServer, onClearPath,
}) => (
  <div className={`px-3 sm:px-4 md:px-5 py-2 ${theme.statusBar} text-xs ${theme.textMuted} flex items-center justify-between gap-2 flex-shrink-0`}>
    <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
      {/* Connection status */}
      <div className="flex items-center space-x-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${
          isConnected
            ? `${darkMode ? 'bg-green-400' : 'bg-indigo-500'} animate-pulse`
            : isReconnecting
              ? 'bg-amber-400 animate-pulse'
              : 'bg-red-500'
        }`} />
        <span>
          {isConnected ? 'Connected' : isReconnecting ? 'Reconnecting\u2026' : 'Disconnected'}
        </span>
      </div>

      {/* Log rate */}
      {logRate > 0 && (
        <span>{logRate} logs/s</span>
      )}

      {/* Pause indicator */}
      {isPaused && <span className="text-amber-400">Paused</span>}

      {/* Server filter */}
      {selectedServer && (
        <button
          onClick={onClearServer}
          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded
                   ${darkMode ? "bg-green-500/20 text-green-400" : "bg-indigo-500/20 text-indigo-600"}
                   hover:bg-red-500/20 hover:text-red-400 transition-colors group`}
        >
          <span className="max-w-[100px] truncate">{selectedServer}</span>
          <CloseIcon />
        </button>
      )}

      {/* Path filter */}
      {selectedPath && (
        <button
          onClick={onClearPath}
          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded
                   ${darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-500/20 text-purple-600"}
                   hover:bg-red-500/20 hover:text-red-400 transition-colors group`}
        >
          <span className="max-w-[100px] truncate">{getShortPath(selectedPath)}</span>
          <CloseIcon />
        </button>
      )}
    </div>

    <span className="text-xs whitespace-nowrap">{new Date().toLocaleTimeString()}</span>
  </div>
);

export default StatusBar;
