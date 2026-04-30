import axios from 'axios';
import type { AdminUser, AdminRole, AdminPermission, AdminUserDetail, AuditLog, DashboardStats, DashboardTrends, Character } from '@/admin/types/admin';

const addAuthInterceptor = (instance: ReturnType<typeof axios.create>) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/admin/login')) {
          localStorage.removeItem('admin-token');
          window.location.href = '/admin/login';
        }
      }
      return Promise.reject(error);
    },
  );
  return instance;
};

// Panel API: auth, roles, users, permissions (prefix: /api/v1/admin/panel)
const panelApi = addAuthInterceptor(axios.create({
  baseURL: '/api/v1/admin/panel',
  timeout: 30000,
}));

// Base admin API: events, players, stats, audit, config (prefix: /api/v1/admin)
const adminApiBase = addAuthInterceptor(axios.create({
  baseURL: '/api/v1/admin',
  timeout: 30000,
}));

export const adminApi = {
  auth: {
    login: (username: string, password: string) =>
      panelApi.post<{ access_token: string; user: AdminUser }>('/auth/login', { username, password }),
    me: () => panelApi.get<AdminUser>('/auth/me'),
    seedRbac: () => panelApi.post<{ ok: boolean; roles: Record<string, AdminRole> }>('/auth/seed-rbac'),
  },
  roles: {
    list: (params?: { skip?: number; limit?: number }) => {
      const { skip = 0, limit = 20 } = params || {};
      return panelApi.get<{ total: number; roles: AdminRole[] }>(`/roles?skip=${skip}&limit=${limit}`);
    },
    create: (data: { name: string; display_name: string; description?: string; level?: number }) =>
      panelApi.post<AdminRole>('/roles', data),
    update: (id: number, data: { display_name?: string; description?: string; level?: number }) =>
      panelApi.put<AdminRole>(`/roles/${id}`, data),
    delete: (id: number) => panelApi.delete<{ ok: boolean }>(`/roles/${id}`),
    assignPermissions: (id: number, codes: string[]) =>
      panelApi.put<{ ok: boolean; assigned: number }>(`/roles/${id}/permissions`, codes),
  },
  permissions: {
    list: () => panelApi.get<AdminPermission[]>('/permissions'),
  },
  users: {
    list: (params: { skip?: number; limit?: number } = {}) => {
      const { skip = 0, limit = 50 } = params;
      return panelApi.get<{ total: number; users: AdminUserDetail[] }>(`/users?skip=${skip}&limit=${limit}`);
    },
    create: (data: { username: string; password: string; is_superuser?: boolean; role_id?: number }) =>
      panelApi.post<AdminUserDetail>('/users', data),
    update: (id: number, data: { is_active?: boolean; is_superuser?: boolean; role_id?: number }) =>
      panelApi.put<AdminUserDetail>(`/users/${id}`, data),
    lock: (id: number, lock: boolean) =>
      panelApi.put<{ ok: boolean; is_locked: boolean }>(`/users/${id}/lock`, { is_locked: lock }),
    resetPassword: (id: number, newPassword: string) =>
      panelApi.put<{ ok: boolean }>(`/users/${id}/reset-password`, { new_password: newPassword }),
    batchUpdate: (data: { user_ids: number[]; is_active?: boolean; is_locked?: boolean }) =>
      panelApi.put<{ ok: boolean; message: string; updated_count: number }>('/users/batch', data),
  },
  audit: {
    list: (params?: { user_id?: number; action?: string; table_name?: string; start_date?: string; end_date?: string; skip?: number; limit?: number }) =>
      adminApiBase.get<{ total: number; logs: AuditLog[] }>('/audit-logs', { params }),
    getById: (id: number) =>
      adminApiBase.get<AuditLog>(`/audit-logs/${id}`),
  },
  dashboard: {
    realtime: () => adminApiBase.get<DashboardStats>('/stats/realtime'),
    trends: () => adminApiBase.get<DashboardTrends>('/stats/trends'),
    events: () => adminApiBase.get<{ difficulty_distribution: any[]; age_coverage: any[]; top_events: any[] }>('/stats/events'),
  },
  events: {
    list: (params?: { category?: string; min_age?: number; max_age?: number; is_active?: boolean; skip?: number; limit?: number }) =>
      adminApiBase.get<{ total: number; skip: number; limit: number; events: any[] }>('/events', { params }),
    getById: (id: number) =>
      adminApiBase.get<any>(`/events/${id}`),
    create: (data: any) =>
      adminApiBase.post<any>('/events', data),
    update: (id: number, data: any) =>
      adminApiBase.put<any>(`/events/${id}`, data),
    delete: (id: number) =>
      adminApiBase.delete<{ ok: boolean }>(`/events/${id}`),
    bulkDelete: (ids: number[]) =>
      adminApiBase.post<{ ok: boolean; affected: number; failed_ids: number[] }>('/events/bulk-delete', { ids }),
    bulkUpdate: (ids: number[], is_active: boolean) =>
      adminApiBase.post<{ ok: boolean; affected: number; failed_ids: number[] }>(`/events/bulk-update?is_active=${is_active}`, { ids }),
  },
  players: {
    list: (params: { skip?: number; limit?: number; search?: string; is_banned?: boolean } = {}) => {
      const { skip = 0, limit = 20, search, is_banned } = params;
      const qp = new URLSearchParams();
      qp.set('skip', String(skip));
      qp.set('limit', String(limit));
      if (search) qp.set('search', search);
      if (is_banned !== undefined) qp.set('is_banned', String(is_banned));
      return panelApi.get<{ total: number; items: any[]; skip: number; limit: number }>(`/players?${qp.toString()}`);
    },
    detail: (id: number) =>
      panelApi.get<any>(`/players/${id}`),
    edit: (id: number, data: { remark?: string; tags?: string[] }) =>
      panelApi.put<{ ok: boolean; message: string; remark: string | null; tags: string[] }>(`/players/${id}/edit`, data),
    ban: (id: number) =>
      panelApi.put<{ ok: boolean; message: string }>(`/players/${id}/ban`, {}),
    unban: (id: number) =>
      panelApi.put<{ ok: boolean; message: string }>(`/players/${id}/unban`, {}),
    batchBan: (playerIds: number[], ban: boolean) =>
      panelApi.put<{ ok: boolean; message: string; updated_count: number }>('/players/batch', { player_ids: playerIds, ban }),
    getSaves: (id: number) =>
      panelApi.get<{ saves: any[]; total: number }>(`/players/${id}/saves`),
    deleteSave: (playerId: number, saveId: number) =>
      panelApi.delete<{ ok: boolean; message: string }>(`/players/${playerId}/saves/${saveId}`),
    resetPassword: (id: number, newPassword: string) =>
      panelApi.put<{ ok: boolean; message: string }>(`/players/${id}/reset-password`, { new_password: newPassword }),
  },
  characters: {
    list: (params?: { skip?: number; limit?: number }) => {
      const { skip = 0, limit = 50 } = params || {};
      return adminApiBase.get<{ total: number; characters: Character[] }>(`/characters?skip=${skip}&limit=${limit}`);
    },
  },
  stats: {
    base: () =>
      adminApiBase.get<{ total_characters: number; alive_characters: number; average_age: number; total_event_templates: number }>('/stats'),
  },
  config: {
    list: (params?: { category?: string; is_active?: boolean }) => {
      const qp = new URLSearchParams();
      if (params?.category) qp.set('category', params.category);
      if (params?.is_active !== undefined) qp.set('is_active', String(params.is_active));
      const qs = qp.toString();
      return panelApi.get<{ configs: any[] }>(`/configs${qs ? `?${qs}` : ''}`);
    },
    get: (key: string) =>
      panelApi.get<{ key: string; value: any; category: string; description: string }>(`/configs/${key}`),
    create: (data: { key: string; value: string; category: string; description?: string; is_active?: boolean }) =>
      panelApi.post<any>('/configs', data),
    update: (id: number, data: { key: string; value: string; category: string; description?: string; is_active?: boolean }) =>
      panelApi.put<any>(`/configs/${id}`, data),
    batchUpdate: (configs: Array<{ key: string; value: string }>) =>
      panelApi.post<{ ok: boolean; updated: number }>('/configs/batch', { configs }),
    delete: (key: string) =>
      panelApi.delete<{ ok: boolean }>(`/configs/${key}`),
    seed: () =>
      panelApi.post<{ ok: boolean; created: number }>('/configs/seed'),
  },
  achievements: {
    list: (params?: { category?: string; skip?: number; limit?: number }) => {
      const qp = new URLSearchParams();
      if (params?.category) qp.set('category', params.category);
      if (params?.skip !== undefined) qp.set('skip', String(params.skip));
      if (params?.limit !== undefined) qp.set('limit', String(params.limit));
      const qs = qp.toString();
      return adminApiBase.get<{ total: number; achievements: any[] }>(`/content/achievements${qs ? `?${qs}` : ''}`);
    },
    stats: () => adminApiBase.get<any>('/content/achievements/stats'),
  },
  announcements: {
    list: (params?: { status?: string; type?: string; skip?: number; limit?: number }) => {
      const qp = new URLSearchParams();
      if (params?.status) qp.set('status', params.status);
      if (params?.type) qp.set('type', params.type);
      if (params?.skip !== undefined) qp.set('skip', String(params.skip));
      if (params?.limit !== undefined) qp.set('limit', String(params.limit));
      const qs = qp.toString();
      return adminApiBase.get<{ total: number; announcements: any[] }>(`/content/announcements${qs ? `?${qs}` : ''}`);
    },
    create: (data: { title: string; content: string; type: string; target_audience: string; scheduled_at?: string }) =>
      adminApiBase.post<any>('/content/announcements', data),
    update: (id: number, data: Partial<{ title: string; content: string; type: string; target_audience: string }>) =>
      adminApiBase.patch<any>(`/content/announcements/${id}`, data),
    delete: (id: number) =>
      adminApiBase.delete<{ message: string }>(`/content/announcements/${id}`),
    publish: (id: number) =>
      adminApiBase.post<any>(`/content/announcements/${id}/publish`),
  },
  leaderboards: {
    list: () => adminApiBase.get<{ types: string[] }>('/content/leaderboards'),
    get: (type: string, params?: { days?: number; skip?: number; limit?: number }) => {
      const qp = new URLSearchParams();
      if (params?.days !== undefined) qp.set('days', String(params.days));
      if (params?.skip !== undefined) qp.set('skip', String(params.skip));
      if (params?.limit !== undefined) qp.set('limit', String(params.limit));
      const qs = qp.toString();
      return adminApiBase.get<{ total: number; records: any[] }>(`/content/leaderboards/${type}${qs ? `?${qs}` : ''}`);
    },
    refresh: () => adminApiBase.post<{ ok: boolean }>('/content/leaderboards/refresh'),
  },
  errorLogs: {
    list: (params?: { level?: string; status?: string; start_date?: string; end_date?: string; skip?: number; limit?: number }) =>
      adminApiBase.get<{ total: number; logs: any[] }>('/error-logs', { params }),
    getById: (id: number) =>
      adminApiBase.get<any>(`/error-logs/${id}`),
    updateStatus: (id: number, status: string) =>
      adminApiBase.patch<any>(`/error-logs/${id}/status`, { status }),
    stats: (days?: number) =>
      adminApiBase.get<any>(`/error-logs/stats`, { params: { days: days ?? 30 } }),
  },
  exports: {
    exportData: (type: string, data: { format?: string; filters?: Record<string, unknown> }) =>
      adminApiBase.post(`/export/${type}`, data, { responseType: 'blob' }),
    listTasks: (params?: { skip?: number; limit?: number }) =>
      adminApiBase.get<{ total: number; tasks: any[] }>('/export/tasks', { params }),
    getTask: (id: number) =>
      adminApiBase.get<any>(`/export/tasks/${id}`),
  },
  system: {
    status: () => adminApiBase.get<any>('/system/status'),
    stats: () => adminApiBase.get<any>('/system/stats'),
    activity: (days?: number) => adminApiBase.get<any>('/system/stats/activity', { params: { days } }),
    metricsHistory: (hours?: number) => adminApiBase.get<any>('/system/metrics/history', { params: { hours } }),
    metricsLatest: () => adminApiBase.get<any>('/system/metrics/latest'),
  },
  configSchemas: {
    list: () => panelApi.get<any>('/configs/schemas'),
  },
};

export default adminApi;
