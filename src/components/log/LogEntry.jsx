import React, { useMemo } from 'react';
import { getRelativeTime } from '../../utils/logUtils';

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

const LogEntry = ({ log, darkMode, keywords, timestampGen }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const relativeTime = useMemo(() => getRelativeTime(log.timestamp, Date.now()), [log.timestamp, timestampGen]);
  const serverName = typeof log.serverName === 'string' ? log.serverName : String(log.serverName ?? 'unknown');
  const message = typeof log.message === 'string' ? log.message : String(log.message ?? '');

  return (
    <article
      className={`border-b px-3 py-2 ${
        darkMode
          ? 'border-[#1e1e1e] text-gray-300 hover:bg-[#161616]'
          : 'border-gray-100 text-gray-700 hover:bg-gray-50/50'
      }`}
      title={serverName}
    >
      <div className="flex items-center gap-3 text-[11px] font-mono leading-4">
        <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} min-w-[3.5rem]`}>
          {relativeTime || 'now'}
        </span>
        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
          {serverName}
        </span>
      </div>

      <div className={`mt-1 whitespace-pre-wrap break-words text-[12.5px] leading-[1.6] md:text-[13px] font-mono ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        {highlightMessage(message, keywords)}
      </div>
    </article>
  );
};

export default React.memo(LogEntry);
