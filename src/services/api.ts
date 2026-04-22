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
  changePassword: (currentPassword: string, newPassword: string) =>
    request('/auth/me/password', { method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword }) }),
  forgotPassword: (email: string) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
};

// ──────────── Institution ────────────
import type { InstitutionStatsResponse, InstitutionStatsTrendPoint } from '@/types/institutionStats';

export const institution = {
  stats: (days?: number): Promise<InstitutionStatsResponse> =>
    request(`/institution/stats${days && days > 0 ? `?days=${days}` : ''}`),
  statsTrends: (days = 30): Promise<InstitutionStatsTrendPoint[]> =>
    request(`/institution/stats/trends?days=${days}`),
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
import type { WarehouseStatsResponse, WarehouseStatsTrendPoint } from '@/types/warehouseStats';

export const warehouse = {
  listRequests: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/warehouse/requests${params}`);
  },
  updateRequestStatus: (id: string, body: any) => request(`/warehouse/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  stats: (days?: number): Promise<WarehouseStatsResponse> =>
    request(`/warehouse/stats${days && days > 0 ? `?days=${days}` : ''}`),
  statsTrends: (days = 30): Promise<WarehouseStatsTrendPoint[]> =>
    request(`/warehouse/stats/trends?days=${days}`),
};

// ──────────── Inventory ────────────
import type { InventoryMovement, PaginatedMovements } from '@/types/inventoryMovement';
import type { InventoryAlertsResponse } from '@/types/inventoryAlerts';

export const inventory = {
  list: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/inventory${params}`);
  },
  create: (body: any) => request('/inventory', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: any) => request(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: number) => request(`/inventory/${id}`, { method: 'DELETE' }),
  lowStock: () => request('/inventory/low-stock'),
  alerts: (): Promise<InventoryAlertsResponse> => request('/inventory/alerts'),
  movements: (filters?: Record<string, string>): Promise<PaginatedMovements> => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/inventory/movements${params}`);
  },
  itemHistory: (itemId: number): Promise<InventoryMovement[]> =>
    request(`/inventory/${itemId}/history`),
};

// ──────────── Notifications ────────────
export const notifications = {
  list: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/notifications${params}`);
  },
  markRead: (id: number) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
};

// ──────────── Reports ────────────
export const reports = {
  list: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/reports${params}`);
  },
  generate: () => request('/reports/generate', { method: 'POST' }),
  getById: (id: number) => request(`/reports/${id}`),
};

// ──────────── Admin ────────────
import type { AdminStatsResponse, AdminStatsTrendPoint } from '@/types/adminStats';

export const admin = {
  stats: (days?: number): Promise<AdminStatsResponse> =>
    request(`/admin/stats${days && days > 0 ? `?days=${days}` : ''}`),
  statsTrends: (days = 30): Promise<AdminStatsTrendPoint[]> =>
    request(`/admin/stats/trends?days=${days}`),
  // Users
  listUsers: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/admin/users${params}`);
  },
  createUser: (body: any) => request('/admin/users', { method: 'POST', body: JSON.stringify(body) }),
  getUser: (id: number) => request(`/admin/users/${id}`),
  updateUser: (id: number, body: any) => request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteUser: (id: number) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  // Institutions
  listInstitutions: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/admin/institutions${params}`);
  },
  createInstitution: (body: any) => request('/admin/institutions', { method: 'POST', body: JSON.stringify(body) }),
  updateInstitution: (id: number, body: any) => request(`/admin/institutions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteInstitution: (id: number) => request(`/admin/institutions/${id}`, { method: 'DELETE' }),
  // Warehouses
  listWarehouses: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/admin/warehouses${params}`);
  },
  createWarehouse: (body: any) => request('/admin/warehouses', { method: 'POST', body: JSON.stringify(body) }),
  updateWarehouse: (id: number, body: any) => request(`/admin/warehouses/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteWarehouse: (id: number) => request(`/admin/warehouses/${id}`, { method: 'DELETE' }),
  // Departments
  listDepartments: () => request('/admin/departments'),
  createDepartment: (body: any) => request('/admin/departments', { method: 'POST', body: JSON.stringify(body) }),
  updateDepartment: (id: number, body: any) => request(`/admin/departments/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteDepartment: (id: number) => request(`/admin/departments/${id}`, { method: 'DELETE' }),
  // Governorates
  listGovernorates: () => request('/admin/governorates'),
  createGovernorate: (body: any) => request('/admin/governorates', { method: 'POST', body: JSON.stringify(body) }),
  updateGovernorate: (id: number, body: any) => request(`/admin/governorates/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteGovernorate: (id: number) => request(`/admin/governorates/${id}`, { method: 'DELETE' }),
  // Institution Types
  listInstitutionTypes: () => request('/admin/institution-types'),
  createInstitutionType: (body: any) => request('/admin/institution-types', { method: 'POST', body: JSON.stringify(body) }),
  updateInstitutionType: (id: number, body: any) => request(`/admin/institution-types/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteInstitutionType: (id: number) => request(`/admin/institution-types/${id}`, { method: 'DELETE' }),
  // Department Items
  listDepartmentItems: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/admin/department-items${params}`);
  },
  createDepartmentItem: (body: any) => request('/admin/department-items', { method: 'POST', body: JSON.stringify(body) }),
  updateDepartmentItem: (id: number, body: any) => request(`/admin/department-items/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteDepartmentItem: (id: number) => request(`/admin/department-items/${id}`, { method: 'DELETE' }),
  // Units
  listUnits: () => request('/admin/units'),
  createUnit: (body: any) => request('/admin/units', { method: 'POST', body: JSON.stringify(body) }),
  updateUnit: (id: number, body: any) => request(`/admin/units/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteUnit: (id: number) => request(`/admin/units/${id}`, { method: 'DELETE' }),
  // Priorities
  listPriorities: () => request('/admin/priorities'),
  createPriority: (body: any) => request('/admin/priorities', { method: 'POST', body: JSON.stringify(body) }),
  updatePriority: (id: number, body: any) => request(`/admin/priorities/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deletePriority: (id: number) => request(`/admin/priorities/${id}`, { method: 'DELETE' }),
  // Routing
  routingMap: () => request('/admin/routing-map'),
  // Audit Logs
  auditLogs: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/admin/audit-logs${params}`);
  },
  // Password Reset Requests
  listPasswordResets: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/admin/password-resets${params}`);
  },
  approvePasswordReset: (id: number, newPassword: string) =>
    request(`/admin/password-resets/${id}/approve`, { method: 'POST', body: JSON.stringify({ newPassword }) }),
  rejectPasswordReset: (id: number) =>
    request(`/admin/password-resets/${id}/reject`, { method: 'POST' }),
};

// ──────────── Lookup ────────────
export const lookup = {
  governorates: () => request('/governorates'),
  departments: () => request('/departments'),
  institutionTypes: () => request('/institution-types'),
  departmentItems: (departmentKey?: string) => {
    const params = departmentKey ? `?departmentKey=${encodeURIComponent(departmentKey)}` : '';
    return request(`/department-items${params}`);
  },
  units: () => request('/units'),
  priorities: () => request('/priorities'),
  institutions: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/institutions${params}`);
  },
  warehouses: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/warehouses${params}`);
  },
};
