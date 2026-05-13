import { useEffect, useState, useCallback, useRef } from 'react';
import config from '../config';
import { normalizeLogEvent } from '../utils/logUtils';

const FLUSH_INTERVAL_MS = 150;  // batch log state updates — reduces re-renders dramatically
const SIDEBAR_LOG_CAP = 100;
const isValidTopicList = (topics) =>
  Array.isArray(topics) && topics.every((topic) => typeof topic === 'string' && topic.trim() !== '');

/**
 * Connects to a WebSocket server and manages incoming log data.
 *
 * The server sends typed messages:
 *   - { type: "topics", topics: string[] }                    — available topics (on connect)
 *   - { type: "stats", topics: { [t]: { rate, servers } } }  — periodic stats (every ~2s)
 *   - LogEntry or LogEntry[]                                  — log events (after subscribe)
 *
 * Returns:
 *   logsByTopic   - Record<topic, LogEntry[]> — most recent log first
 *   topics        - string[] — known topic names
 *   isConnected   - boolean — live connection status
 *   isReconnecting - boolean — true while waiting to reconnect
 *   logRates      - Record<topic, number> — logs/sec per topic (from server stats)
 *   clearLogs     - (topic: string) => void
 */
export const useWebSocket = (url, viewedTopics, getToken) => {
  const [logsByTopic, setLogsByTopic] = useState({});
  const [topics, setTopics] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [logRates, setLogRates] = useState({});

  const pendingRef = useRef([]);        // logs waiting for next flush
  const pendingCountRef = useRef({});   // per-topic count in pendingRef — enforces cap
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const socketRef = useRef(null);
  const getTokenRef = useRef(getToken); // stable ref so connect() always uses latest getToken
  const subscribedTopicsRef = useRef(new Set());
  const activeFilterRef = useRef(null); // last filter sent — resend on reconnect
  const viewedTopicsRef = useRef(new Set());
  const nextLogIdRef = useRef(1);
  const lastLogAtRef = useRef({});
  const statsIntervalMsRef = useRef(2000);
  const lastRateAtRef = useRef({});

  // Keep refs in sync so closures inside connect() always see the latest values
  useEffect(() => {
    viewedTopicsRef.current = new Set(viewedTopics.filter(Boolean));
  }, [viewedTopics]);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  // Flush pending logs to state in batches — one React re-render per interval.
  // Groups by topic first so we create ONE new array per topic per flush
  // instead of one array per individual log message.
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingRef.current.length === 0) return;
      const batch = pendingRef.current.splice(0);
      pendingCountRef.current = {}; // reset per-topic counts after flush

      // Group by topic — avoids N intermediate array allocations per topic
      const byTopic = {};
      for (const log of batch) {
        if (!byTopic[log.topic]) byTopic[log.topic] = [];
        byTopic[log.topic].push(log); // oldest first
      }

      setLogsByTopic((prev) => {
        const updated = { ...prev };
        const viewed = viewedTopicsRef.current;
        for (const [topic, newLogs] of Object.entries(byTopic)) {
          const existing = updated[topic] || [];
          // Viewed topics get the full cap (500) for the log panel.
          // Non-viewed topics keep a small cap (100) — enough for sidebar
          // (last log, server badges, count) without wasting memory.
          const cap = viewed.has(topic) ? config.ws.rawBufferPerTopic : SIDEBAR_LOG_CAP;
          updated[topic] = newLogs.reverse().concat(existing).slice(0, cap);
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

        for (const [topic, rate] of Object.entries(prev)) {
          if (rate <= 0) continue;
          const lastRateAt = lastRateAtRef.current[topic];
          if (!lastRateAt || now - lastRateAt >= statsIntervalMsRef.current * 2) {
            next[topic] = 0;
            changed = true;
          }
        }

        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // WebSocket with auto-reconnect (exponential backoff, max 30s)
  useEffect(() => {
    let cancelled = false;

    async function connect() {
      if (cancelled) return;
      const token = getTokenRef.current ? await getTokenRef.current() : null;
      const wsUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (cancelled) return;
        setIsConnected(true);
        setIsReconnecting(false);
        reconnectAttemptsRef.current = 0;
        // Re-send subscriptions on reconnect
        if (subscribedTopicsRef.current.size > 0) {
          socket.send(JSON.stringify({ action: 'subscribe', topics: [...subscribedTopicsRef.current] }));
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

          for (const [topic, rate] of Object.entries(prev)) {
            next[topic] = 0;
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
        if (data.type === 'topics') {
          const topicList = isValidTopicList(data.topics) ? data.topics : [];
          setTopics(topicList);
          setLogsByTopic((prev) => {
            const updated = { ...prev };
            topicList.forEach((topic) => {
              if (!updated[topic]) updated[topic] = [];
            });
            return updated;
          });
          return;
        }

        if (data.type === 'stats') {
          if (!data.topics || typeof data.topics !== 'object') return;
          statsIntervalMsRef.current = Number(data.intervalMs) > 0 ? Number(data.intervalMs) : 2000;
          const intervalSec = statsIntervalMsRef.current / 1000;
          const rates = {};
          const now = Date.now();
          for (const [topic, info] of Object.entries(data.topics)) {
            if (!info || typeof info !== 'object') continue;
            const rate = Number(info.rate);
            rates[topic] = Number.isFinite(rate) ? +(rate / intervalSec).toFixed(1) : 0;
            lastRateAtRef.current[topic] = now;
          }
          setLogRates((prev) => ({ ...prev, ...rates }));
          return;
        }

        // Legacy: bare topic array (backwards compat during rollout)
        if (isValidTopicList(data)) {
          setTopics(data);
          setLogsByTopic((prev) => {
            const updated = { ...prev };
            data.forEach((topic) => {
              if (!updated[topic]) updated[topic] = [];
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
          lastLogAtRef.current[log.topic] = Date.now();

          const topicCount = pendingCountRef.current[log.topic] || 0;
          if (topicCount < config.ws.rawBufferPerTopic) {
            pendingRef.current.push(log);
            pendingCountRef.current[log.topic] = topicCount + 1;
          }
        }
      };
    }

    connect();

    return () => {
      cancelled = true;
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
  }, [url]);

  const clearLogs = useCallback((topic) => {
    // Drain any queued logs for this topic so they don't reappear on the next flush
    pendingRef.current = pendingRef.current.filter((log) => log.topic !== topic);
    pendingCountRef.current[topic] = 0;
    delete lastLogAtRef.current[topic];
    setLogsByTopic((prev) => ({ ...prev, [topic]: [] }));
  }, []);

  const trimTopicBuffer = useCallback((topic, cap = SIDEBAR_LOG_CAP) => {
    if (!topic || cap < 0) return;
    setLogsByTopic((prev) => {
      const existing = prev[topic];
      if (!Array.isArray(existing) || existing.length <= cap) return prev;
      return { ...prev, [topic]: existing.slice(0, cap) };
    });
  }, []);

  const subscribe = useCallback((topicList) => {
    const viewed = new Set(topicList.filter((topic) => typeof topic === 'string' && topic.trim() !== ''));
    subscribedTopicsRef.current = viewed;
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: 'subscribe', topics: [...viewed] }));
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

  return { logsByTopic, topics, isConnected, isReconnecting, clearLogs, trimTopicBuffer, logRates, subscribe, sendFilter };
};
