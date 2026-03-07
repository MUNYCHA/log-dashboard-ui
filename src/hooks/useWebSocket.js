import { useEffect, useState, useCallback } from 'react';
import config from '../config';

/**
 * Connects to a WebSocket server and manages incoming log data.
 *
 * The server is expected to send two message shapes:
 *   - string[]  — initial list of topic names
 *   - LogEntry  — { topic, serverName, path, message, timestamp }
 *
 * Returns:
 *   logsByTopic  - Record<topic, LogEntry[]> — most recent log first
 *   topics       - string[] — known topic names
 *   isConnected  - boolean — live connection status
 *   clearLogs    - (topic: string) => void
 */
export const useWebSocket = (url) => {
  const [logsByTopic, setLogsByTopic] = useState({});
  const [topics, setTopics] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    socket.onerror = () => setIsConnected(false);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Initial topic list from server
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

      // Individual log entry
      const log = data;
      setLogsByTopic((prev) => {
        const existing = prev[log.topic] || [];
        return {
          ...prev,
          [log.topic]: [log, ...existing].slice(0, config.ws.maxLogsPerTopic),
        };
      });
    };

    return () => socket.close();
  }, [url]);

  const clearLogs = useCallback((topic) => {
    setLogsByTopic((prev) => ({ ...prev, [topic]: [] }));
  }, []);

  return { logsByTopic, topics, isConnected, clearLogs };
};
