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
  darkMode
}) => {
  return (
    <div className={`w-96 flex flex-col border-r ${theme.border} ${theme.sidebar} backdrop-blur-xl`}>
      <div className={`p-5 border-b ${theme.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 ${darkMode ? 'bg-green-400' : 'bg-blue-500'} rounded-full animate-pulse`} />
            <h1 className={`text-lg font-semibold ${darkMode ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'} bg-clip-text text-transparent`}>
              Log Topics
            </h1>
          </div>
          <span className={`text-xs ${theme.textMuted}`}>
            {topics.length} active
          </span>
        </div>
      </div>

      <div className={`p-3 border-b ${theme.border}`}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search topics..."
            className={`w-full ${theme.input} rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 
                     ${darkMode ? 'focus:ring-green-500/50' : 'focus:ring-blue-500/50'} focus:border-transparent transition-all`}
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
                  className={`w-full text-left px-5 py-4 border-b ${theme.border} 
                           ${theme.hover} transition-all duration-200 group
                           ${selectedTopic === topic 
                             ? theme.selected
                             : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedTopic === topic 
                          ? darkMode ? 'bg-green-400' : 'bg-blue-500'
                          : darkMode ? 'bg-gray-600' : 'bg-gray-400'
                      }`} />
                      <span className={`font-medium ${
                        selectedTopic === topic 
                          ? darkMode ? 'text-green-400' : 'text-blue-600'
                          : theme.textSecondary
                      }`}>
                        {topic}
                      </span>
                    </div>
                    {logCount > 0 && (
                      <span className={`text-xs ${theme.card} px-2 py-1 rounded-full ${theme.textMuted}
                                     group-hover:bg-opacity-70 transition-colors`}>
                        {logCount}
                      </span>
                    )}
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
                    <p className={`text-xs ${theme.textMuted} mt-2 truncate max-w-[250px]`}>
                      {lastLog.message}
                    </p>
                  )}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Sidebar;