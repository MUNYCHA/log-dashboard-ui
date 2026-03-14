export const TIME_RANGES = [
  { label: 'All', value: 'all' },
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
];

export const TIME_RANGE_MS = { '1m': 60000, '5m': 300000, '15m': 900000, '1h': 3600000 };

export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const getShortPath = (path) => {
  if (!path) return path;
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 2) return path;
  return `\u2026/${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
};

export const getButtonStyles = (darkMode) => {
  const base = `inline-flex h-8 w-8 items-center justify-center rounded-md border
      transition-all duration-150 ease-in-out active:scale-95`;

  const idle = darkMode
    ? `bg-[#1a1a1a] border-[#2e2e2e] text-[#a3a3a3]
         hover:bg-[#242424] hover:text-[#fafafa] hover:border-[#3a3a3a]`
    : `bg-white border-[#e5e5e5] text-[#525252]
         hover:bg-[#f0f0f0] hover:text-[#0a0a0a] hover:border-[#d4d4d4]`;

  const active = darkMode
    ? `bg-[#fafafa] border-[#fafafa] text-[#0a0a0a]
         hover:bg-[#e5e5e5] hover:border-[#e5e5e5]`
    : `bg-[#0a0a0a] border-[#0a0a0a] text-[#fafafa]
         hover:bg-[#242424] hover:border-[#242424]`;

  const danger = darkMode
    ? `bg-[#1a1a1a] border-[#2e2e2e] text-[#a3a3a3]
         hover:bg-[#2a1515] hover:text-[#f87171] hover:border-[#7f1d1d]`
    : `bg-white border-[#e5e5e5] text-[#525252]
         hover:bg-[#fff5f5] hover:text-[#dc2626] hover:border-[#fca5a5]`;

  return {
    pause:    `${base} ${idle}`,
    paused:   `${base} ${active}`,
    export:   `${base} ${idle}`,
    scroll:   `${base} ${idle}`,
    scrollOn: `${base} ${active}`,
    split:    `${base} ${idle}`,
    splitOn:  `${base} ${active}`,
    close:    `${base} ${idle}`,
    clear:    `${base} ${danger}`,
  };
};

export const getAccentStyles = (darkMode) => ({
  active: darkMode ? "border border-[#282828] bg-[#1a1a1a] text-white" : "border border-gray-200 bg-gray-100 text-gray-900",
  paused: darkMode ? "border border-[#282828] bg-[#1a1a1a] text-white" : "border border-gray-200 bg-gray-100 text-gray-900",
});
