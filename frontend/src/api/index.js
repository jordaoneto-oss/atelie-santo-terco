const API = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Não autenticado');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

export const api = {
  auth: {
    login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/api/auth/me'),
    resetPassword: (body) => request('/api/auth/reset-password', { method: 'PUT', body: JSON.stringify(body) }),
  },
  products: {
    list: (params) => request(`/api/products?${new URLSearchParams(params || {})}`),
    get: (id) => request(`/api/products/${id}`),
    create: (body) => request('/api/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/api/products/${id}`, { method: 'DELETE' }),
    addVariant: (id, body) => request(`/api/products/${id}/variants`, { method: 'POST', body: JSON.stringify(body) }),
    deleteVariant: (id) => request(`/api/products/variants/${id}`, { method: 'DELETE' }),
  },
  customers: {
    list: (params) => request(`/api/customers?${new URLSearchParams(params || {})}`),
    get: (id) => request(`/api/customers/${id}`),
    create: (body) => request('/api/customers', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/api/customers/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: (params) => request(`/api/orders?${new URLSearchParams(params || {})}`),
    get: (id) => request(`/api/orders/${id}`),
    create: (body) => request('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id, status) => request(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    summary: () => request('/api/orders/stats/summary'),
  },
  users: {
    list: () => request('/api/users'),
    create: (body) => request('/api/users', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/api/users/${id}`, { method: 'DELETE' }),
  },
  reports: {
    sales: (params) => request(`/api/reports/sales?${new URLSearchParams(params || {})}`),
  },
};
