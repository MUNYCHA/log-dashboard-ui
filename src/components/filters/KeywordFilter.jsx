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
  const showColorPicker = canAdd;

  const modeBtn = (isActive) =>
    `rounded-xl px-3 py-1.5 text-[12.5px] font-medium transition-all duration-150 ease-in-out active:scale-95 ${
      isActive
        ? 'bg-[#0B57D0] text-white'
        : darkMode
          ? 'text-[#CAC4BC] hover:bg-[#2E2B28] hover:text-[#E8E2DC]'
          : 'text-[#4A4540] hover:bg-[#EEE8E2] hover:text-[#1C1B1A]'
    }`;

  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${darkMode ? 'border-[#3A3530] bg-[#1E1C1A]' : 'border-[#E4DDD6] bg-[#FFFDF9]'}`}>
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2">
          <span className={`text-[13px] font-semibold ${theme.text}`}>Keywords</span>
          {keywords.length > 0 && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-mono font-medium ${
              darkMode ? 'bg-[#252320] text-[#938D87]' : 'bg-[#EEE8E2] text-[#79736D]'
            }`}>{keywords.length}</span>
          )}
        </div>

        {/* Mode toggle */}
        <div className={`inline-flex items-center rounded-2xl border p-1 ${
          darkMode ? 'border-[#3F3A34] bg-[#252320]' : 'border-[#DDD7D0] bg-[#EEE8E2]'
        }`}>
          <button type="button" onClick={() => onModeChange('or')} className={modeBtn(mode === 'or')} title="Any keyword matches">
            Any
          </button>
          <button type="button" onClick={() => onModeChange('and')} className={modeBtn(mode === 'and')} title="All keywords must match">
            All
          </button>
        </div>

        {keywords.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className={`ml-auto text-[12.5px] font-medium transition-all duration-150 ease-in-out ${
              darkMode ? 'text-[#938D87] hover:text-[#F28B82]' : 'text-[#79736D] hover:text-[#C5221F]'
            }`}
          >
            Clear all
          </button>
        )}
      </div>

      {showColorPicker && (
        <div className={`mb-3 inline-flex items-center gap-2.5 rounded-xl border px-3 py-2 ${
          darkMode ? 'border-[#3F3A34] bg-[#252320]' : 'border-[#DDD7D0] bg-[#EEE8E2]'
        }`}>
          <span className={`text-[12.5px] ${theme.textMuted}`}>Highlight color</span>
          <label
            className="relative inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/30"
            style={{ boxShadow: `0 0 0 2px ${selectedColor}50` }}
            title="Choose keyword color"
          >
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedColor }} />
          </label>
          <span className={`text-[12px] font-mono ${theme.textMuted}`}>{selectedColor.toUpperCase()}</span>
        </div>
      )}

      {/* Input area */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex min-h-[48px] w-full items-center gap-2 rounded-2xl border px-3 py-2.5 cursor-text transition-all duration-150 ease-in-out focus-within:ring-2 ${
          darkMode
            ? 'bg-[#252219] border-[#4A4540] focus-within:ring-[#A8C7FA]/20 focus-within:border-[#A8C7FA]'
            : 'bg-white border-[#C5BEB7] focus-within:ring-[#0B57D0]/20 focus-within:border-[#0B57D0]'
        }`}
      >
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {keywords.map((kw) => (
            <span
              key={kw.text}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium"
              style={{
                borderColor: `${kw.color}38`,
                backgroundColor: `${kw.color}14`,
                color: kw.color,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: kw.color }} />
              <span>{kw.text}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(kw.text); }}
                className="leading-none transition-opacity opacity-60 hover:opacity-100"
                aria-label={`Remove ${kw.text}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            placeholder={keywords.length === 0 ? 'Type a keyword, press Enter' : 'Add another'}
            className={`min-w-[180px] flex-1 bg-transparent text-[13px] outline-none ${
              darkMode ? 'text-[#ECE6DF] placeholder:text-[#8E8882]' : 'text-[#1C1B1A] placeholder:text-[#79736D]'
            }`}
          />
        </div>

        <button
          type="button"
          onClick={() => commit(inputValue)}
          disabled={!canAdd}
          className={`rounded-xl px-4 py-1.5 text-[12.5px] font-semibold flex-shrink-0 border
            transition-all duration-150 ease-in-out active:scale-95
            ${canAdd
              ? 'bg-[#0B57D0] text-white border-[#0B57D0] hover:bg-[#0842A0] hover:border-[#0842A0]'
              : 'border-transparent bg-transparent text-[#79736D] opacity-40 cursor-not-allowed'
            }`}
        >
          Add
        </button>
      </div>

      <p className={`mt-2 px-1 text-[12px] ${theme.textMuted}`}>
        Enter or comma to add · Backspace removes last · Any = broad, All = narrow
      </p>
    </div>
  );
};

export default KeywordFilter;
