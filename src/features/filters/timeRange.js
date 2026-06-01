export const formatDurationMs = (ms) => {
  if (!ms) return '';
  if (ms % 3600000 === 0) return `${ms / 3600000}h`;
  if (ms % 60000  === 0) return `${ms / 60000}m`;
  if (ms % 1000   === 0) return `${ms / 1000}s`;
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(1)}h`;
  if (ms >= 60000)   return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 1000).toFixed(1)}s`;
};
