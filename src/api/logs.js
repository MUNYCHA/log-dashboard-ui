import config from '../config';

export const fetchTopicMeta = (topic) =>
  fetch(`${config.httpBaseUrl}/api/topics/${encodeURIComponent(topic)}/meta`)
    .then((r) => (r.ok ? r.json() : null));

export const downloadLogs = (topic) =>
  fetch(`${config.httpBaseUrl}/api/logs/download?topic=${encodeURIComponent(topic)}`);
