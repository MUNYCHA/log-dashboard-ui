export const TIME_RANGES = [
  { label: 'All', value: 'all' },
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
];

export const TIME_RANGE_MS = { '1m': 60000, '5m': 300000, '15m': 900000, '1h': 3600000 };

export const formatDurationMs = (ms) => {
  if (!ms) return '';
  if (ms % 3600000 === 0) return `${ms / 3600000}h`;
  if (ms % 60000  === 0) return `${ms / 60000}m`;
  if (ms % 1000   === 0) return `${ms / 1000}s`;
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(1)}h`;
  if (ms >= 60000)   return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 1000).toFixed(1)}s`;
};

export const getShortPath = (path) => {
  if (!path) return path;
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 2) return path;
  return `\u2026/${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
};

export const getButtonStyles = (darkMode) => {
  const base = `inline-flex h-10 w-10 items-center justify-center rounded-xl
      transition-all duration-150 ease-in-out active:scale-95`;

  const ghost = darkMode
    ? `text-[#BDC1C6] hover:text-[#E8EAED] hover:bg-[#303134]`
    : `text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4]`;

  const ghostActive = darkMode
    ? `text-[#8AB4F8] bg-[#1A73E8]/15 hover:bg-[#1A73E8]/25`
    : `text-[#1A73E8] bg-[#E8F0FE] hover:bg-[#D2E3FC]`;

  const ghostDanger = darkMode
    ? `text-[#BDC1C6] hover:text-[#F28B82] hover:bg-[#3C1F1F]`
    : `text-[#5F6368] hover:text-[#C5221F] hover:bg-[#FCE8E6]`;

  return {
    pause:    `${base} ${ghost}`,
    paused:   `${base} ${ghostActive}`,
    export:   `${base} ${ghost}`,
    scroll:   `${base} ${ghost}`,
    scrollOn: `${base} ${ghostActive}`,
    split:    `${base} ${ghost}`,
    splitOn:  `${base} ${ghostActive}`,
    close:    `${base} ${ghost}`,
    clear:    `${base} ${ghostDanger}`,
  };
};

export const getAccentStyles = (darkMode) => ({
  active: darkMode ? "border border-[#8AB4F8]/40 bg-[#1A3A6B]/50 text-[#8AB4F8]" : "border border-[#D2E3FC] bg-[#E8F0FE] text-[#1A73E8]",
  paused: darkMode ? "border border-[#8AB4F8]/40 bg-[#1A3A6B]/50 text-[#8AB4F8]" : "border border-[#D2E3FC] bg-[#E8F0FE] text-[#1A73E8]",
});
