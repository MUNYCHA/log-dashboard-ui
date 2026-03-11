import React, { useMemo } from 'react';

const TopicItem = React.memo(({ topic, isSelected, onTopicSelect, logRate, serverCount, darkMode }) => {
  const isActive = logRate > 0;

  return (
    <button
      onClick={() => onTopicSelect(topic)}
      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors
        ${isSelected
          ? darkMode
            ? 'bg-blue-500/10 text-blue-400 border-l-2 border-l-blue-400'
            : 'bg-blue-50 text-blue-700 border-l-2 border-l-blue-500'
          : darkMode
            ? 'text-gray-300 hover:bg-gray-800/60'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0
        ${isActive
          ? darkMode ? 'bg-green-400 animate-pulse' : 'bg-green-500 animate-pulse'
          : darkMode ? 'bg-gray-600' : 'bg-gray-300'
        }`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium truncate text-sm">
            {topic}
          </span>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {logRate > 0 ? (
              <span className={`text-xs font-mono tabular-nums ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {logRate}/s
              </span>
            ) : (
              <span className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                idle
              </span>
            )}
          </div>
        </div>

        {serverCount > 0 && (
          <div className={`flex items-center gap-1 text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
            </svg>
            <span>{serverCount} {serverCount === 1 ? 'server' : 'servers'}</span>
          </div>
        )}
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
  theme,
  darkMode,
  isOpen,
  onClose,
  logRates,
  topicServers,
  collapsed,
  onCollapse,
}) => {
  const sortedTopics = useMemo(() => {
    const filtered = topics.filter(t => t.toLowerCase().includes(topicSearchTerm.toLowerCase()));
    return filtered.sort((a, b) => {
      const rateA = logRates?.[a] || 0;
      const rateB = logRates?.[b] || 0;
      if (rateA > 0 && rateB === 0) return -1;
      if (rateA === 0 && rateB > 0) return 1;
      if (rateA !== rateB) return rateB - rateA;
      return a.localeCompare(b);
    });
  }, [topics, topicSearchTerm, logRates]);

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
        <div className="hidden md:flex flex-col items-center justify-start pt-3 flex-1">
          <button
            onClick={onCollapse}
            title="Show sidebar"
            className={`p-1 rounded-md transition-colors
              ${darkMode
                ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      <div className={`flex flex-col flex-1 min-h-0 ${collapsed ? 'md:hidden' : ''}`}>
        {/* Header */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className={`text-sm font-semibold uppercase tracking-wider ${theme.textMuted}`}>
              Topics
            </h1>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono ${
                activeCount > 0 ? (darkMode ? 'text-green-400' : 'text-green-600') : theme.textMuted
              }`}>
                {activeCount}/{topics.length}
              </span>
              <button
                onClick={onClose}
                className={`md:hidden p-1 rounded-md ${theme.textMuted} hover:${theme.text}`}
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
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search topics..."
                className={`w-full ${theme.input} rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1
                         ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-500'} transition-colors`}
                value={topicSearchTerm}
                onChange={(e) => onTopicSearchChange(e.target.value)}
              />
              <svg className={`absolute right-2.5 top-2 w-3.5 h-3.5 ${theme.textMuted}`}
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={onCollapse}
              title="Hide sidebar"
              aria-label="Collapse sidebar"
              className={`hidden md:flex flex-shrink-0 p-1.5 rounded-md transition-colors
                ${darkMode
                  ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Topic list */}
        <div className={`flex-1 overflow-y-auto ${theme.scrollbar} px-2 py-1`}>
          <div className="flex flex-col gap-0.5">
            {sortedTopics.map(topic => (
              <TopicItem
                key={topic}
                topic={topic}
                isSelected={selectedTopic === topic}
                onTopicSelect={onTopicSelect}
                logRate={logRates?.[topic] || 0}
                serverCount={(topicServers?.[topic] || []).length}
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
