import React from 'react';
import { getShortPath } from './constants';

const FilterTag = ({ label, onClear, darkMode, style }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full h-8 px-3 text-[12.5px] font-medium ${
      darkMode ? 'bg-[#303134] text-[#BDC1C6] border border-[#5F6368]' : 'bg-[#F1F3F4] text-[#3C4043] border border-[#DADCE0]'
    }`}
    style={style}
  >
    <span className="max-w-[140px] truncate">{label}</span>
    <button
      onClick={onClear}
      className={`rounded-full p-0.5 transition-colors ${darkMode ? 'hover:text-[#F28B82] hover:bg-[#3C1F1F]' : 'hover:text-[#C5221F] hover:bg-[#FCE8E6]'}`}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
);

const ActiveFilters = ({
  selectedServer, selectedPath, logSearchTerm, keywords,
  darkMode, theme,
  onClearServer, onClearPath, onClearSearch, onRemoveKeyword,
}) => {
  const hasFilters = Boolean(selectedServer || selectedPath || logSearchTerm || keywords.length > 0);

  if (!hasFilters) return null;

  return (
    <div className="mt-3 flex items-center flex-wrap gap-2">
      <span className={`text-[12px] font-semibold ${theme.textMuted}`}>Active:</span>
      {selectedServer && (
        <FilterTag label={`Server: ${selectedServer}`} onClear={onClearServer} darkMode={darkMode} />
      )}
      {selectedPath && (
        <FilterTag label={`Path: ${getShortPath(selectedPath)}`} onClear={onClearPath} darkMode={darkMode} />
      )}
      {logSearchTerm && (
        <FilterTag label={`Search: ${logSearchTerm}`} onClear={onClearSearch} darkMode={darkMode} />
      )}
      {keywords.map((kw) => (
        <FilterTag
          key={`filter-keyword-${kw.text}`}
          label={`Keyword: ${kw.text}`}
          onClear={() => onRemoveKeyword(kw.text)}
          darkMode={darkMode}
          style={{
            border: `1px solid ${kw.color}38`,
            backgroundColor: `${kw.color}${darkMode ? '22' : '16'}`,
            color: kw.color,
          }}
        />
      ))}
    </div>
  );
};

export default ActiveFilters;
