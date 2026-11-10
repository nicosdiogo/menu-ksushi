const BASE = import.meta.env.VITE_API_URL;
export const apiEnabled = Boolean(BASE);

export class ApiError extends Error {
  constructor(message, errors = {}, status = 0) {
    super(message);
    this.errors = errors;
    this.status = status;
  }
}

async function call(path, { method = 'GET', body, timeout = 10000 } = {}) {
  const isForm = body instanceof FormData;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  let res;
  try {
    res = await fetch(`${BASE}/api/v1${path}`, {
      method,
      headers: { Accept: 'application/json', ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      signal: ctrl.signal,
    });
  } catch {
    throw new ApiError('Sem ligação ao servidor. Tente novamente.');
  } finally {
    clearTimeout(timer);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message || 'Não foi possível concluir o pedido.', data.errors || {}, res.status);
  return data;
}

export const api = {
  settings: () => call('/settings'),
  table: (token) => call(`/tables/${encodeURIComponent(token)}`, { timeout: 4000 }), // não pode atrasar o arranque
  createOrder: (body) => call('/orders', { method: 'POST', body }),
  order: (token) => call(`/orders/${token}`),
  cancelOrder: (token) => call(`/orders/${token}/cancel`, { method: 'POST' }),
  uploadProof: (token, file) => {
    const form = new FormData();
    form.append('proof', file);
    return call(`/orders/${token}/proof`, { method: 'POST', body: form });
  },
};
