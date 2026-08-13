import { useEffect, useMemo } from 'react';
import { fetchChannelMeta } from '../../../api/logApi';

/**
 * Owns "what servers/paths exist for the selected channel" — fetches all-time
 * metadata from the backend, merges it with the live buffer, derives the
 * effective selectedPath, and auto-clears selections that have disappeared.
 *
 * channelMeta stays in LogPanel's reducer (so RESET_CHANNEL clears it on channel
 * change); this hook reads it and dispatches updates through `dispatch`.
 */
export const useChannelMeta = ({
  selectedChannel,
  channelLogs,
  selectedServer,
  selectedPathForChannel,
  channelMeta,
  onServerSelect,
  getToken,
  dispatch,
}) => {
  useEffect(() => {
    if (!selectedChannel) return;
    const controller = new AbortController();
    fetchChannelMeta(selectedChannel, controller.signal, getToken)
      .then((data) => { if (data) dispatch({ type: 'PATCH', payload: { channelMeta: data } }); })
      .catch(() => {});
    return () => controller.abort();
  }, [selectedChannel, getToken, dispatch]);

  const serversForSelectedChannel = useMemo(
    () => selectedChannel ? [...new Set(channelLogs?.map((l) => l.serverName) || [])].sort() : [],
    [selectedChannel, channelLogs],
  );

  const pathsForSelectedServer = useMemo(() => {
    if (!selectedChannel || !channelLogs) return [];
    let logs = channelLogs;
    if (selectedServer) logs = logs.filter((l) => l.serverName === selectedServer);
    return [...new Set(logs.map((l) => l.path))].sort();
  }, [selectedChannel, channelLogs, selectedServer]);

  // Merge backend meta (all-time) with buffer (recently seen) — meta order preserved,
  // buffer-only servers appended at the end for brand-new servers not yet in meta.
  const mergedServers = useMemo(() => {
    const metaNames = channelMeta?.servers?.map((s) => s.name) ?? [];
    const metaSet = new Set(metaNames);
    const bufferOnly = serversForSelectedChannel.filter((s) => !metaSet.has(s));
    return [...metaNames, ...bufferOnly];
  }, [channelMeta, serversForSelectedChannel]);

  const mergedPaths = useMemo(() => {
    const serverMeta = selectedServer
      ? channelMeta?.servers?.find((s) => s.name === selectedServer)
      : null;
    const metaPaths = serverMeta?.paths?.map((p) => p.path) ?? [];
    const metaSet = new Set(metaPaths);
    const bufferOnly = pathsForSelectedServer.filter((p) => !metaSet.has(p));
    return [...metaPaths, ...bufferOnly];
  }, [channelMeta, selectedServer, pathsForSelectedServer]);

  const selectedPath = selectedPathForChannel && (
    mergedPaths.includes(selectedPathForChannel) || pathsForSelectedServer.includes(selectedPathForChannel)
  ) ? selectedPathForChannel : null;

  // Auto-clear selected server if it's gone from both meta and buffer.
  // Guard on mergedServers.length so we don't clear before meta has loaded.
  useEffect(() => {
    if (selectedServer && mergedServers.length > 0 && !mergedServers.includes(selectedServer)) {
      onServerSelect(null);
    }
  }, [selectedServer, mergedServers, onServerSelect]);

  useEffect(() => {
    if (selectedPathForChannel && mergedPaths.length > 0 && !mergedPaths.includes(selectedPathForChannel)) {
      dispatch({ type: 'PATCH', payload: { pathForChannel: { channel: selectedChannel, path: null } } });
    }
  }, [selectedPathForChannel, mergedPaths, selectedChannel, dispatch]);

  return { mergedServers, mergedPaths, selectedPath };
};
