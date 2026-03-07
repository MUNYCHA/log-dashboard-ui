import React, { useState, useRef } from 'react';

const DEFAULT_COLOR = '#06b6d4'; // cyan
const PRESETS_KEY = 'logstream_keyword_presets';

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

const loadPresets = () => {
  try {
    return JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}');
  } catch {
    return {};
  }
};

/**
 * Tag-style keyword filter with color wheel + RGB/hex color picker,
 * AND/OR mode toggle, and saved keyword presets.
 *
 * keywords shape: { text: string, color: string }[]
 */
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
  const [presets, setPresets] = useState(() => loadPresets());
  const [presetNameInput, setPresetNameInput] = useState('');
  const [showPresets, setShowPresets] = useState(false);
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

  const savePreset = () => {
    const name = presetNameInput.trim();
    if (!name || keywords.length === 0) return;
    const updated = { ...presets, [name]: keywords };
    setPresets(updated);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
    setPresetNameInput('');
  };

  const loadPreset = (name) => {
    onClearAll();
    const preset = presets[name];
    if (preset) preset.forEach((kw) => onAdd(kw));
    setShowPresets(false);
  };

  const deletePreset = (name) => {
    const updated = { ...presets };
    delete updated[name];
    setPresets(updated);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
  };

  const showPicker = inputValue.trim().length > 0;
  const rgb = hexToRgb(selectedColor);
  const presetNames = Object.keys(presets);

  const inputBaseClass = `text-xs px-2 py-1 rounded-md outline-none ${theme.input}
    focus:ring-1 ${darkMode ? 'focus:ring-cyan-500/50' : 'focus:ring-cyan-400/50'}`;

  return (
    <div className="mt-2">
      {/* Label row */}
      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
            Keyword filter
          </span>
          {/* AND / OR toggle */}
          <button
            type="button"
            onClick={() => onModeChange(mode === 'or' ? 'and' : 'or')}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
              darkMode
                ? 'border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20'
                : 'border-cyan-400/50 text-cyan-600 hover:bg-cyan-100'
            }`}
            title={`Currently: match ${mode.toUpperCase()} keywords. Click to toggle.`}
          >
            {mode.toUpperCase()}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Presets dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresets((v) => !v)}
              className={`text-xs ${theme.textMuted} hover:${theme.textSecondary} transition-colors`}
              title="Saved keyword presets"
            >
              Presets {presetNames.length > 0 ? `(${presetNames.length})` : ''}
            </button>
            {showPresets && (
              <div className={`absolute right-0 top-6 z-50 w-52 rounded-lg shadow-xl border ${theme.border} ${theme.card} p-2 space-y-1`}>
                {presetNames.length === 0 ? (
                  <p className={`text-xs ${theme.textMuted} px-2 py-1`}>No saved presets</p>
                ) : (
                  presetNames.map((name) => (
                    <div key={name} className="flex items-center justify-between group">
                      <button
                        type="button"
                        onClick={() => loadPreset(name)}
                        className={`flex-1 text-left text-xs px-2 py-1 rounded ${theme.hover} ${theme.textSecondary} truncate`}
                      >
                        {name}
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePreset(name)}
                        className={`ml-1 text-xs ${theme.textMuted} hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity`}
                        title="Delete preset"
                      >
                        <XIcon />
                      </button>
                    </div>
                  ))
                )}
                {/* Save current keywords as preset */}
                {keywords.length > 0 && (
                  <div className={`pt-1 mt-1 border-t ${theme.border} flex gap-1`}>
                    <input
                      type="text"
                      placeholder="Preset name..."
                      value={presetNameInput}
                      onChange={(e) => setPresetNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && savePreset()}
                      className={`flex-1 text-xs px-2 py-1 rounded ${theme.input} outline-none`}
                    />
                    <button
                      type="button"
                      onClick={savePreset}
                      disabled={!presetNameInput.trim()}
                      className={`text-xs px-2 py-1 rounded ${
                        darkMode
                          ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                          : 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200'
                      } disabled:opacity-40 transition-colors`}
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

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
        <div className="mt-2 px-1 flex flex-wrap items-center gap-3">
          <span className={`text-xs ${theme.textMuted} whitespace-nowrap`}>Color:</span>

          {/* Color wheel */}
          <div className="relative flex-shrink-0">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => applyColor(e.target.value)}
              className="absolute inset-0 opacity-0 w-8 h-8 cursor-pointer"
              tabIndex={-1}
            />
            <div
              className="w-8 h-8 rounded-full border-2 shadow-md cursor-pointer transition-transform hover:scale-110"
              style={{ backgroundColor: selectedColor, borderColor: `${selectedColor}90` }}
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
