import React, { useState, useRef } from 'react';

const DEFAULT_COLOR = '#0B57D0';

const KeywordFilter = ({
  keywords,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
  onClearAll,
  mode,
  onModeChange,
  theme,
  darkMode,
}) => {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const inputRef = useRef(null);

  const commit = (raw) => {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed && !keywords.some((k) => k.text === trimmed)) {
      onAdd({ text: trimmed, color: selectedColor });
    }
    onInputChange('');
    setSelectedColor(DEFAULT_COLOR);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(inputValue);
    }
    if (e.key === 'Backspace' && inputValue === '' && keywords.length > 0) {
      onRemove(keywords[keywords.length - 1].text);
    }
  };

  const canAdd = inputValue.trim().length > 0;

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`flex min-h-[36px] w-full items-center gap-2 rounded-full border px-3 py-1 cursor-text transition-all duration-150 ease-in-out focus-within:ring-2 ${
        darkMode
          ? 'bg-[#252219] border-[#4A4540] focus-within:ring-[#A8C7FA]/20 focus-within:border-[#A8C7FA]'
          : 'bg-white border-[#C5BEB7] focus-within:ring-[#0B57D0]/20 focus-within:border-[#0B57D0]'
      }`}
    >
      {/* Tag icon */}
      <svg className={`w-3.5 h-3.5 flex-shrink-0 ${theme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 014-4z" />
      </svg>

      {/* Chips + input */}
      <div className="flex flex-1 flex-wrap items-center gap-1.5 min-w-0">
        {keywords.map((kw) => (
          <span
            key={kw.text}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium leading-none"
            style={{ backgroundColor: `${kw.color}1A`, color: kw.color }}
          >
            <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: kw.color }} />
            {kw.text}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(kw.text); }}
              className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity leading-none"
              aria-label={`Remove ${kw.text}`}
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={keywords.length === 0 ? 'Add keyword…' : '…'}
          className={`min-w-[80px] flex-1 bg-transparent text-[13px] outline-none ${
            darkMode ? 'text-[#ECE6DF] placeholder:text-[#6E6862]' : 'text-[#1C1B1A] placeholder:text-[#A39E97]'
          }`}
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1 flex-shrink-0">

        {/* Color swatch — only while typing */}
        {canAdd && (
          <label
            className="relative inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full flex-shrink-0 transition-transform active:scale-95"
            style={{ boxShadow: `0 0 0 1.5px ${selectedColor}55` }}
            title="Highlight color"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedColor }} />
          </label>
        )}

        {/* Add — + icon, only while typing */}
        {canAdd && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); commit(inputValue); }}
            className="h-6 w-6 rounded-full bg-[#0B57D0] text-white flex items-center justify-center flex-shrink-0 transition-all duration-150 active:scale-95 hover:bg-[#0842A0]"
            title="Add keyword (Enter)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}

        {/* Divider */}
        <div className={`w-px h-4 mx-0.5 ${darkMode ? 'bg-[#4A4540]' : 'bg-[#DDD7D0]'}`} />

        {/* or / and mode toggle */}
        <div className={`inline-flex items-center rounded-full p-0.5 ${
          darkMode ? 'bg-[#2A2724]' : 'bg-[#EEE8E2]'
        }`}>
          {['or', 'and'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={(e) => { e.stopPropagation(); onModeChange(m); }}
              title={m === 'or' ? 'Match any keyword' : 'Match all keywords'}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-all duration-150 ease-in-out ${
                mode === m
                  ? 'bg-[#0B57D0] text-white shadow-sm'
                  : darkMode
                    ? 'text-[#938D87] hover:text-[#CAC4BC]'
                    : 'text-[#79736D] hover:text-[#4A4540]'
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Clear all — trash icon */}
        {keywords.length > 0 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClearAll(); }}
            className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 ease-in-out active:scale-95 ${
              darkMode
                ? 'text-[#6E6862] hover:text-[#F28B82] hover:bg-[#2E2B28]'
                : 'text-[#A39E97] hover:text-[#C5221F] hover:bg-[#EEE8E2]'
            }`}
            title="Clear all keywords"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default KeywordFilter;
