import { useState, useEffect } from 'react';
import { fetchTopicMeta } from '../api/logs';

const useTopicMeta = (topic) => {
  const [record, setRecord] = useState({ topic: null, meta: null });

  useEffect(() => {
    if (!topic) return;
    let cancelled = false;
    fetchTopicMeta(topic)
      .then((data) => { if (!cancelled && data) setRecord({ topic, meta: data }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [topic]);

  return record.topic === topic ? record.meta : null;
};

export default useTopicMeta;
