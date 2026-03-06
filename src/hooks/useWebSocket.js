import { useEffect, useState } from 'react';

export const useWebSocket = (url) => {
  const [logsByTopic, setLogsByTopic] = useState({});
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (Array.isArray(data)) {
        setTopics(data);
        setLogsByTopic(prev => {
          const updated = { ...prev };
          data.forEach(topic => {
            if (!updated[topic]) updated[topic] = [];
          });
          return updated;
        });
        return;
      }

      const log = data;
      setLogsByTopic(prev => {
        const topicLogs = prev[log.topic] || [];
        return {
          ...prev,
          [log.topic]: [log, ...topicLogs].slice(0, 300)
        };
      });
    };

    return () => socket.close();
  }, [url]);

  const clearLogs = (topic) => {
    setLogsByTopic(prev => ({
      ...prev,
      [topic]: []
    }));
  };

  return { logsByTopic, topics, clearLogs };
};