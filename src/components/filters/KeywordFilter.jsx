import React, { useState, useRef } from 'react';

const DEFAULT_COLOR = '#3b82f6'; // blue-500

const hexToRgb = (hex) => {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return { r: 59, g: 130, b: 246 };
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const rgbToHex = (r, g, b) =>
  '#' +
  [r, g, b]
    .map((v) =>
      Math.min(255, Math.max(0, Math.round(Number(v) || 0)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');

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
  const [hexInput, setHexInput] = useState(DEFAULT_COLOR.replace('#', ''));
  const inputRef = useRef(null);

  const applyColor = (hex) => {
    setSelectedColor(hex);
    setHexInput(hex.replace('#', ''));
  };

  const handleRgbChange = (channel, value) => {
    const rgb = hexToRgb(selectedColor);
    const hex = rgbToHex(
      channel === 'r' ? value : rgb.r,
      channel === 'g' ? value : rgb.g,
      channel === 'b' ? value : rgb.b,
    );
    applyColor(hex);
  };

  const commit = (raw) => {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed && !keywords.some((k) => k.text === trimmed)) {
      onAdd({ text: trimmed, color: selectedColor });
    }
    onInputChange('');
    applyColor(DEFAULT_COLOR);
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

  const showPicker = inputValue.trim().length > 0;
  const rgb = hexToRgb(selectedColor);

  const inputBaseClass = `text-xs px-2 py-1 rounded-md outline-none ${theme.input}
    focus:ring-1 ${darkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-500'}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`text-xs ${theme.textMuted}`}>
            Keywords
          </span>
          <button
            type="button"
            onClick={() => onModeChange(mode === 'or' ? 'and' : 'or')}
            className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${
              darkMode
                ? 'border-gray-700 text-gray-400 hover:bg-gray-800'
                : 'border-gray-200 text-gray-500 hover:bg-gray-100'
            }`}
            title={`Currently: match ${mode.toUpperCase()} keywords. Click to toggle.`}
          >
            {mode.toUpperCase()}
          </button>
        </div>

        {keywords.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className={`text-xs ${theme.textMuted} ${darkMode ? 'hover:text-red-400' : 'hover:text-red-500'} transition-colors`}
          >
            Clear all
          </button>
        )}
      </div>

      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex flex-wrap items-center gap-1.5 min-h-[32px] w-full px-2.5 py-1.5
          rounded-md cursor-text transition-colors ${theme.input}`}
      >
        {keywords.map((kw) => (
          <span
            key={kw.text}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono"
            style={{
              backgroundColor: `${kw.color}20`,
              color: kw.color,
            }}
          >
            {kw.text}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(kw.text); }}
              className="hover:text-red-400 transition-colors leading-none"
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
          placeholder={keywords.length === 0 ? 'Type keyword, press Enter...' : ''}
          className={`flex-1 min-w-[140px] bg-transparent text-sm outline-none ${theme.text}
            ${darkMode ? 'placeholder:text-gray-600' : 'placeholder:text-gray-400'}`}
        />
      </div>

      {showPicker && (
        <div className="mt-1.5 px-1 flex flex-wrap items-center gap-3">
          <span className={`text-xs ${theme.textMuted}`}>Color:</span>

          <div className="relative flex-shrink-0">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => applyColor(e.target.value)}
              className="absolute inset-0 opacity-0 w-6 h-6 cursor-pointer"
              tabIndex={-1}
            />
            <div
              className="w-6 h-6 rounded border cursor-pointer"
              style={{ backgroundColor: selectedColor, borderColor: `${selectedColor}60` }}
              title="Open color picker"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className={`text-xs font-mono ${theme.textMuted}`}>#</span>
            <input
              type="text"
              value={hexInput}
              maxLength={6}
              placeholder="3b82f6"
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                setHexInput(raw);
                if (raw.length === 6) applyColor('#' + raw);
              }}
              className={`w-16 font-mono ${inputBaseClass}`}
            />
          </div>

          <div className="flex items-center gap-2">
            {[
              { ch: 'r', label: 'R', val: rgb.r },
              { ch: 'g', label: 'G', val: rgb.g },
              { ch: 'b', label: 'B', val: rgb.b },
            ].map(({ ch, label, val }) => (
              <div key={ch} className="flex items-center gap-1">
                <span className={`text-xs ${theme.textMuted}`}>{label}</span>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={val}
                  onChange={(e) => handleRgbChange(ch, e.target.value)}
                  className={`w-14 text-center ${inputBaseClass}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordFilter;
