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
  const btnBase = "p-1.5 rounded-lg transition-all duration-150 hover:scale-110 active:scale-95";
  const btnIdle = darkMode
    ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:shadow-lg"
    : "bg-white shadow-md text-gray-500 hover:shadow-lg";
  return {
    pause:    darkMode ? `${btnBase} ${btnIdle} hover:text-amber-400   hover:shadow-amber-400/20`   : `${btnBase} ${btnIdle} hover:bg-amber-50   hover:text-amber-500   hover:shadow-amber-200`,
    paused:   darkMode ? `${btnBase} bg-amber-500/20  text-amber-400  hover:bg-amber-500/30  hover:shadow-lg hover:shadow-amber-400/20`  : `${btnBase} bg-amber-500/20  text-amber-600  hover:bg-amber-500/30  hover:shadow-lg hover:shadow-amber-200`,
    export:   darkMode ? `${btnBase} ${btnIdle} hover:text-emerald-400 hover:shadow-emerald-400/20` : `${btnBase} ${btnIdle} hover:bg-emerald-50 hover:text-emerald-500 hover:shadow-emerald-200`,
    scroll:   darkMode ? `${btnBase} ${btnIdle} hover:text-sky-400     hover:shadow-sky-400/20`     : `${btnBase} ${btnIdle} hover:bg-sky-50     hover:text-sky-500     hover:shadow-sky-200`,
    scrollOn: darkMode ? `${btnBase} bg-green-500/20  text-green-400  hover:bg-green-500/30  hover:shadow-lg hover:shadow-green-400/20`  : `${btnBase} bg-indigo-500/20 text-indigo-600 hover:bg-indigo-500/30 hover:shadow-lg hover:shadow-indigo-200`,
    split:    darkMode ? `${btnBase} ${btnIdle} hover:text-violet-400  hover:shadow-violet-400/20`  : `${btnBase} ${btnIdle} hover:bg-violet-50  hover:text-violet-500  hover:shadow-violet-200`,
    splitOn:  darkMode ? `${btnBase} bg-green-500/20  text-green-400  hover:bg-green-500/30  hover:shadow-lg hover:shadow-green-400/20`  : `${btnBase} bg-indigo-500/20 text-indigo-600 hover:bg-indigo-500/30 hover:shadow-lg hover:shadow-indigo-200`,
    close:    darkMode ? `${btnBase} ${btnIdle} hover:text-red-400     hover:shadow-red-400/20`     : `${btnBase} ${btnIdle} hover:bg-red-50     hover:text-red-500     hover:shadow-red-200`,
    clear:    darkMode ? `${btnBase} ${btnIdle} hover:text-red-400     hover:shadow-red-400/20`     : `${btnBase} ${btnIdle} hover:bg-red-50     hover:text-red-500     hover:shadow-red-200`,
  };
};

export const getAccentStyles = (darkMode) => ({
  active: darkMode ? "bg-green-500/20 text-green-400" : "bg-indigo-500/20 text-indigo-600",
  paused: darkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-500/20 text-amber-600",
});
