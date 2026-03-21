/**
 * Storage API — server disk usage endpoints.
 * All storage-related HTTP calls live here.
 */

export const storageApi = {
  getLatest: (client) =>
    client.get('/api/server-storage-usage/latest').then((r) => r.json()),
};
