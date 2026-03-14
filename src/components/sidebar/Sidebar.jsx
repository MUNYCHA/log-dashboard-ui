import React, { useMemo } from 'react';

const TOPIC_SORT_OPTIONS = [
  { value: 'activity', label: 'Active' },
  { value: 'asc', label: 'A-Z' },
  { value: 'desc', label: 'Z-A' },
];

const TopicItem = React.memo(({ topic, isSelected, onTopicSelect, logRate, darkMode }) => {
  const isActive = logRate > 0;
  const itemTone = isSelected
    ? (darkMode
      ? 'bg-[#1a1a1a] text-white'
      : 'bg-white text-gray-900 shadow-sm')
    : (darkMode
      ? 'text-gray-400 hover:text-gray-200 hover:bg-[#161616]'
      : 'text-gray-600 hover:text-gray-900 hover:bg-white');
  return (
    <button
      onClick={() => onTopicSelect(topic)}
      className={`w-full rounded-md px-2.5 py-1.5 text-left transition-colors ${itemTone}`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
          isActive
            ? 'bg-green-500'
            : darkMode ? 'bg-[#333]' : 'bg-gray-300'
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
            className={`p-1 rounded-md transition-colors
              ${darkMode
                ? 'text-gray-600 hover:text-gray-300'
                : 'text-gray-400 hover:text-gray-600'}`}
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
                className={`md:hidden p-1 rounded-md transition-colors ${
                  darkMode ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
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
                className={`w-full rounded-md border px-8 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                  darkMode
                    ? 'border-[#282828] bg-[#141414] placeholder:text-gray-600 text-gray-200'
                    : 'border-gray-200 bg-white placeholder:text-gray-400 text-gray-900'
                }`}
                value={topicSearchTerm}
                onChange={(e) => onTopicSearchChange(e.target.value)}
              />
            </div>
            <button
              onClick={onCollapse}
              title="Hide sidebar"
              aria-label="Collapse sidebar"
              className={`hidden md:flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md transition-colors ${
                darkMode
                  ? 'text-gray-600 hover:text-gray-300 hover:bg-[#1a1a1a]'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
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
          <div className={`inline-flex rounded-md border overflow-hidden ${
            darkMode ? 'border-[#282828]' : 'border-gray-200'
          }`}>
            {TOPIC_SORT_OPTIONS.map((option) => {
              const isSelected = option.value === topicSortMode;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onTopicSortModeChange(option.value)}
                  className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    isSelected
                      ? (darkMode ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-gray-900')
                      : (darkMode ? 'text-gray-600 hover:text-gray-300 hover:bg-[#141414]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50')
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
