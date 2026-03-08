import { useEffect, useState, useCallback, useRef } from 'react';
import config from '../config';

const FLUSH_INTERVAL_MS = 150;  // batch log state updates — reduces re-renders dramatically

/**
 * Connects to a WebSocket server and manages incoming log data.
 *
 * The server is expected to send two message shapes:
 *   - string[]  — initial list of topic names
 *   - LogEntry  — { topic, serverName, path, message, timestamp }
 *
 * Returns:
 *   logsByTopic   - Record<topic, LogEntry[]> — most recent log first
 *   topics        - string[] — known topic names
 *   isConnected   - boolean — live connection status
 *   isReconnecting - boolean — true while waiting to reconnect
 *   isPaused      - boolean — stream is paused (logs buffered)
 *   togglePause   - () => void
 *   logRates      - Record<topic, number> — logs/sec per topic (5s window)
 *   clearLogs     - (topic: string) => void
 */
export const useWebSocket = (url) => {
  const [logsByTopic, setLogsByTopic] = useState({});
  const [topics, setTopics] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [logRates, setLogRates] = useState({});

  const isPausedRef = useRef(false);
  const bufferRef = useRef([]);         // logs held while paused
  const pendingRef = useRef([]);        // logs waiting for next flush
  const pendingCountRef = useRef({});   // per-topic count in pendingRef — enforces cap
  const logCountRef = useRef({});
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);

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
        for (const [topic, newLogs] of Object.entries(byTopic)) {
          const existing = updated[topic] || [];
          // newLogs is oldest-first — reverse in place (it's our local array)
          // then concat existing, then cap. One new array per topic per flush.
          updated[topic] = newLogs.reverse().concat(existing).slice(0, config.ws.maxLogsPerTopic);
        }
        return updated;
      });
    }, FLUSH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Sync isPaused to ref and flush buffer when unpausing
  useEffect(() => {
    isPausedRef.current = isPaused;
    if (!isPaused && bufferRef.current.length > 0) {
      const buffered = bufferRef.current.splice(0);
      for (const log of buffered) {
        const topicCount = pendingCountRef.current[log.topic] || 0;
        if (topicCount < config.ws.maxLogsPerTopic) {
          pendingRef.current.push(log);
          pendingCountRef.current[log.topic] = topicCount + 1;
        }
      }
    }
  }, [isPaused]);

  // Log rate tracker — count logs per 5s window, expose as logs/sec
  useEffect(() => {
    const interval = setInterval(() => {
      const counts = { ...logCountRef.current };
      logCountRef.current = {};
      setLogRates(
        Object.fromEntries(
          Object.entries(counts).map(([t, c]) => [t, +(c / 5).toFixed(1)])
        )
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket with auto-reconnect (exponential backoff, max 30s)
  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      const socket = new WebSocket(url);

      socket.onopen = () => {
        if (cancelled) return;
        setIsConnected(true);
        setIsReconnecting(false);
        reconnectAttemptsRef.current = 0;
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
        const data = JSON.parse(event.data);

        if (Array.isArray(data)) {
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

        const log = data;
        logCountRef.current[log.topic] = (logCountRef.current[log.topic] || 0) + 1;

        if (isPausedRef.current) {
          // Cap pause buffer — prevents unbounded memory growth at high log rates
          if (bufferRef.current.length < config.ws.maxLogsPerTopic) {
            bufferRef.current.push(log);
          }
          return;
        }

        // Per-topic cap on pending queue — drop logs for a topic that already has
        // maxLogsPerTopic entries queued (they'd be discarded by the cap anyway)
        const topicCount = pendingCountRef.current[log.topic] || 0;
        if (topicCount < config.ws.maxLogsPerTopic) {
          pendingRef.current.push(log);
          pendingCountRef.current[log.topic] = topicCount + 1;
        }
      };
    }

    connect();

    return () => {
      cancelled = true;
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

  const togglePause = useCallback(() => setIsPaused((p) => !p), []);

  return { logsByTopic, topics, isConnected, isReconnecting, clearLogs, isPaused, togglePause, logRates };
};
