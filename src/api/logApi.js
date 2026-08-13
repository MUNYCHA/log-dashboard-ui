import config from '../config';
import { endpoints } from './endpoints';

async function authHeaders(getToken) {
  const token = getToken ? await getToken() : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Returns parsed JSON data or null. Caller passes AbortSignal for cleanup.
export async function fetchChannelMeta(channel, signal, getToken) {
  const res = await fetch(endpoints.channelMeta(config.httpBaseUrl, channel), {
    signal,
    headers: await authHeaders(getToken),
  });
  return res.ok ? res.json() : null;
}

// Returns { blob, filename } or throws. Caller handles dispatch for error display.
export async function downloadLogs(channel, getToken) {
  const res = await fetch(endpoints.downloadLogs(config.httpBaseUrl, channel), {
    headers: await authHeaders(getToken),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text.trim() || `Server returned ${res.status}`);
  }
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const baseName = match ? match[1].replace(/\.log$/i, '') : channel;
  const now = new Date();
  const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}-${String(now.getSeconds()).padStart(2,'0')}`;
  return { blob, filename: `${baseName}_${ts}.log` };
}
