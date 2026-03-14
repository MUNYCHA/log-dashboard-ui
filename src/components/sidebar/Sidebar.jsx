import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const MotionSpan = motion.span;

const TOPIC_SORT_OPTIONS = [
  { value: 'activity', label: 'Active' },
  { value: 'asc', label: 'A-Z' },
  { value: 'desc', label: 'Z-A' },
];

const TopicItem = React.memo(({ topic, isSelected, onTopicSelect, logRate, darkMode }) => {
  const isActive = logRate > 0;
  const itemTone = isSelected
    ? (darkMode
      ? 'bg-[#fafafa] text-[#0a0a0a]'
      : 'bg-[#0a0a0a] text-[#fafafa]')
    : (darkMode
      ? 'text-[#a3a3a3] hover:text-[#fafafa] hover:bg-[#1a1a1a]'
      : 'text-[#525252] hover:text-[#0a0a0a] hover:bg-[#f0f0f0]');
  return (
    <button
      onClick={() => onTopicSelect(topic)}
      className={`relative w-full overflow-hidden rounded-md px-2.5 py-1.5 text-left transition-all duration-150 ease-in-out active:scale-95 ${itemTone}`}
    >
      {isSelected && (
        <MotionSpan
          layoutId="topic-selection-indicator"
          className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-[#0070f3]"
          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
        />
      )}
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
          isActive
            ? 'bg-[#0070f3]'
            : darkMode ? 'bg-[#333]' : 'bg-slate-400'
        }`}
        />
        <span className="truncate text-[13px] font-medium">
          {topic}
        </span>
      </div>
    </button>
  );
});

const Sidebar = ({
  topics,
  selectedTopic,
  onTopicSelect,
  topicSearchTerm,
  onTopicSearchChange,
  topicSortMode,
  onTopicSortModeChange,
  theme,
  darkMode,
  isOpen,
  onClose,
  logRates,
  collapsed,
  onCollapse,
}) => {
  const sortedTopics = useMemo(() => {
    const filtered = topics.filter(t => t.toLowerCase().includes(topicSearchTerm.toLowerCase()));

    if (topicSortMode === 'asc') {
      return filtered.sort((a, b) => a.localeCompare(b));
    }

    if (topicSortMode === 'desc') {
      return filtered.sort((a, b) => b.localeCompare(a));
    }

    return filtered.sort((a, b) => {
      const rateA = logRates?.[a] || 0;
      const rateB = logRates?.[b] || 0;
      if (rateA > 0 && rateB === 0) return -1;
      if (rateA === 0 && rateB > 0) return 1;
      if (rateA !== rateB) return rateB - rateA;
      return a.localeCompare(b);
    });
  }, [topics, topicSearchTerm, topicSortMode, logRates]);

  const activeCount = useMemo(
    () => topics.filter(t => (logRates?.[t] || 0) > 0).length,
    [topics, logRates],
  );

  return (
    <div
      className={`
        flex flex-col flex-shrink-0 ${theme.sidebar}
        fixed inset-y-0 left-0 z-50 w-72
        transform transition-transform duration-200
        md:relative md:translate-x-0 md:z-auto md:transition-[width] md:duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'md:w-10 md:overflow-hidden' : 'md:w-56 lg:w-64'}
      `}
    >
      {/* Collapsed strip */}
      {collapsed && (
        <div className="hidden md:flex flex-col items-center justify-start pt-2.5 flex-1">
          <button
            onClick={onCollapse}
            title="Show sidebar"
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md border transition-all duration-150 ease-in-out active:scale-95
    ${darkMode
      ? 'border-[#2e2e2e] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]'
      : 'border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]'
    }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      <div className={`flex flex-col flex-1 min-h-0 ${collapsed ? 'md:hidden' : ''}`}>
        {/* Header */}
        <div className="px-3 pt-3 pb-1.5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${theme.textMuted}`}>
              Topics
            </h1>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono tabular-nums ${theme.textMuted}`}>
                {activeCount}/{topics.length}
              </span>
              <button
                onClick={onClose}
                className={`md:hidden inline-flex h-7 w-7 items-center justify-center rounded-md border transition-all duration-150 ease-in-out active:scale-95 ${
                  darkMode
                    ? 'border-[#2e2e2e] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]'
                    : 'border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]'
                }`}
                aria-label="Close sidebar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pb-1.5 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1 min-w-0">
              <svg
                className={`absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${theme.textMuted}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                className={`w-full rounded-md border px-8 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0070f3] transition-all duration-150 ease-in-out ${
                  darkMode
                    ? 'border-[#282828] bg-[#141414] placeholder:text-gray-600 text-gray-200'
                    : 'border-slate-300 bg-white placeholder:text-gray-500 text-gray-900'
                }`}
                value={topicSearchTerm}
                onChange={(e) => onTopicSearchChange(e.target.value)}
              />
            </div>
            <button
              onClick={onCollapse}
              title="Hide sidebar"
              aria-label="Collapse sidebar"
              className={`hidden md:inline-flex h-7 w-7 items-center justify-center rounded-md border transition-all duration-150 ease-in-out active:scale-95
    ${darkMode
      ? 'border-[#2e2e2e] bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]'
      : 'border-[#e5e5e5] bg-white text-[#525252] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]'
    }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sort — inline segmented toggle */}
        <div className="px-3 pb-2 flex-shrink-0">
          <div className={`grid grid-cols-3 gap-0.5 rounded-md border p-0.5 ${
            darkMode ? 'border-[#2e2e2e] bg-[#0f0f0f]' : 'border-[#e5e5e5] bg-[#f5f5f5]'
          }`}>
            {TOPIC_SORT_OPTIONS.map((option) => {
              const isSelected = option.value === topicSortMode;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onTopicSortModeChange(option.value)}
                  className={`w-full rounded-[6px] px-3 py-1.5 text-center text-[11px] font-medium transition-all duration-150 ease-in-out active:scale-95
    ${isSelected
      ? darkMode
        ? 'bg-[#fafafa] text-[#0a0a0a] hover:bg-[#e5e5e5]'
        : 'bg-[#0a0a0a] text-[#fafafa] hover:bg-[#242424]'
      : darkMode
        ? 'text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#fafafa]'
        : 'text-[#525252] hover:bg-white hover:text-[#0a0a0a]'
    }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic list */}
        <div className={`flex-1 overflow-y-auto ${theme.scrollbar} px-2 py-0.5`}>
          <div className="flex flex-col gap-0.5">
            {sortedTopics.map(topic => (
              <TopicItem
                key={topic}
                topic={topic}
                isSelected={selectedTopic === topic}
                onTopicSelect={onTopicSelect}
                logRate={logRates?.[topic] || 0}
                darkMode={darkMode}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
