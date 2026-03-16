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
  const base = `inline-flex h-10 w-10 items-center justify-center rounded-xl
      transition-all duration-150 ease-in-out active:scale-95`;

  const ghost = darkMode
    ? `text-[#CAC4BC] hover:text-[#E8E2DC] hover:bg-[#2E2B28]`
    : `text-[#4A4540] hover:text-[#1C1B1A] hover:bg-[#EEE8E2]`;

  const ghostActive = darkMode
    ? `text-[#A8C7FA] hover:bg-[#0842A0]/20`
    : `text-[#0B57D0] hover:bg-[#D3E3FD]/70`;

  const ghostDanger = darkMode
    ? `text-[#CAC4BC] hover:text-[#F28B82] hover:bg-[#4A2A2A]`
    : `text-[#4A4540] hover:text-[#C5221F] hover:bg-[#FCE8E6]`;

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
  active: darkMode ? "border border-[#A8C7FA]/40 bg-[#0842A0]/30 text-[#A8C7FA]" : "border border-[#A8C7FA] bg-[#D3E3FD] text-[#0B57D0]",
  paused: darkMode ? "border border-[#A8C7FA]/40 bg-[#0842A0]/30 text-[#A8C7FA]" : "border border-[#A8C7FA] bg-[#D3E3FD] text-[#0B57D0]",
});
