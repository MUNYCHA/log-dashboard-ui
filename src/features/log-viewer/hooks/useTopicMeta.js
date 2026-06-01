import { useEffect, useMemo } from 'react';
import { fetchTopicMeta } from '../../../api/logApi';

/**
 * Owns "what servers/paths exist for the selected topic" — fetches all-time
 * metadata from the backend, merges it with the live buffer, derives the
 * effective selectedPath, and auto-clears selections that have disappeared.
 *
 * topicMeta stays in LogPanel's reducer (so RESET_TOPIC clears it on topic
 * change); this hook reads it and dispatches updates through `dispatch`.
 */
export const useTopicMeta = ({
  selectedTopic,
  topicLogs,
  selectedServer,
  selectedPathForTopic,
  topicMeta,
  onServerSelect,
  getToken,
  dispatch,
}) => {
  useEffect(() => {
    if (!selectedTopic) return;
    const controller = new AbortController();
    fetchTopicMeta(selectedTopic, controller.signal, getToken)
      .then((data) => { if (data) dispatch({ type: 'PATCH', payload: { topicMeta: data } }); })
      .catch(() => {});
    return () => controller.abort();
  }, [selectedTopic, getToken, dispatch]);

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
  // buffer-only servers appended at the end for brand-new servers not yet in meta.
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

  // Auto-clear selected server if it's gone from both meta and buffer.
  // Guard on mergedServers.length so we don't clear before meta has loaded.
  useEffect(() => {
    if (selectedServer && mergedServers.length > 0 && !mergedServers.includes(selectedServer)) {
      onServerSelect(null);
    }
  }, [selectedServer, mergedServers, onServerSelect]);

  useEffect(() => {
    if (selectedPathForTopic && mergedPaths.length > 0 && !mergedPaths.includes(selectedPathForTopic)) {
      dispatch({ type: 'PATCH', payload: { pathForTopic: { topic: selectedTopic, path: null } } });
    }
  }, [selectedPathForTopic, mergedPaths, selectedTopic, dispatch]);

  return { mergedServers, mergedPaths, selectedPath };
};
