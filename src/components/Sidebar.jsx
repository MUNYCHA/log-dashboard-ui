import React from 'react';
import { getServersForTopic } from '../utils/logUtils';

const Sidebar = ({
  topics,
  logsByTopic,
  selectedTopic,
  onTopicSelect,
  topicSearchTerm,
  onTopicSearchChange,
  theme,
  darkMode,
  isOpen,
  onClose,
  logRates,
  collapsed,
  onCollapse,
}) => {
  return (
    <div
      className={`
        flex flex-col flex-shrink-0 border-r ${theme.border} ${theme.sidebar} backdrop-blur-xl
        fixed inset-y-0 left-0 z-50 w-72
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:z-auto md:transition-[width] md:duration-300 md:ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'md:w-10 md:overflow-hidden' : 'md:w-64 lg:w-72'}
      `}
    >
      {/* Collapsed strip — desktop only */}
      {collapsed && (
        <div className="hidden md:flex flex-col items-center justify-start pt-3 flex-1">
          <button
            onClick={onCollapse}
            title="Show sidebar"
            className={`p-1.5 rounded-lg transition-all duration-150 hover:scale-110 active:scale-95
              ${darkMode
                ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-green-400 hover:shadow-lg hover:shadow-green-400/20'
                : 'bg-white text-gray-500 shadow-md hover:bg-indigo-50 hover:text-indigo-500 hover:shadow-lg hover:shadow-indigo-200'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Full sidebar content */}
      <div className={`flex flex-col flex-1 min-h-0 ${collapsed ? 'md:hidden' : ''}`}>
        <div className={`p-4 border-b ${theme.border} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 ${darkMode ? 'bg-green-400' : 'bg-indigo-500'} rounded-full animate-pulse`} />
              <h1 className={`text-lg font-semibold ${darkMode ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-violet-500'} bg-clip-text text-transparent`}>
                Log Topics
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${theme.textMuted}`}>{topics.length} active</span>
              {/* Desktop collapse button */}
              <button
                onClick={onCollapse}
                title="Hide sidebar"
                aria-label="Collapse sidebar"
                className={`hidden md:flex p-1.5 rounded-lg transition-all duration-150 hover:scale-110 active:scale-95
                  ${darkMode
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-green-400 hover:shadow-lg hover:shadow-green-400/20'
                    : 'bg-white text-gray-500 shadow-md hover:bg-indigo-50 hover:text-indigo-500 hover:shadow-lg hover:shadow-indigo-200'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {/* Mobile close button */}
              <button
                onClick={onClose}
                className={`md:hidden p-1.5 rounded-lg ${theme.input}`}
                aria-label="Close sidebar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      <div className={`p-3 border-b ${theme.border} flex-shrink-0`}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search topics..."
            className={`w-full ${theme.input} rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2
                     ${darkMode ? 'focus:ring-green-500/50' : 'focus:ring-indigo-500/50'} focus:border-transparent transition-all`}
            value={topicSearchTerm}
            onChange={(e) => onTopicSearchChange(e.target.value)}
          />
          <svg className={`absolute right-3 top-2.5 w-4 h-4 ${theme.textMuted}`}
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${theme.scrollbar}`}>
        {topics
          .filter(topic => topic.toLowerCase().includes(topicSearchTerm.toLowerCase()))
          .map(topic => {
            const logCount = logsByTopic[topic]?.length || 0;
            const lastLog = logsByTopic[topic]?.[0];
            const servers = getServersForTopic(topic, logsByTopic);

            return (
              <div key={topic}>
                <button
                  onClick={() => onTopicSelect(topic)}
                  className={`w-full text-left px-4 py-3 border-b ${theme.border}
                           ${theme.hover} transition-all duration-150 group active:scale-[0.99]
                           ${selectedTopic === topic ? theme.selected : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        selectedTopic === topic
                          ? darkMode ? 'bg-green-400' : 'bg-indigo-500'
                          : darkMode ? 'bg-gray-600' : 'bg-gray-400'
                      }`} />
                      <span className={`font-medium truncate ${
                        selectedTopic === topic
                          ? darkMode ? 'text-green-400' : 'text-indigo-600'
                          : theme.textSecondary
                      }`}>
                        {topic}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {logRates?.[topic] > 0 && (
                        <span className={`text-xs ${darkMode ? 'text-green-400' : 'text-indigo-500'} font-mono`}>
                          {logRates[topic]}/s
                        </span>
                      )}
                      {logCount > 0 && (
                        <span className={`text-xs ${theme.card} px-2 py-1 rounded-full ${theme.textMuted} group-hover:bg-opacity-70 transition-colors`}>
                          {logCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {servers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className={`text-xs ${theme.textMuted} mr-1`}>Servers:</span>
                      {servers.slice(0, 3).map(server => (
                        <span key={server}
                              className={`text-xs px-1.5 py-0.5 rounded ${theme.serverBadge}`}>
                          {server}
                        </span>
                      ))}
                      {servers.length > 3 && (
                        <span className={`text-xs ${theme.textMuted}`}>+{servers.length - 3}</span>
                      )}
                    </div>
                  )}

                  {lastLog && (
                    <p className={`text-xs ${theme.textMuted} mt-2 truncate`}>
                      {lastLog.message}
                    </p>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;