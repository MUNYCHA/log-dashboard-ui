import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getShortPath } from './constants';

const MotionDiv = motion.div;
const MotionSpan = motion.span;

const FilterTag = ({ label, onClear, darkMode, style }) => (
  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-mono
    ${darkMode ? 'bg-[#1a1a1a] text-gray-400' : 'bg-gray-100 text-gray-600'}`}
    style={style}
  >
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
  onClearServer, onClearPath, onClearSearch, onRemoveKeyword,
}) => {
  const hasFilters = Boolean(selectedServer || selectedPath || logSearchTerm || keywords.length > 0);

  return (
    <AnimatePresence initial={false}>
      {hasFilters && (
        <MotionDiv
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="mt-2.5 flex items-center flex-wrap gap-1.5 text-xs"
        >
          <span className={`text-[10px] font-medium uppercase tracking-wider ${theme.textMuted}`}>Filters</span>
          <AnimatePresence initial={false}>
            {selectedServer && (
              <MotionSpan
                key="filter-server"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.12 }}
              >
                <FilterTag label={`Server: ${selectedServer}`} onClear={onClearServer} darkMode={darkMode} />
              </MotionSpan>
            )}
            {selectedPath && (
              <MotionSpan
                key="filter-path"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.12 }}
              >
                <FilterTag label={`Path: ${getShortPath(selectedPath)}`} onClear={onClearPath} darkMode={darkMode} />
              </MotionSpan>
            )}
            {logSearchTerm && (
              <MotionSpan
                key="filter-search"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.12 }}
              >
                <FilterTag label={`${isRegex ? 'Regex' : 'Search'}: ${logSearchTerm}`} onClear={onClearSearch} darkMode={darkMode} />
              </MotionSpan>
            )}
            {keywords.map((kw) => (
              <MotionSpan
                key={`filter-keyword-${kw.text}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.12 }}
              >
                <FilterTag
                  label={`Keyword: ${kw.text}`}
                  onClear={() => onRemoveKeyword(kw.text)}
                  darkMode={darkMode}
                  style={{
                    border: `1px solid ${kw.color}40`,
                    backgroundColor: `${kw.color}${darkMode ? '24' : '18'}`,
                    color: kw.color,
                  }}
                />
              </MotionSpan>
            ))}
          </AnimatePresence>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default ActiveFilters;
