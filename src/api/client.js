/**
 * Base HTTP client.
 * All API calls go through this — auth headers, error handling, and
 * 401 logout are handled in one place so nothing leaks into components.
 */

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const createClient = ({ baseUrl, token = null, onUnauthorized = null }) => {
  const buildHeaders = (extra = {}) => {
    const headers = { 'Content-Type': 'application/json', ...extra };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const request = async (path, options = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: buildHeaders(options.headers),
    });

    if (res.status === 401) {
      // Token expired or invalid — notify the app to log out
      onUnauthorized?.();
      throw new ApiError(401, 'Unauthorized');
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new ApiError(res.status, text.trim() || `HTTP ${res.status}`);
    }

    return res;
  };

  return {
    get:  (path, options = {}) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
    // Raw response returned — callers decide whether to call .json() or .blob()
  };
};

export { createClient, ApiError };
