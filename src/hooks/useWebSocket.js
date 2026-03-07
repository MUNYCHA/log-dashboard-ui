import { useEffect, useState, useCallback, useRef } from 'react';
import config from '../config';

const STORAGE_KEY = 'logstream_logs';
const STORAGE_MAX_PER_TOPIC = 50;

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(logsByTopic) {
  try {
    const toSave = {};
    for (const [topic, logs] of Object.entries(logsByTopic)) {
      toSave[topic] = logs.slice(0, STORAGE_MAX_PER_TOPIC);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Storage quota exceeded or unavailable — ignore
  }
}

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
  const [logsByTopic, setLogsByTopic] = useState(() => loadFromStorage());
  const [topics, setTopics] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [logRates, setLogRates] = useState({});

  const isPausedRef = useRef(false);
  const bufferRef = useRef([]);
  const logCountRef = useRef({});
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);

  // Sync isPaused to ref and flush buffer when unpausing
  useEffect(() => {
    isPausedRef.current = isPaused;
    if (!isPaused && bufferRef.current.length > 0) {
      const buffered = bufferRef.current.splice(0);
      setLogsByTopic((prev) => {
        const updated = { ...prev };
        for (const log of buffered) {
          const existing = updated[log.topic] || [];
          updated[log.topic] = [log, ...existing].slice(0, config.ws.maxLogsPerTopic);
        }
        saveToStorage(updated);
        return updated;
      });
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
          bufferRef.current.push(log);
          return;
        }

        setLogsByTopic((prev) => {
          const existing = prev[log.topic] || [];
          const updated = {
            ...prev,
            [log.topic]: [log, ...existing].slice(0, config.ws.maxLogsPerTopic),
          };
          saveToStorage(updated);
          return updated;
        });
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
    setLogsByTopic((prev) => {
      const updated = { ...prev, [topic]: [] };
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const togglePause = useCallback(() => setIsPaused((p) => !p), []);

  return { logsByTopic, topics, isConnected, isReconnecting, clearLogs, isPaused, togglePause, logRates };
};
