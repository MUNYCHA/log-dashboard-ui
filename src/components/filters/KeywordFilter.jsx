import React, { useState, useRef } from 'react';

const DEFAULT_COLOR = '#3b82f6'; // blue-500

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
  const modeButtonClass = (isActive) => (
    `rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
      isActive
        ? (darkMode
          ? 'border-blue-500/25 bg-blue-500/10 text-blue-300'
          : 'border-blue-200 bg-blue-50 text-blue-700')
        : (darkMode
          ? 'border-gray-800 bg-black/20 text-gray-400 hover:bg-gray-900 hover:text-gray-200'
          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700')
    }`
  );

  return (
    <div className={`rounded-xl border p-2.5 ${darkMode ? 'border-gray-800 bg-black/10' : 'border-gray-200 bg-white/70'}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${theme.textMuted}`}>
            Keywords
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onModeChange('or')}
              className={modeButtonClass(mode === 'or')}
              title="Show logs matching any keyword"
            >
              Any match
            </button>
            <button
              type="button"
              onClick={() => onModeChange('and')}
              className={modeButtonClass(mode === 'and')}
              title="Show logs matching all keywords"
            >
              All match
            </button>
          </div>
        </div>

        {keywords.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className={`text-[11px] ${theme.textMuted} ${darkMode ? 'hover:text-red-400' : 'hover:text-red-500'} transition-colors`}
          >
            Clear
          </button>
        )}
      </div>

      {showColorPicker && (
        <div className="mb-2 flex items-center gap-2">
          <span className={`text-[11px] ${theme.textMuted}`}>Color</span>
          <label
            className={`relative inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border ${
              darkMode ? 'border-gray-800 bg-black/20' : 'border-gray-200 bg-white'
            }`}
            style={{ boxShadow: `0 0 0 2px ${selectedColor}40` }}
            title="Choose keyword color"
          >
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <span
              className="h-3.5 w-3.5 rounded-full border border-white/60"
              style={{ backgroundColor: selectedColor }}
            />
          </label>
          <span className={`text-[11px] font-mono ${theme.textMuted}`}>
            {selectedColor.toUpperCase()}
          </span>
        </div>
      )}

      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex min-h-[42px] w-full items-center gap-2 rounded-xl border px-2.5 py-2 transition-colors ${
          darkMode ? 'border-gray-800 bg-black/20' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {keywords.map((kw) => (
            <span
              key={kw.text}
              className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium"
              style={{
                borderColor: `${kw.color}40`,
                backgroundColor: `${kw.color}14`,
                color: kw.color,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: kw.color }} />
              <span>{kw.text}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(kw.text); }}
                className="leading-none transition-colors hover:text-red-400"
                aria-label={`Remove keyword ${kw.text}`}
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
            placeholder={keywords.length === 0 ? 'Type a keyword...' : 'Add keyword...'}
            className={`min-w-[160px] flex-1 bg-transparent text-sm outline-none ${theme.text}
              ${darkMode ? 'placeholder:text-gray-600' : 'placeholder:text-gray-400'}`}
          />
        </div>

        <button
          type="button"
          onClick={() => commit(inputValue)}
          disabled={!canAdd}
          className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
            canAdd
              ? (darkMode
                ? 'border-blue-500/25 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15'
                : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100')
              : (darkMode
                ? 'border-gray-800 bg-black/20 text-gray-600'
                : 'border-gray-200 bg-white text-gray-400')
          }`}
        >
          Add
        </button>
      </div>

      <div className={`mt-1.5 px-1 text-[11px] ${theme.textMuted}`}>
        Press Enter to add. Use Any match for broad filtering or All match for stricter results.
      </div>
    </div>
  );
};

export default KeywordFilter;
