const BASE = import.meta.env.VITE_API_URL ?? '';

async function parseError(res) {
  try {
    const data = await res.json();
    if (data.fields) {
      return Object.entries(data.fields)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
    }
    return data.error || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

async function handle(res) {
  if (!res.ok) throw new Error(await parseError(res));
  if (res.status === 204) return null;
  return res.json();
}

/**
 * Normalizes GET /api/tickets responses:
 * - Paged envelope { content, page, size, totalElements, totalPages } (when
 *   page/size query params are sent), returned as-is.
 * - Legacy bare array (no pagination params), wrapped into a page-like object
 *   so list UIs can treat both shapes uniformly.
 */
function toPage(data) {
  if (Array.isArray(data)) {
    return {
      content: data,
      page: 0,
      size: data.length,
      totalElements: data.length,
      totalPages: 1
    };
  }
  return data;
}

export const api = {
  list: ({ status, q, page, size, sort } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (q) params.set('q', q);
    if (page !== undefined && page !== null && page !== '') params.set('page', String(page));
    if (size !== undefined && size !== null && size !== '') params.set('size', String(size));
    if (sort) {
      const sorts = Array.isArray(sort) ? sort : [sort];
      sorts.forEach((s) => params.append('sort', s));
    }
    const suffix = params.toString() ? `?${params}` : '';
    return fetch(`${BASE}/api/tickets${suffix}`).then(handle).then(toPage);
  },
  get: (id) => fetch(`${BASE}/api/tickets/${id}`).then(handle),
  create: (payload) =>
    fetch(`${BASE}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handle),
  update: (id, payload) =>
    fetch(`${BASE}/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handle),
  changeStatus: (id, status) =>
    fetch(`${BASE}/api/tickets/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(handle),
  remove: (id) =>
    fetch(`${BASE}/api/tickets/${id}`, { method: 'DELETE' }).then(handle),
  addComment: (id, payload) =>
    fetch(`${BASE}/api/tickets/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handle)
};

export const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'];
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
export const PAGE_SIZES = [5, 10, 20];

/** Allowed next statuses per the backend state machine (for hints in the UI). */
export function allowedNext(status) {
  switch (status) {
    case 'OPEN':
      return ['IN_PROGRESS', 'CANCELLED'];
    case 'IN_PROGRESS':
      return ['RESOLVED', 'CANCELLED'];
    case 'RESOLVED':
      return ['CLOSED'];
    default:
      return [];
  }
}
