import { useMemo, useEffect } from 'react';
import config from '../config';

const PRESET_MS = { '1m': 60000, '5m': 300000, '15m': 900000, '1h': 3600000 };

const useFilteredLogs = ({
  selectedTopic,
  topicLogs,
  selectedServer,
  onServerSelect,
  topicMeta,
  serverSearchTerm,
  pathSearchTerm,
  pathForTopic,
  logSearchTerm,
  keywords,
  debouncedKeywordInput,
  keywordMode,
  timeRange,
  customRangeMs,
  nowMs,
  dispatch,
}) => {
  const selectedPathForTopic = pathForTopic.topic === selectedTopic ? pathForTopic.path : null;

  const serversForSelectedTopic = useMemo(
    () => selectedTopic ? [...new Set(topicLogs?.map((l) => l.serverName) || [])].sort() : [],
    [selectedTopic, topicLogs],
  );

  const pathsForSelectedServer = useMemo(() => {
    if (!selectedTopic || !topicLogs) return [];
    let logs = topicLogs;
    if (selectedServer) logs = logs.filter((l) => l.serverName === selectedServer);
    return [...new Set(logs.map((l) => l.path))].sort();
  }, [selectedTopic, topicLogs, selectedServer]);

  // Merge backend meta (all-time) with buffer (recently seen) — meta order preserved,
  // buffer-only servers/paths appended at the end.
  const mergedServers = useMemo(() => {
    const metaNames = topicMeta?.servers?.map((s) => s.name) ?? [];
    const metaSet = new Set(metaNames);
    const bufferOnly = serversForSelectedTopic.filter((s) => !metaSet.has(s));
    return [...metaNames, ...bufferOnly];
  }, [topicMeta, serversForSelectedTopic]);

  const mergedPaths = useMemo(() => {
    const serverMeta = selectedServer
      ? topicMeta?.servers?.find((s) => s.name === selectedServer)
      : null;
    const metaPaths = serverMeta?.paths?.map((p) => p.path) ?? [];
    const metaSet = new Set(metaPaths);
    const bufferOnly = pathsForSelectedServer.filter((p) => !metaSet.has(p));
    return [...metaPaths, ...bufferOnly];
  }, [topicMeta, selectedServer, pathsForSelectedServer]);

  const selectedPath = selectedPathForTopic && (
    mergedPaths.includes(selectedPathForTopic) || pathsForSelectedServer.includes(selectedPathForTopic)
  ) ? selectedPathForTopic : null;

  // Auto-clear server if it disappears from both meta and buffer
  useEffect(() => {
    if (selectedServer && mergedServers.length > 0 && !mergedServers.includes(selectedServer)) {
      onServerSelect(null);
    }
  }, [selectedServer, mergedServers, onServerSelect]);

  // Auto-clear path if it disappears from both meta and buffer
  useEffect(() => {
    if (selectedPathForTopic && mergedPaths.length > 0 && !mergedPaths.includes(selectedPathForTopic)) {
      dispatch({ type: 'PATCH', payload: { pathForTopic: { topic: selectedTopic, path: null } } });
    }
  }, [selectedPathForTopic, mergedPaths, selectedTopic, dispatch]);

  const filteredServers = useMemo(
    () => mergedServers.filter((s) => s.toLowerCase().includes(serverSearchTerm.toLowerCase())),
    [mergedServers, serverSearchTerm],
  );

  const filteredPaths = useMemo(
    () => mergedPaths.filter((p) => p.toLowerCase().includes(pathSearchTerm.toLowerCase())),
    [mergedPaths, pathSearchTerm],
  );

  const filteredLogs = useMemo(() => {
    if (!selectedTopic || !topicLogs) return [];
    let logs = topicLogs;

    if (selectedServer) logs = logs.filter((l) => l.serverName === selectedServer);
    if (selectedPath) logs = logs.filter((l) => l.path === selectedPath);

    if (logSearchTerm) {
      const lower = logSearchTerm.toLowerCase();
      logs = logs.filter((l) => String(l.message ?? '').toLowerCase().includes(lower));
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

  return { filteredLogs, mergedServers, mergedPaths, filteredServers, filteredPaths, selectedPath };
};

export default useFilteredLogs;
