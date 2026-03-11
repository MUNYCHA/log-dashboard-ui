import { useEffect, useState, useCallback, useRef } from 'react';
import config from '../config';

const FLUSH_INTERVAL_MS = 150;  // batch log state updates — reduces re-renders dramatically
let _logIdCounter = 0;

/**
 * Connects to a WebSocket server and manages incoming log data.
 *
 * The server sends typed messages:
 *   - { type: "topics", topics: string[] }                    — available topics (on connect)
 *   - { type: "stats", topics: { [t]: { rate, servers } } }  — periodic stats (every ~2s)
 *   - { type: "filter-ack", filters, regexError? }           — filter acknowledgment
 *   - LogEntry or LogEntry[]                                  — log events (after subscribe)
 *
 * Returns:
 *   logsByTopic   - Record<topic, LogEntry[]> — most recent log first
 *   topics        - string[] — known topic names
 *   isConnected   - boolean — live connection status
 *   isReconnecting - boolean — true while waiting to reconnect
 *   logRates      - Record<topic, number> — logs/sec per topic (from server stats)
 *   topicServers  - Record<topic, string[]> — active servers per topic (from server stats)
 *   clearLogs     - (topic: string) => void
 */
/** Max logs kept for non-viewed topics (sidebar: last log + server badges). */
const SIDEBAR_LOG_CAP = 50;

export const useWebSocket = (url, viewedTopics) => {
  const [logsByTopic, setLogsByTopic] = useState({});
  const [topics, setTopics] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [logRates, setLogRates] = useState({});
  const [topicServers, setTopicServers] = useState({});
  const [filterAck, setFilterAck] = useState(null);

  const pendingRef = useRef([]);        // logs waiting for next flush
  const pendingCountRef = useRef({});   // per-topic count in pendingRef — enforces cap
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const socketRef = useRef(null);
  const subscribedTopicsRef = useRef(new Set());
  const activeFilterRef = useRef(null); // last filter sent — resend on reconnect
  const viewedTopicsRef = useRef(new Set());

  // Keep viewed topics ref in sync (avoids stale closures in flush)
  useEffect(() => {
    viewedTopicsRef.current = new Set(viewedTopics.filter(Boolean));
  }, [viewedTopics]);

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
          // Non-viewed topics keep a small cap (50) — enough for sidebar
          // (last log, server badges, count) without wasting memory.
          const cap = viewed.has(topic) ? config.ws.rawBufferPerTopic : SIDEBAR_LOG_CAP;
          updated[topic] = newLogs.reverse().concat(existing).slice(0, cap);
        }
        return updated;
      });
    }, FLUSH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Log rates are now provided by server-side stats messages (no client-side counting needed)

  // WebSocket with auto-reconnect (exponential backoff, max 30s)
  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      const socket = new WebSocket(url);
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
          return; // malformed message — skip silently
        }

        // Typed messages from server
        if (data.type === 'topics') {
          setTopics(data.topics);
          setLogsByTopic((prev) => {
            const updated = { ...prev };
            data.topics.forEach((topic) => {
              if (!updated[topic]) updated[topic] = [];
            });
            return updated;
          });
          // Auto-subscribe to all topics so logs flow immediately.
          // Viewed topics get full buffer cap; non-viewed get sidebar cap (50).
          if (data.topics.length > 0) {
            const allTopics = new Set(data.topics);
            // Merge with any existing subscriptions (e.g. from previous viewed topics)
            subscribedTopicsRef.current.forEach((t) => allTopics.add(t));
            subscribedTopicsRef.current = allTopics;
            socket.send(JSON.stringify({ action: 'subscribe', topics: [...allTopics] }));
          }
          return;
        }

        if (data.type === 'stats') {
          const intervalSec = (data.intervalMs || 2000) / 1000;
          const rates = {};
          const servers = {};
          for (const [topic, info] of Object.entries(data.topics)) {
            rates[topic] = +(info.rate / intervalSec).toFixed(1);
            servers[topic] = info.servers || [];
          }
          setLogRates(rates);
          setTopicServers(servers);
          return;
        }

        if (data.type === 'filter-ack') {
          setFilterAck(data);
          return;
        }

        // Legacy: bare topic array (backwards compat during rollout)
        if (Array.isArray(data) && (data.length === 0 || typeof data[0] === 'string')) {
          setTopics(data);
          setLogsByTopic((prev) => {
            const updated = { ...prev };
            data.forEach((topic) => {
              if (!updated[topic]) updated[topic] = [];
            });
            return updated;
          });
          // Auto-subscribe (same as typed topics handler)
          if (data.length > 0) {
            const allTopics = new Set(data);
            subscribedTopicsRef.current.forEach((t) => allTopics.add(t));
            subscribedTopicsRef.current = allTopics;
            socket.send(JSON.stringify({ action: 'subscribe', topics: [...allTopics] }));
          }
          return;
        }

        // Normalize to array — backend may send single event or batched array
        const events = Array.isArray(data) ? data : [data];

        for (const log of events) {
          // Assign stable unique ID for React key
          log._id = ++_logIdCounter;

          // Truncate oversized messages to prevent DOM bloat
          if (log.message && log.message.length > config.ws.maxMessageLength) {
            log.message = log.message.slice(0, config.ws.maxMessageLength) + '\n… [truncated]';
          }

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
    setLogsByTopic((prev) => ({ ...prev, [topic]: [] }));
  }, []);

  const subscribe = useCallback((topicList) => {
    // Merge viewed topics into the existing subscription set (which includes
    // all topics from auto-subscribe). Don't replace — that would unsubscribe
    // non-viewed topics and break sidebar data.
    const viewed = new Set(topicList.filter(Boolean));
    viewed.forEach((t) => subscribedTopicsRef.current.add(t));
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: 'subscribe', topics: [...subscribedTopicsRef.current] }));
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

  return { logsByTopic, topics, isConnected, isReconnecting, clearLogs, logRates, topicServers, subscribe, sendFilter, filterAck };
};
