import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { api, UserProfile, UserProfileUpdate, ApiError } from "../api/client";

export type OnlineStatus = 'checking' | 'online' | 'offline';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  onlineStatus: OnlineStatus;
  isOnline: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: ApiError }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: ApiError }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  checkOnline: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>('checking');

  const checkOnline = useCallback(async () => {
    setOnlineStatus('checking');
    try {
      const { success } = await api.ping();
      setOnlineStatus(success ? 'online' : 'offline');
      return success;
    } catch {
      setOnlineStatus('offline');
      return false;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!api.isLoggedIn) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await api.getProfile();
      if (data && !error) {
        setUser(data);
        localStorage.setItem("earth-online-username", data.username);
        setOnlineStatus('online');
      } else {
        setUser(null);
        api.logout();
      }
    } catch {
      setUser(null);
      api.logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initialize both online check and user state
    const init = async () => {
      const online = await checkOnline();
      if (online && api.isLoggedIn) {
        await refreshUser();
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, [checkOnline, refreshUser]);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const { success, error } = await api.login(username, password);
      if (success) {
        setOnlineStatus('online');
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: error || { type: 'unknown' as const, message: "登录失败" } };
    } catch (err) {
      setOnlineStatus('offline');
      return { success: false, error: { type: 'network' as const, message: "网络错误" } };
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const register = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const { success, error } = await api.register(username, password);
      if (success) {
        setOnlineStatus('online');
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: error || { type: 'unknown' as const, message: "注册失败" } };
    } catch (err) {
      return { success: false, error: { type: 'network' as const, message: "网络错误" } };
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.logoutUser();
    } catch {
      // Even if API fails, still log out locally
    } finally {
      setUser(null);
      setOnlineStatus('offline');
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    try {
      // 过滤掉 null 值，转换为 undefined
      const updateData: UserProfileUpdate = {};
      if (profile.display_name !== undefined) {
        updateData.display_name = profile.display_name || undefined;
      }
      if (profile.avatar_color !== undefined) {
        updateData.avatar_color = profile.avatar_color || undefined;
      }
      if (profile.bio !== undefined) {
        updateData.bio = profile.bio || undefined;
      }
      const { data, error } = await api.updateProfile(updateData);
      if (data && !error) {
        setUser(data);
        return { success: true };
      }
      return { success: false, error: error?.message || "更新失败" };
    } catch {
      return { success: false, error: "网络错误" };
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      onlineStatus,
      isOnline: onlineStatus === 'online',
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
      checkOnline,
    }),
    [user, isLoading, onlineStatus, login, register, logout, refreshUser, updateProfile, checkOnline]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
