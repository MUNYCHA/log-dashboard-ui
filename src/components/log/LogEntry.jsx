import React, { useMemo } from 'react';
import { formatTimestamp, getRelativeTime } from '../../utils/logUtils';

const highlightMessage = (message, keywords) => {
  const safeMessage = typeof message === 'string' ? message : String(message ?? '');
  if (!keywords || keywords.length === 0) return safeMessage;

  const escaped = keywords.map((kw) =>
    kw.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = safeMessage.split(regex);

  return parts.map((part, i) => {
    const match = keywords.find((kw) => kw.text.toLowerCase() === part.toLowerCase());
    if (!match) return part;
    return (
      <mark
        key={`${part}-${i}`}
        className="rounded px-0.5 font-semibold"
        style={{ backgroundColor: `${match.color}25`, color: match.color }}
      >
        {part}
      </mark>
    );
  });
};

const LogEntry = ({ log, theme, darkMode, keywords, timestampGen }) => {
  const fullTimestamp = formatTimestamp(log.timestamp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const relativeTime = useMemo(() => getRelativeTime(log.timestamp, Date.now()), [log.timestamp, timestampGen]);
  const serverName = typeof log.serverName === 'string' ? log.serverName : String(log.serverName ?? 'unknown');
  const message = typeof log.message === 'string' ? log.message : String(log.message ?? '');

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        return;
      }
    } catch {
      // Fallback below.
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = message;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch {
      // Ignore clipboard failures.
    }
  };

  return (
    <div className={`group py-1.5 px-3 rounded ${theme.logEntry} transition-colors`}>
      <div className="flex items-start gap-3">
        <span
          className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-xs whitespace-nowrap font-mono flex-shrink-0 cursor-default`}
          title={fullTimestamp}
        >
          {relativeTime ? (
            <>
              <span>{relativeTime}</span>
              <span className={`hidden group-hover:inline ml-1.5 opacity-60`}>{fullTimestamp}</span>
            </>
          ) : (
            `[${fullTimestamp}]`
          )}
        </span>

        <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} text-sm font-medium whitespace-nowrap flex-shrink-0`}>
          {serverName}
        </span>

        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm break-all flex-1 min-w-0`}>
          {highlightMessage(message, keywords)}
        </span>

        <button
          onClick={handleCopy}
          className={`opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${theme.textMuted}`}
          title="Copy message"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default React.memo(LogEntry);
