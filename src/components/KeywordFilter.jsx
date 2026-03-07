import React, { useState, useRef } from 'react';

const DEFAULT_COLOR = '#06b6d4'; // cyan

const hexToRgb = (hex) => {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return { r: 6, g: 182, b: 212 };
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

/**
 * Tag-style keyword filter with color wheel + RGB/hex color picker.
 *
 * keywords shape: { text: string, color: string }[]  (color is a hex string e.g. "#ef4444")
 *
 * UX:
 *   - Type a keyword → color picker appears below
 *   - Pick color via wheel (native), hex input, or R/G/B inputs
 *   - Press Enter or comma to commit as a colored chip
 *   - Backspace on empty input removes the last chip
 */
const KeywordFilter = ({
  keywords,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
  onClearAll,
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
    focus:ring-1 ${darkMode ? 'focus:ring-cyan-500/50' : 'focus:ring-cyan-400/50'}`;

  return (
    <div className="mt-2">
      {/* Label row */}
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-medium ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
          Keyword filter
          <span className={`ml-1.5 font-normal ${theme.textMuted}`}>
            — match any keyword (OR)
          </span>
        </span>
        {keywords.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className={`text-xs ${theme.textMuted} hover:text-red-400 transition-colors`}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Chip + text input */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex flex-wrap items-center gap-1.5 min-h-[36px] w-full px-3 py-1.5
          rounded-lg border cursor-text transition-colors ${theme.input}
          ${darkMode ? 'border-cyan-500/30' : 'border-cyan-400/40'}`}
      >
        {keywords.map((kw) => (
          <span
            key={kw.text}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono border"
            style={{
              backgroundColor: `${kw.color}25`,
              color: kw.color,
              borderColor: `${kw.color}55`,
            }}
          >
            {kw.text}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(kw.text); }}
              className="hover:text-red-400 transition-colors leading-none"
              aria-label={`Remove keyword ${kw.text}`}
            >
              <XIcon />
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
            ${darkMode ? 'placeholder:text-gray-500' : 'placeholder:text-gray-400'}`}
        />
      </div>

      {/* Color picker — visible while typing */}
      {showPicker && (
        <div className={`mt-2 px-1 flex flex-wrap items-center gap-3`}>
          <span className={`text-xs ${theme.textMuted} whitespace-nowrap`}>Color:</span>

          {/* Color wheel (native system picker) */}
          <div className="relative flex-shrink-0">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => applyColor(e.target.value)}
              className="absolute inset-0 opacity-0 w-8 h-8 cursor-pointer"
              tabIndex={-1}
            />
            <div
              className="w-8 h-8 rounded-full border-2 shadow-md cursor-pointer
                         transition-transform hover:scale-110"
              style={{
                backgroundColor: selectedColor,
                borderColor: `${selectedColor}90`,
              }}
              title="Open color wheel"
            />
          </div>

          {/* Hex input */}
          <div className="flex items-center gap-1">
            <span className={`text-xs font-mono ${theme.textMuted}`}>#</span>
            <input
              type="text"
              value={hexInput}
              maxLength={6}
              placeholder="06b6d4"
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                setHexInput(raw);
                if (raw.length === 6) applyColor('#' + raw);
              }}
              className={`w-16 font-mono ${inputBaseClass}`}
            />
          </div>

          {/* RGB inputs */}
          <div className="flex items-center gap-2">
            {[
              { ch: 'r', label: 'R', val: rgb.r },
              { ch: 'g', label: 'G', val: rgb.g },
              { ch: 'b', label: 'B', val: rgb.b },
            ].map(({ ch, label, val }) => (
              <div key={ch} className="flex items-center gap-1">
                <span className={`text-xs font-medium ${theme.textMuted}`}>{label}</span>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={val}
                  onChange={(e) => handleRgbChange(ch, e.target.value)}
                  className={`w-12 text-center ${inputBaseClass}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const XIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default KeywordFilter;
