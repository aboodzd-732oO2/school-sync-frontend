const API_URL = import.meta.env.VITE_API_URL || 'https://school-sync-backend-production.up.railway.app/api/v1';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || 'حدث خطأ');
  }
  return data.data;
}

// ──────────── Auth ────────────
export const auth = {
  register: (body: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (email: string, password: string) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),
};

// ──────────── Requests ────────────
export const requests = {
  list: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/requests${params}`);
  },
  create: (body: any) => request('/requests', { method: 'POST', body: JSON.stringify(body) }),
  getById: (id: string) => request(`/requests/${id}`),
  update: (id: string, body: any) => request(`/requests/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  updateStatus: (id: string, body: any) => request(`/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => request(`/requests/${id}`, { method: 'DELETE' }),
};

// ──────────── Warehouse ────────────
export const warehouse = {
  listRequests: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/warehouse/requests${params}`);
  },
  updateRequestStatus: (id: string, body: any) => request(`/warehouse/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
};

// ──────────── Inventory ────────────
export const inventory = {
  list: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/inventory${params}`);
  },
  create: (body: any) => request('/inventory', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: any) => request(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: number) => request(`/inventory/${id}`, { method: 'DELETE' }),
  lowStock: () => request('/inventory/low-stock'),
};

// ──────────── Reports ────────────
export const reports = {
  list: () => request('/reports'),
  generate: () => request('/reports/generate', { method: 'POST' }),
  getById: (id: number) => request(`/reports/${id}`),
};

// ──────────── Lookup ────────────
export const lookup = {
  governorates: () => request('/governorates'),
  departments: () => request('/departments'),
  institutions: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/institutions${params}`);
  },
  warehouses: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/warehouses${params}`);
  },
};
