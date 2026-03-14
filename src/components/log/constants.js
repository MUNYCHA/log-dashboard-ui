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
  const btnBase = "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors";
  const btnIdle = darkMode
    ? "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"
    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100";
  const btnActive = darkMode
    ? "text-white bg-[#1a1a1a]"
    : "text-gray-900 bg-gray-100";
  return {
    pause:    `${btnBase} ${btnIdle}`,
    paused:   `${btnBase} ${btnActive}`,
    export:   `${btnBase} ${btnIdle}`,
    scroll:   `${btnBase} ${btnIdle}`,
    scrollOn: `${btnBase} ${btnActive}`,
    split:    `${btnBase} ${btnIdle}`,
    splitOn:  `${btnBase} ${btnActive}`,
    close:    `${btnBase} ${btnIdle}`,
    clear:    `${btnBase} ${btnIdle}`,
  };
};

export const getAccentStyles = (darkMode) => ({
  active: darkMode ? "border border-[#282828] bg-[#1a1a1a] text-white" : "border border-gray-200 bg-gray-100 text-gray-900",
  paused: darkMode ? "border border-[#282828] bg-[#1a1a1a] text-white" : "border border-gray-200 bg-gray-100 text-gray-900",
});
