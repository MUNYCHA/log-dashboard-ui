/**
 * Preset color palette for keyword highlighting.
 * All Tailwind classes are written in full so JIT can detect them.
 */
export const KEYWORD_COLORS = [
  {
    name: 'red',
    swatch:         'bg-red-500',
    chipDark:       'bg-red-500/15 text-red-400 border-red-500/30',
    chipLight:      'bg-red-500/10 text-red-600 border-red-400/40',
    highlightDark:  'bg-red-500/30 text-red-200',
    highlightLight: 'bg-red-100 text-red-700',
  },
  {
    name: 'orange',
    swatch:         'bg-orange-500',
    chipDark:       'bg-orange-500/15 text-orange-400 border-orange-500/30',
    chipLight:      'bg-orange-500/10 text-orange-600 border-orange-400/40',
    highlightDark:  'bg-orange-500/30 text-orange-200',
    highlightLight: 'bg-orange-100 text-orange-700',
  },
  {
    name: 'yellow',
    swatch:         'bg-yellow-500',
    chipDark:       'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    chipLight:      'bg-yellow-500/10 text-yellow-600 border-yellow-400/40',
    highlightDark:  'bg-yellow-500/30 text-yellow-200',
    highlightLight: 'bg-yellow-100 text-yellow-700',
  },
  {
    name: 'green',
    swatch:         'bg-green-500',
    chipDark:       'bg-green-500/15 text-green-400 border-green-500/30',
    chipLight:      'bg-green-500/10 text-green-600 border-green-400/40',
    highlightDark:  'bg-green-500/30 text-green-200',
    highlightLight: 'bg-green-100 text-green-700',
  },
  {
    name: 'cyan',
    swatch:         'bg-cyan-500',
    chipDark:       'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    chipLight:      'bg-cyan-500/10 text-cyan-600 border-cyan-400/40',
    highlightDark:  'bg-cyan-500/30 text-cyan-200',
    highlightLight: 'bg-cyan-100 text-cyan-700',
  },
  {
    name: 'blue',
    swatch:         'bg-blue-500',
    chipDark:       'bg-blue-500/15 text-blue-400 border-blue-500/30',
    chipLight:      'bg-blue-500/10 text-blue-600 border-blue-400/40',
    highlightDark:  'bg-blue-500/30 text-blue-200',
    highlightLight: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'purple',
    swatch:         'bg-purple-500',
    chipDark:       'bg-purple-500/15 text-purple-400 border-purple-500/30',
    chipLight:      'bg-purple-500/10 text-purple-600 border-purple-400/40',
    highlightDark:  'bg-purple-500/30 text-purple-200',
    highlightLight: 'bg-purple-100 text-purple-700',
  },
  {
    name: 'pink',
    swatch:         'bg-pink-500',
    chipDark:       'bg-pink-500/15 text-pink-400 border-pink-500/30',
    chipLight:      'bg-pink-500/10 text-pink-600 border-pink-400/40',
    highlightDark:  'bg-pink-500/30 text-pink-200',
    highlightLight: 'bg-pink-100 text-pink-700',
  },
];

export const DEFAULT_KEYWORD_COLOR = 'cyan';

export const getColorDef = (name) =>
  KEYWORD_COLORS.find((c) => c.name === name) ??
  KEYWORD_COLORS.find((c) => c.name === DEFAULT_KEYWORD_COLOR);
