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
  const btnBase = "p-1.5 rounded-md transition-colors";
  const btnIdle = darkMode
    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100";
  return {
    pause:    `${btnBase} ${btnIdle}`,
    paused:   `${btnBase} ${darkMode ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`,
    export:   `${btnBase} ${btnIdle}`,
    scroll:   `${btnBase} ${btnIdle}`,
    scrollOn: `${btnBase} ${darkMode ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`,
    split:    `${btnBase} ${btnIdle}`,
    splitOn:  `${btnBase} ${darkMode ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`,
    close:    `${btnBase} ${darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`,
    clear:    `${btnBase} ${darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`,
  };
};

export const getAccentStyles = (darkMode) => ({
  active: darkMode ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-700",
  paused: darkMode ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600",
});
