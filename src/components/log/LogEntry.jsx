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
      className={`rounded-lg border px-3 py-2.5 ${
        darkMode
          ? 'border-gray-800 bg-[#0b1016] text-gray-200'
          : 'border-slate-200 bg-white text-slate-800'
      }`}
      title={serverName}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono leading-4">
        <span className={`${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
          {relativeTime || 'now'}
        </span>
        <span className={`${darkMode ? 'text-sky-300' : 'text-sky-700'}`}>
          {serverName}
        </span>
      </div>

      <div className={`mt-2 whitespace-pre-wrap break-words text-[12px] leading-5 md:text-[13px] ${darkMode ? 'text-gray-100' : 'text-slate-700'}`}>
        {highlightMessage(message, keywords)}
      </div>
    </article>
  );
};

export default React.memo(LogEntry);
