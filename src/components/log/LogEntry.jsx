import React, { useMemo } from 'react';
import { formatTimestamp, getRelativeTime } from '../../utils/logUtils';

/**
 * Splits a message string by active keywords and wraps matches
 * in colored <mark> spans using inline styles (supports arbitrary hex colors).
 * Case-insensitive.
 */
const highlightMessage = (message, keywords) => {
  if (!keywords || keywords.length === 0) return message;

  const escaped = keywords.map((kw) =>
    kw.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = message.split(regex);

  return parts.map((part, i) => {
    const match = keywords.find((kw) => kw.text.toLowerCase() === part.toLowerCase());
    if (!match) return part;
    return (
      <mark
        key={i}
        className="rounded px-0.5 not-italic font-semibold"
        style={{ backgroundColor: `${match.color}30`, color: match.color }}
      >
        {part}
      </mark>
    );
  });
};

// timestampGen is a generation counter that bumps every 30s to trigger
// relative-time recalculation without passing a changing `now` value.
const LogEntry = ({ log, theme, darkMode, keywords, timestampGen }) => {
  const fullTimestamp = formatTimestamp(log.timestamp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const relativeTime = useMemo(() => getRelativeTime(log.timestamp, Date.now()), [log.timestamp, timestampGen]);

  return (
    <div
      className={`group py-2 px-3 rounded-lg ${theme.logEntry} transition-colors duration-150`}
    >
      <div className="flex items-start space-x-3">
        {/* Timestamp — shows relative time, full on hover */}
        <span
          className={`${darkMode ? 'text-purple-400' : 'text-purple-600'} text-xs whitespace-nowrap font-mono flex-shrink-0 cursor-default`}
          title={fullTimestamp}
        >
          {relativeTime ? (
            <>
              <span>{relativeTime}</span>
              <span className={`hidden group-hover:inline ml-1.5 opacity-50`}>{fullTimestamp}</span>
            </>
          ) : (
            `[${fullTimestamp}]`
          )}
        </span>

        {/* Server name */}
        <span className={`${darkMode ? 'text-amber-400' : 'text-amber-700'} font-medium whitespace-nowrap flex-shrink-0`}>
          {log.serverName}
        </span>

        {/* Message — keywords highlighted */}
        <span className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'} break-all flex-1 min-w-0`}>
          {highlightMessage(log.message, keywords)}
        </span>

        {/* Copy button */}
        <button
          onClick={() => navigator.clipboard.writeText(log.message)}
          className={`opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0
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

export default React.memo(LogEntry);
