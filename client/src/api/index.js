const BASE = '/api';

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  dashboard: () => req('GET', '/dashboard'),
  layers: {
    list: () => req('GET', '/layers'),
    get: (id) => req('GET', `/layers/${id}`),
    create: (data) => req('POST', '/layers', data),
    update: (id, data) => req('PUT', `/layers/${id}`, data),
    delete: (id) => req('DELETE', `/layers/${id}`),
  },
  steps: {
    list: (layerId) => req('GET', `/steps${layerId ? `?layer_id=${layerId}` : ''}`),
    update: (id, data) => req('PUT', `/steps/${id}`, data),
    create: (data) => req('POST', '/steps', data),
    delete: (id) => req('DELETE', `/steps/${id}`),
  },
  bookings: {
    list: () => req('GET', '/bookings'),
    create: (data) => req('POST', '/bookings', data),
    update: (id, data) => req('PUT', `/bookings/${id}`, data),
    delete: (id) => req('DELETE', `/bookings/${id}`),
  },
  team: {
    list: () => req('GET', '/team'),
    create: (data) => req('POST', '/team', data),
    update: (id, data) => req('PUT', `/team/${id}`, data),
  },
  tools: {
    list: () => req('GET', '/tools'),
  },
  upload: {
    process: async (file) => {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${BASE}/upload/process`, { method: 'POST', body: form });
      return res.json();
    },
  },
};
