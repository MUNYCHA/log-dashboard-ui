import React, { useMemo } from 'react';
import { getRelativeTime } from '../../utils/logUtils';

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
        className={`rounded px-0.5 text-inherit ${darkMode ? 'bg-yellow-300/25' : 'bg-yellow-200/70'}`}
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

const highlightMessage = (message, keywords, darkMode, logSearchTerm) => {
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
          style={{ backgroundColor: `${match.color}${darkMode ? '38' : '22'}`, color: match.color }}
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

  const searchRegex = new RegExp(escapeRegExp(searchTerm), 'i');

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

const LogEntry = ({ log, darkMode, keywords, timestampGen, logSearchTerm }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const relativeTime = useMemo(() => getRelativeTime(log.timestamp, Date.now()), [log.timestamp, timestampGen]);
  const serverName = typeof log.serverName === 'string' ? log.serverName : String(log.serverName ?? 'unknown');
  const message = typeof log.message === 'string' ? log.message : String(log.message ?? '');
  const { isFresh } = useMemo(() => {
    const ts = new Date(log.timestamp).getTime();
    return { isFresh: Number.isFinite(ts) && Date.now() - ts < 2500 };
  }, [log.timestamp]);
  void isFresh;

  return (
    <article className="px-3 pt-1.5 pb-0">
      <div className={`min-h-[80px] rounded-2xl px-4 py-3.5 transition-colors duration-100 ${
        darkMode
          ? 'bg-[#1E1C1A] border border-[#2A2724] hover:bg-[#252320]'
          : 'bg-white border border-[#E8E2DC] shadow-sm hover:shadow-md hover:bg-[#FDFCFA]'
      }`}>
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`text-[11.5px] font-mono tabular-nums flex-shrink-0 ${darkMode ? 'text-[#938D87]' : 'text-[#79736D]'}`}>
            {relativeTime || 'now'}
          </span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold tracking-wide flex-shrink-0 ${
            darkMode ? 'bg-[#0842A0]/30 text-[#A8C7FA]' : 'bg-[#D3E3FD] text-[#0B57D0]'
          }`}>
            {serverName}
          </span>
        </div>

        <div className={`whitespace-pre-wrap break-words text-[13.5px] leading-[1.65] font-mono ${
          darkMode ? 'text-[#E8E2DC]' : 'text-[#1C1B1A]'
        }`}>
          {highlightMessage(message, keywords, darkMode, logSearchTerm)}
        </div>
      </div>
    </article>
  );
};

export default React.memo(LogEntry);
