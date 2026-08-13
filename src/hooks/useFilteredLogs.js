import { useMemo } from 'react';
import config from '../config';

export function useFilteredLogs({
  selectedChannel, channelLogs, selectedServer, selectedPath,
  logSearchTerm, keywords, debouncedKeywordInput, keywordMode,
  timeRange, customRangeMs, nowMs,
}) {
  // nowMs ticks every 5s, but it only affects the result when a time filter is
  // active. Collapse it to a constant otherwise so the default ('all') view
  // doesn't re-filter the whole buffer on every tick.
  const effectiveNow = timeRange === 'all' ? 0 : nowMs;
  return useMemo(() => {
    if (!selectedChannel || !channelLogs) return [];

    // Precompute predicate inputs once, outside the loop.
    const lowerSearch = logSearchTerm ? logSearchTerm.toLowerCase() : null;
    const pendingKw = debouncedKeywordInput.trim().toLowerCase();
    const allTerms = [
      ...keywords.map((k) => k.text.toLowerCase()),
      ...(pendingKw ? [pendingKw] : []),
    ];
    const hasTerms = allTerms.length > 0;
    const isAndMode = keywordMode === 'and';
    const needsMessage = lowerSearch !== null || hasTerms;

    let cutoff = -Infinity;
    if (timeRange !== 'all') {
      const PRESET_MS = { '1m': 60000, '5m': 300000, '15m': 900000, '1h': 3600000 };
      const rangeMs = timeRange === 'custom' ? customRangeMs : (PRESET_MS[timeRange] || 0);
      if (rangeMs > 0) cutoff = effectiveNow - rangeMs;
    }

    // Single pass over the newest-first buffer. We collect the newest matches
    // and stop at the display cap, so this often scans far fewer than all logs.
    // Each message is lowercased at most once (search + keywords share it), and
    // no intermediate arrays are allocated — both matter on the 150ms hot path.
    const cap = config.ws.maxLogsPerChannel;
    const result = [];
    for (let i = 0; i < channelLogs.length && result.length < cap; i++) {
      const l = channelLogs[i];
      if (selectedServer && l.serverName !== selectedServer) continue;
      if (selectedPath && l.path !== selectedPath) continue;
      if (cutoff !== -Infinity && !(Number.isFinite(l._ts) && l._ts >= cutoff)) continue;

      if (needsMessage) {
        const haystack = String(l.message ?? '').toLowerCase();
        if (lowerSearch !== null && !haystack.includes(lowerSearch)) continue;
        if (hasTerms) {
          const ok = isAndMode
            ? allTerms.every((t) => haystack.includes(t))
            : allTerms.some((t) => haystack.includes(t));
          if (!ok) continue;
        }
      }

      result.push(l);
    }

    // Collected newest-first; reverse in place to oldest-first for display.
    result.reverse();
    return result;
  }, [selectedChannel, channelLogs, selectedServer, selectedPath, logSearchTerm, keywords, debouncedKeywordInput, keywordMode, timeRange, customRangeMs, effectiveNow]);
}
