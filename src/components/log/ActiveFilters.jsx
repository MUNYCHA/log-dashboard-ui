import React from 'react';
import { getShortPath } from './constants';

const FilterTag = ({ label, onClear, darkMode }) => (
  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-mono
    ${darkMode ? 'bg-[#1a1a1a] text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
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
    <div className="mt-2.5 flex items-center flex-wrap gap-1.5 text-xs">
      <span className={`text-[10px] font-medium uppercase tracking-wider ${theme.textMuted}`}>Filters</span>
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
