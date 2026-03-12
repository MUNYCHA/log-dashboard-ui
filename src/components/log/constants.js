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
  const btnBase = "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors";
  const btnIdle = darkMode
    ? "border-gray-800 bg-black/20 text-gray-400 hover:bg-gray-900 hover:text-gray-200"
    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700";
  return {
    pause:    `${btnBase} ${btnIdle}`,
    paused:   `${btnBase} ${darkMode ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15' : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'}`,
    export:   `${btnBase} ${btnIdle}`,
    scroll:   `${btnBase} ${btnIdle}`,
    scrollOn: `${btnBase} ${darkMode ? 'border-blue-500/25 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15' : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'}`,
    split:    `${btnBase} ${btnIdle}`,
    splitOn:  `${btnBase} ${darkMode ? 'border-blue-500/25 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15' : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'}`,
    close:    `${btnBase} ${darkMode ? 'border-gray-800 bg-black/20 text-gray-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300' : 'border-gray-200 bg-white text-gray-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700'}`,
    clear:    `${btnBase} ${darkMode ? 'border-gray-800 bg-black/20 text-gray-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300' : 'border-gray-200 bg-white text-gray-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700'}`,
  };
};

export const getAccentStyles = (darkMode) => ({
  active: darkMode ? "border border-blue-500/25 bg-blue-500/10 text-blue-300" : "border border-blue-200 bg-blue-50 text-blue-700",
  paused: darkMode ? "border border-amber-500/30 bg-amber-500/10 text-amber-300" : "border border-amber-200 bg-amber-50 text-amber-700",
});
