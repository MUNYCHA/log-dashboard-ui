import React, { useMemo } from 'react';
import { getLogLevelColor, getRelativeTime } from '../../utils/logUtils';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightSearchInText = (text, searchRegex, darkMode, keyBase) => {
  if (!searchRegex || !text) return [text];

  const flags = searchRegex.flags.includes('g') ? searchRegex.flags : `${searchRegex.flags}g`;
  const regex = new RegExp(searchRegex.source, flags);
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matched = match[0];
    if (!matched) {
      regex.lastIndex += 1;
      continue;
    }

    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(
      <mark
        key={`${keyBase}-${match.index}-${parts.length}`}
        className={`rounded px-0.5 text-inherit ${darkMode ? 'bg-yellow-200/30' : 'bg-yellow-200/60'}`}
      >
        {matched}
      </mark>,
    );

    lastIndex = match.index + matched.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};

const highlightMessage = (message, keywords, darkMode, logSearchTerm, isRegex) => {
  const safeMessage = typeof message === 'string' ? message : String(message ?? '');

  const keywordNodes = (() => {
    if (!keywords || keywords.length === 0) return [safeMessage];
    const escaped = keywords.map((kw) => escapeRegExp(kw.text));
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = safeMessage.split(regex);

    return parts.map((part, i) => {
      const match = keywords.find((kw) => kw.text.toLowerCase() === part.toLowerCase());
      if (!match) return part;
      return (
        <mark
          key={`kw-${part}-${i}`}
          className="rounded px-0.5 font-semibold"
          style={{ backgroundColor: `${match.color}${darkMode ? '40' : '25'}`, color: match.color }}
        >
          {part}
        </mark>
      );
    });
  })();

  const searchTerm = typeof logSearchTerm === 'string' ? logSearchTerm.trim() : '';
  if (!searchTerm) {
    return keywordNodes.length === 1 ? keywordNodes[0] : keywordNodes;
  }

  let searchRegex;
  if (isRegex) {
    try {
      searchRegex = new RegExp(searchTerm, 'i');
    } catch {
      return keywordNodes.length === 1 ? keywordNodes[0] : keywordNodes;
    }
  } else {
    searchRegex = new RegExp(escapeRegExp(searchTerm), 'i');
  }

  const combined = [];
  keywordNodes.forEach((node, index) => {
    if (typeof node === 'string') {
      combined.push(...highlightSearchInText(node, searchRegex, darkMode, `search-${index}`));
      return;
    }
    combined.push(node);
  });

  return combined.length === 1 ? combined[0] : combined;
};

const detectLogLevel = (message) => {
  const source = String(message ?? '').toLowerCase();
  if (/\b(error|err|fatal|critical|crit)\b/.test(source)) return 'error';
  if (/\b(warn|warning)\b/.test(source)) return 'warn';
  if (/\b(info|notice)\b/.test(source)) return 'info';
  if (/\b(debug|trace)\b/.test(source)) return 'debug';
  return null;
};

const LogEntry = ({ log, darkMode, keywords, timestampGen, logSearchTerm, isRegex }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const relativeTime = useMemo(() => getRelativeTime(log.timestamp, Date.now()), [log.timestamp, timestampGen]);
  const serverName = typeof log.serverName === 'string' ? log.serverName : String(log.serverName ?? 'unknown');
  const message = typeof log.message === 'string' ? log.message : String(log.message ?? '');
  const logLevel = useMemo(() => detectLogLevel(message), [message]);
  const { levelTextClass } = useMemo(() => {
    const tone = getLogLevelColor(logLevel, darkMode);
    const textClass = tone.split(' ').find((token) => token.startsWith('text-')) ??
      (darkMode ? 'text-gray-500' : 'text-gray-400');
    return {
      levelTextClass: textClass,
    };
  }, [logLevel, darkMode]);

  return (
    <article
      className={`relative border-b px-3 py-2 ${
        darkMode
          ? 'border-[#1e1e1e] text-gray-300 hover:bg-[#161616]'
          : 'border-gray-100 text-gray-700 hover:bg-gray-50/50'
      }`}
      title={serverName}
    >
      <span className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-current ${levelTextClass}`} />

      <div className="flex items-center gap-3 text-[11px] font-mono leading-4">
        <span className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} min-w-[3.5rem]`}>
          {relativeTime || 'now'}
        </span>
        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
          {serverName}
        </span>
      </div>

      <div className={`mt-1 whitespace-pre-wrap break-words text-[12.5px] leading-[1.6] md:text-[13px] font-mono ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        {highlightMessage(message, keywords, darkMode, logSearchTerm, isRegex)}
      </div>
    </article>
  );
};

export default React.memo(LogEntry);
