import { create } from 'zustand';
import type { AdminUser } from '@/admin/types/admin';
import { adminApi } from '@/admin/api/adminApi';

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AdminUser | null) => void;
  setToken: (token: string | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  hasPermission: (code: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('admin-token'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('admin-token'),

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('admin-token', token);
    } else {
      localStorage.removeItem('admin-token');
    }
    set({ token, isAuthenticated: !!token });
  },

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data } = await adminApi.auth.login(username, password);
      get().setToken(data.access_token);
      set({ user: data.user, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error('登录失败');
    }
  },

  logout: () => {
    get().setToken(null);
    set({ user: null });
  },

  fetchMe: async () => {
    if (!get().token) return;
    try {
      const { data } = await adminApi.auth.me();
      set({ user: data, isAuthenticated: true });
    } catch {
      get().logout();
    }
  },

  hasPermission: (code: string) => {
    const { user } = get();
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.permissions.includes(code);
  },
}));
