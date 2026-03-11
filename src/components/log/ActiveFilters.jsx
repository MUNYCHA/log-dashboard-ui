import React from 'react';
import { getShortPath } from './constants';

const FilterTag = ({ label, onClear, darkMode }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs
    ${darkMode ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
    <span className="max-w-[120px] truncate">{label}</span>
    <button onClick={onClear} className={`${darkMode ? 'hover:text-red-400' : 'hover:text-red-500'} transition-colors`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
);

const ActiveFilters = ({
  selectedServer, selectedPath, logSearchTerm, keywords, isRegex,
  darkMode, theme,
  onClearServer, onClearPath, onClearSearch,
}) => {
  if (!selectedServer && !selectedPath && !logSearchTerm && keywords.length === 0) return null;

  return (
    <div className="flex items-center flex-wrap gap-1.5 text-xs mt-2">
      <span className={theme.textMuted}>Filters:</span>
      {selectedServer && (
        <FilterTag label={`Server: ${selectedServer}`} onClear={onClearServer} darkMode={darkMode} />
      )}
      {selectedPath && (
        <FilterTag label={`Path: ${getShortPath(selectedPath)}`} onClear={onClearPath} darkMode={darkMode} />
      )}
      {logSearchTerm && (
        <FilterTag label={`${isRegex ? 'Regex' : 'Search'}: ${logSearchTerm}`} onClear={onClearSearch} darkMode={darkMode} />
      )}
    </div>
  );
};

export default ActiveFilters;
