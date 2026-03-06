import React from 'react';
import { getLogLevelColor, formatTimestamp } from '../utils/logUtils';

const LogEntry = ({ 
  log, 
  theme, 
  darkMode 
}) => {
  return (
    <div 
      className={`group py-2 px-3 rounded-lg ${theme.logEntry} transition-colors 
               border ${theme.border}`}
    >
      <div className="flex items-start space-x-3">
        {log.level && (
          <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getLogLevelColor(log.level, darkMode)}`}>
            {log.level.toUpperCase()}
          </span>
        )}
        
        {/* Different color for timestamp */}
        <span className={`${darkMode ? 'text-purple-400' : 'text-purple-600'} text-xs whitespace-nowrap font-mono`}>
          [{formatTimestamp(log.timestamp)}]
        </span>
        
        {/* Different color for server name - no longer clickable */}
        <span className={`${darkMode ? 'text-amber-400' : 'text-amber-700'} font-medium whitespace-nowrap`}>
          {log.serverName}
        </span>
        
        {/* Different color for message */}
        <span className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} break-all flex-1`}>
          {log.message}
        </span>

        <button
          onClick={() => navigator.clipboard.writeText(log.message)}
          className={`opacity-0 group-hover:opacity-100 transition-opacity 
                   ${theme.textMuted} hover:${theme.textSecondary}`}
          title="Copy message"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LogEntry;