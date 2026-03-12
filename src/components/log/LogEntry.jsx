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
    <div className={`group rounded-xl border px-3 py-2 ${theme.logEntry} transition-colors`}>
      <div className="flex items-start gap-3">
        <div className="flex w-[86px] flex-shrink-0 flex-col">
          <span
            className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-[11px] whitespace-nowrap font-mono leading-5 cursor-default`}
            title={fullTimestamp}
          >
            {relativeTime || fullTimestamp}
          </span>
          {relativeTime && (
            <span className={`text-[10px] leading-4 ${darkMode ? 'text-gray-700 group-hover:text-gray-500' : 'text-gray-300 group-hover:text-gray-400'} transition-colors`}>
              {fullTimestamp}
            </span>
          )}
        </div>

        <span className={`inline-flex flex-shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
          darkMode ? 'border-blue-500/20 bg-blue-500/10 text-blue-300' : 'border-blue-200 bg-blue-50 text-blue-700'
        }`}>
          {serverName}
        </span>

        <span className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} min-w-0 flex-1 break-words text-[13px] leading-6`}>
          {highlightMessage(message, keywords)}
        </span>

        <button
          onClick={handleCopy}
          className={`opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 rounded-full border p-1.5 ${
            darkMode
              ? 'border-gray-800 bg-black/20 text-gray-500 hover:bg-gray-900 hover:text-gray-300'
              : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600'
          }`}
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
