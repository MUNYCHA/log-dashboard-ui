import React from 'react';
import { getShortPath } from './constants';

const CloseIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ActiveFilters = ({
  selectedServer, selectedPath, logSearchTerm, keywords, isRegex,
  darkMode, theme,
  onClearServer, onClearPath, onClearSearch,
}) => {
  if (!selectedServer && !selectedPath && !logSearchTerm && keywords.length === 0) return null;

  return (
    <div className="flex items-center flex-wrap gap-2 text-xs mt-2">
      <span className={theme.textMuted}>Active filters:</span>
      {selectedServer && (
        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${darkMode ? "bg-green-500/20 text-green-400" : "bg-indigo-500/20 text-indigo-600"}`}>
          <span className="max-w-[120px] truncate">Server: {selectedServer}</span>
          <button onClick={onClearServer} className="hover:text-red-400 ml-1">
            <CloseIcon />
          </button>
        </span>
      )}
      {selectedPath && (
        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${darkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-500/20 text-purple-600"}`}>
          <span className="max-w-[120px] truncate">Path: {getShortPath(selectedPath)}</span>
          <button onClick={onClearPath} className="hover:text-red-400 ml-1">
            <CloseIcon />
          </button>
        </span>
      )}
      {logSearchTerm && (
        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${darkMode ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-500/20 text-yellow-600"}`}>
          <span className="max-w-[120px] truncate">{isRegex ? 'Regex:' : 'Search:'} {logSearchTerm}</span>
          <button onClick={onClearSearch} className="hover:text-red-400 ml-1">
            <CloseIcon />
          </button>
        </span>
      )}
    </div>
  );
};

export default ActiveFilters;
