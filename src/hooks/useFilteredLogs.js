import { useMemo } from 'react';
import config from '../config';

export function useFilteredLogs({
  selectedTopic, topicLogs, selectedServer, selectedPath,
  logSearchTerm, keywords, debouncedKeywordInput, keywordMode,
  timeRange, customRangeMs, nowMs,
}) {
  return useMemo(() => {
    if (!selectedTopic || !topicLogs) return [];
    let logs = topicLogs;

    if (selectedServer) logs = logs.filter((l) => l.serverName === selectedServer);
    if (selectedPath) logs = logs.filter((l) => l.path === selectedPath);

    if (logSearchTerm) {
      const lower = logSearchTerm.toLowerCase();
      logs = logs.filter((l) =>
        String(l.message ?? '').toLowerCase().includes(lower)
      );
    }

    const pendingKw = debouncedKeywordInput.trim().toLowerCase();
    const allTerms = [
      ...keywords.map((k) => k.text.toLowerCase()),
      ...(pendingKw ? [pendingKw] : []),
    ];
    if (allTerms.length > 0) {
      logs = logs.filter((l) => {
        const haystack = String(l.message ?? '').toLowerCase();
        return keywordMode === 'and'
          ? allTerms.every((t) => haystack.includes(t))
          : allTerms.some((t) => haystack.includes(t));
      });
    }

    if (timeRange !== 'all') {
      const PRESET_MS = { '1m': 60000, '5m': 300000, '15m': 900000, '1h': 3600000 };
      const rangeMs = timeRange === 'custom' ? customRangeMs : (PRESET_MS[timeRange] || 0);
      if (rangeMs > 0) {
        const cutoff = nowMs - rangeMs;
        logs = logs.filter((l) => {
          const ts = new Date(l.timestamp).getTime();
          return Number.isFinite(ts) && ts >= cutoff;
        });
      }
    }

    return [...logs].slice(0, config.ws.maxLogsPerTopic).reverse();
  }, [selectedTopic, topicLogs, selectedServer, selectedPath, logSearchTerm, keywords, debouncedKeywordInput, keywordMode, timeRange, customRangeMs, nowMs]);
}
