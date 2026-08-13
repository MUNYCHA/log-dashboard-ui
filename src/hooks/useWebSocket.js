import { useEffect, useState, useCallback, useRef } from 'react';
import config from '../config';
import { normalizeLogEvent } from '../utils/logUtils';

const FLUSH_INTERVAL_MS = 150;  // batch log state updates — reduces re-renders dramatically
const SIDEBAR_LOG_CAP = 100;
const TOKEN_REFRESH_CHECK_MS = 30000; // how often to push a silently-renewed token to the server
const isValidChannelList = (channels) =>
  Array.isArray(channels) && channels.every((channel) => typeof channel === 'string' && channel.trim() !== '');

/**
 * Connects to a WebSocket server and manages incoming log data.
 *
 * The server sends typed messages:
 *   - { type: "channels", channels: string[] }                   — available channels (on connect)
 *   - { type: "stats", channels: { [c]: { rate, servers } } }   — periodic stats (every ~2s)
 *   - LogEntry or LogEntry[]                                     — log events (after subscribe)
 *
 * Returns:
 *   logsByChannel  - Record<channel, LogEntry[]> — most recent log first
 *   channels       - string[] — known channel names
 *   isConnected    - boolean — live connection status
 *   isReconnecting - boolean — true while waiting to reconnect
 *   logRates       - Record<channel, number> — logs/sec per channel (from server stats)
 *   clearLogs      - (channel: string) => void
 */
export const useWebSocket = (url, viewedChannels, getToken, isAuthenticated = true) => {
  const [logsByChannel, setLogsByChannel] = useState({});
  const [channels, setChannels] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [logRates, setLogRates] = useState({});

  const pendingRef = useRef([]);        // logs waiting for next flush
  const pendingCountRef = useRef({});   // per-channel count in pendingRef — enforces cap
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const socketRef = useRef(null);
  const getTokenRef = useRef(getToken); // stable ref so connect() always uses latest getToken
  const lastSentTokenRef = useRef(null); // last token the server has seen (handshake or refresh)
  const subscribedChannelsRef = useRef(new Set());
  const activeFilterRef = useRef(null); // last filter sent — resend on reconnect
  const viewedChannelsRef = useRef(new Set());
  const nextLogIdRef = useRef(1);
  const lastLogAtRef = useRef({});
  const statsIntervalMsRef = useRef(2000);
  const lastRateAtRef = useRef({});

  // Keep refs in sync so closures inside connect() always see the latest values
  useEffect(() => {
    viewedChannelsRef.current = new Set(viewedChannels.filter(Boolean));
  }, [viewedChannels]);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  // Flush pending logs to state in batches — one React re-render per interval.
  // Groups by channel first so we create ONE new array per channel per flush
  // instead of one array per individual log message.
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingRef.current.length === 0) return;
      const batch = pendingRef.current.splice(0);
      pendingCountRef.current = {}; // reset per-channel counts after flush

      // Group by channel — avoids N intermediate array allocations per channel
      const byChannel = {};
      for (const log of batch) {
        if (!byChannel[log.channel]) byChannel[log.channel] = [];
        byChannel[log.channel].push(log); // oldest first
      }

      setLogsByChannel((prev) => {
        const updated = { ...prev };
        const viewed = viewedChannelsRef.current;
        for (const [channel, newLogs] of Object.entries(byChannel)) {
          const existing = updated[channel] || [];
          // Viewed channels get the large raw buffer (rawBufferPerChannel, 2000 at
          // default) so filtered views can still fill the 500 display cap.
          // Non-viewed channels keep a small cap (100): just enough to show instant
          // backlog when the channel is opened, without wasting memory. (The sidebar
          // reads only `channels` + `logRates` — it does not use these buffers.)
          const cap = viewed.has(channel) ? config.ws.rawBufferPerChannel : SIDEBAR_LOG_CAP;
          // Build the capped, newest-first array in a single pass. The old
          // reverse().concat().slice() allocated two intermediate arrays of up
          // to `cap` elements per active channel every flush (150ms) — pure GC
          // churn. newLogs is oldest-first, so walk it backwards (newest first),
          // then append the existing buffer, stopping once we hit the cap.
          const size = Math.min(newLogs.length + existing.length, cap);
          const merged = new Array(size);
          let i = 0;
          for (let j = newLogs.length - 1; j >= 0 && i < size; j--) merged[i++] = newLogs[j];
          for (let j = 0; j < existing.length && i < size; j++) merged[i++] = existing[j];
          updated[channel] = merged;
        }
        return updated;
      });
    }, FLUSH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      setLogRates((prev) => {
        let changed = false;
        const next = { ...prev };

        for (const [channel, rate] of Object.entries(prev)) {
          if (rate <= 0) continue;
          const lastRateAt = lastRateAtRef.current[channel];
          if (!lastRateAt || now - lastRateAt >= statsIntervalMsRef.current * 2) {
            next[channel] = 0;
            changed = true;
          }
        }

        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // WebSocket with auto-reconnect (exponential backoff, max 30s).
  // Skip until the caller is authenticated — otherwise we'd connect with a
  // null token on the first render (before SSO finishes) and the server
  // would reject auth, leaving a dead socket until a manual page reload.
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;

    async function connect() {
      if (cancelled) return;
      const token = getTokenRef.current ? await getTokenRef.current() : null;
      // Send the JWT via the Sec-WebSocket-Protocol header (subprotocol negotiation)
      // instead of a URL query string — keeps the token out of nginx/proxy access
      // logs, browser history, and HAR exports. Server echoes back 'logstream.v1'.
      const protocols = token ? ['logstream.v1', `bearer.${token}`] : ['logstream.v1'];
      lastSentTokenRef.current = token;
      const socket = new WebSocket(url, protocols);
      socketRef.current = socket;

      socket.onopen = () => {
        if (cancelled) return;
        setIsConnected(true);
        setIsReconnecting(false);
        reconnectAttemptsRef.current = 0;
        // Re-send subscriptions on reconnect
        if (subscribedChannelsRef.current.size > 0) {
          socket.send(JSON.stringify({ action: 'subscribe', channels: [...subscribedChannelsRef.current] }));
        }
        // Re-send active filter on reconnect
        if (activeFilterRef.current) {
          socket.send(JSON.stringify({ action: 'filter', filters: activeFilterRef.current }));
        }
      };

      socket.onclose = () => {
        if (cancelled) return;
        setIsConnected(false);
        setLogRates((prev) => {
          let changed = false;
          const next = {};

          for (const [channel, rate] of Object.entries(prev)) {
            next[channel] = 0;
            if (rate !== 0) changed = true;
          }

          return changed ? next : prev;
        });
        if (reconnectTimerRef.current) return;
        setIsReconnecting(true);
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current += 1;
        reconnectTimerRef.current = setTimeout(() => {
          reconnectTimerRef.current = null;
          connect();
        }, delay);
      };

      socket.onerror = () => {
        // onclose fires next and handles reconnect
      };

      socket.onmessage = (event) => {
        if (cancelled) return;

        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          if (import.meta.env.DEV) console.warn('[ws] unrecognized message:', event.data);
          return; // malformed message — skip silently
        }

        // Typed messages from server
        if (data.type === 'channels') {
          const channelList = isValidChannelList(data.channels) ? data.channels : [];
          setChannels(channelList);
          setLogsByChannel((prev) => {
            const updated = { ...prev };
            channelList.forEach((channel) => {
              if (!updated[channel]) updated[channel] = [];
            });
            return updated;
          });
          return;
        }

        if (data.type === 'stats') {
          if (!data.channels || typeof data.channels !== 'object') return;
          statsIntervalMsRef.current = Number(data.intervalMs) > 0 ? Number(data.intervalMs) : 2000;
          const intervalSec = statsIntervalMsRef.current / 1000;
          const rates = {};
          const now = Date.now();
          for (const [channel, info] of Object.entries(data.channels)) {
            if (!info || typeof info !== 'object') continue;
            const rate = Number(info.rate);
            rates[channel] = Number.isFinite(rate) ? +(rate / intervalSec).toFixed(1) : 0;
            lastRateAtRef.current[channel] = now;
          }
          setLogRates((prev) => ({ ...prev, ...rates }));
          return;
        }

        // Legacy: bare channel array (backwards compat during rollout)
        if (isValidChannelList(data)) {
          setChannels(data);
          setLogsByChannel((prev) => {
            const updated = { ...prev };
            data.forEach((channel) => {
              if (!updated[channel]) updated[channel] = [];
            });
            return updated;
          });
          return;
        }

        // Normalize to array — backend may send single event or batched array
        const events = Array.isArray(data) ? data : [data];

        for (const rawEvent of events) {
          const log = normalizeLogEvent(rawEvent, nextLogIdRef.current++);
          if (!log) continue;
          lastLogAtRef.current[log.channel] = Date.now();

          const channelCount = pendingCountRef.current[log.channel] || 0;
          if (channelCount < config.ws.rawBufferPerChannel) {
            pendingRef.current.push(log);
            pendingCountRef.current[log.channel] = channelCount + 1;
          }
        }
      };
    }

    connect();

    // The server validates the JWT at handshake and closes sessions whose token
    // has lapsed (access tokens only live ~5 min). Whenever silent renew yields a
    // new token, push it over the socket via the `refresh` action so a healthy
    // connection is never cut. getToken() is cached until oidc-client-ts renews,
    // so this sends roughly one tiny message per token lifespan.
    const refreshInterval = setInterval(async () => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      const token = getTokenRef.current ? await getTokenRef.current() : null;
      if (cancelled || !token || token === lastSentTokenRef.current) return;
      lastSentTokenRef.current = token;
      socket.send(JSON.stringify({ action: 'refresh', token }));
    }, TOKEN_REFRESH_CHECK_MS);

    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
      // Close the socket so StrictMode re-mount doesn't leave a stale
      // connection that still receives (and duplicates) server messages.
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [url, isAuthenticated]);

  const clearLogs = useCallback((channel) => {
    // Drain any queued logs for this channel so they don't reappear on the next flush
    pendingRef.current = pendingRef.current.filter((log) => log.channel !== channel);
    pendingCountRef.current[channel] = 0;
    delete lastLogAtRef.current[channel];
    setLogsByChannel((prev) => ({ ...prev, [channel]: [] }));
  }, []);

  const trimChannelBuffer = useCallback((channel, cap = SIDEBAR_LOG_CAP) => {
    if (!channel || cap < 0) return;
    setLogsByChannel((prev) => {
      const existing = prev[channel];
      if (!Array.isArray(existing) || existing.length <= cap) return prev;
      return { ...prev, [channel]: existing.slice(0, cap) };
    });
  }, []);

  const subscribe = useCallback((channelList) => {
    const viewed = new Set(channelList.filter((channel) => typeof channel === 'string' && channel.trim() !== ''));
    subscribedChannelsRef.current = viewed;
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: 'subscribe', channels: [...viewed] }));
    }
  }, []);

  // Per-panel filter storage — in split view both panels may have different
  // filters active. We merge them so the server sends a superset of what
  // either panel needs, then each panel does its own client-side filtering.
  const panelFiltersRef = useRef({});

  const sendFilter = useCallback((filters, panelId) => {
    // Store per-panel
    if (panelId != null) {
      if (filters) {
        panelFiltersRef.current[panelId] = filters;
      } else {
        delete panelFiltersRef.current[panelId];
      }
    }

    const panels = Object.values(panelFiltersRef.current);

    // If no panel has filters, clear server-side filter entirely
    if (panels.length === 0) {
      activeFilterRef.current = null;
      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: 'clear-filters' }));
      }
      return;
    }

    // If only one panel has a filter, send it directly
    if (panels.length === 1) {
      activeFilterRef.current = panels[0];
      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: 'filter', filters: panels[0] }));
      }
      return;
    }

    // Multiple panels with filters — clear server-side filter so both panels
    // receive all logs. Client-side filtering handles each panel independently.
    activeFilterRef.current = null;
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: 'clear-filters' }));
    }
  }, []);

  return { logsByChannel, channels, isConnected, isReconnecting, clearLogs, trimChannelBuffer, logRates, subscribe, sendFilter };
};
