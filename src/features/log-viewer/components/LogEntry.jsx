import React, { useMemo, useState, useCallback } from 'react';
import { getRelativeTime } from '../../../utils/logUtils';

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

const LogEntry = ({ log, darkMode, keywords, nowMs, logSearchTerm, terminalMode }) => {
  const relativeTime = useMemo(() => getRelativeTime(log._ts, nowMs), [log._ts, nowMs]);
  const serverName = typeof log.serverName === 'string' ? log.serverName : String(log.serverName ?? 'unknown');
  const message = typeof log.message === 'string' ? log.message : String(log.message ?? '');
  const localTimestamp = useMemo(() => {
    try {
      return new Date(log.timestamp).toLocaleString();
    } catch { return log.timestamp; }
  }, [log.timestamp]);
  const [copied, setCopied] = useState(false);

  // Highlighting builds regexes and splits the message — expensive. Memoize on
  // the inputs that actually affect it so the 5s `nowMs` tick (which only moves
  // the relative timestamp) doesn't re-run it for every visible row.
  const highlightedMessage = useMemo(
    () => highlightMessage(message, keywords, darkMode, logSearchTerm),
    [message, keywords, darkMode, logSearchTerm],
  );

  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    const text = JSON.stringify({ timestamp: log.timestamp, localTime: localTimestamp, serverName: log.serverName, path: log.path, message: log.message }, null, 2);

    const confirm = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };

    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { if (document.execCommand('copy')) confirm(); } catch { /* execCommand not supported */ }
      document.body.removeChild(ta);
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(confirm).catch(fallback);
    } else {
      fallback();
    }
  }, [log, localTimestamp]);

  if (terminalMode) {
    return (
      <div className={`px-4 font-mono text-[13px] leading-5 whitespace-pre-wrap break-words ${darkMode ? 'text-white' : 'text-black'}`}>
        {highlightedMessage}
      </div>
    );
  }

  return (
    <article className="px-3 pt-1.5 pb-1.5">
      <div className={`group/entry relative min-h-[80px] rounded-2xl px-4 py-3.5 transition-all duration-100 ${
        darkMode
          ? 'bg-[#202124] border border-[#353941] hover:bg-[#25272B] shadow-[0_1px_2px_rgba(0,0,0,0.44),0_8px_22px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)]'
          : 'bg-white border border-[#E3E7EB] shadow-[0_1px_3px_rgba(60,64,67,0.1),0_4px_14px_rgba(60,64,67,0.1)] hover:shadow-[0_2px_6px_rgba(60,64,67,0.12),0_10px_22px_rgba(60,64,67,0.12)]'
      }`}>
        <div className="flex items-center gap-2 mb-2.5 overflow-hidden">
          <span className={`text-[11.5px] font-mono tabular-nums flex-shrink-0 ${darkMode ? 'text-[#80868B]' : 'text-[#5F6368]'}`}>
            {relativeTime || 'now'}
          </span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold tracking-wide flex-shrink-0 ${
            darkMode ? 'bg-[#1A3A6B]/60 text-[#8AB4F8]' : 'bg-[#E8F0FE] text-[#1A73E8]'
          }`}>
            {serverName}
          </span>
          <span className={`w-px h-3 flex-shrink-0 ${darkMode ? 'bg-[#303134]' : 'bg-[#E8EAED]'}`} />
          <span className={`text-[11px] font-mono tabular-nums flex-shrink-0 truncate ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
            {localTimestamp}
          </span>
          {log.path && (
            <>
              <span className={`w-px h-3 flex-shrink-0 ${darkMode ? 'bg-[#303134]' : 'bg-[#E8EAED]'}`} />
              <span className={`text-[11px] font-mono truncate ${darkMode ? 'text-[#5F6368]' : 'text-[#9AA0A6]'}`}>
                {log.path}
              </span>
            </>
          )}
        </div>

        <div className={`whitespace-pre-wrap break-words text-[13.5px] leading-[1.65] font-mono ${
          darkMode ? 'text-[#E8EAED]' : 'text-[#202124]'
        }`}>
          {highlightedMessage}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          title="Copy log"
          className={`absolute top-2.5 right-2.5 inline-flex opacity-0 group-hover/entry:opacity-100 transition-all duration-150
            items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium active:scale-95 ${
            copied
              ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
              : (darkMode ? 'bg-[#303134] text-[#80868B] hover:text-[#E8EAED]' : 'bg-[#F1F3F4] text-[#5F6368] hover:text-[#202124]')
          }`}
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
    </article>
  );
};

export default React.memo(LogEntry);
