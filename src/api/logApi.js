import config from '../config';
import { endpoints } from './endpoints';

// Returns parsed JSON data or null. Caller passes AbortSignal for cleanup.
export async function fetchTopicMeta(topic, signal) {
  const res = await fetch(endpoints.topicMeta(config.httpBaseUrl, topic), { signal });
  return res.ok ? res.json() : null;
}

// Returns { blob, filename } or throws. Caller handles dispatch for error display.
export async function downloadLogs(topic) {
  const res = await fetch(endpoints.downloadLogs(config.httpBaseUrl, topic));
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text.trim() || `Server returned ${res.status}`);
  }
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const baseName = match ? match[1].replace(/\.log$/i, '') : topic;
  const now = new Date();
  const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}-${String(now.getSeconds()).padStart(2,'0')}`;
  return { blob, filename: `${baseName}_${ts}.log` };
}
