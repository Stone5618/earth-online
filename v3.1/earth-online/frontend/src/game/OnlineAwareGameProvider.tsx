/**
 * OnlineAwareGameProvider — wraps the original GameProvider and adds backend awareness.
 * 
 * This is the SINGLE SOURCE OF TRUTH for online/offline state and character ID.
 * 
 * When backend is online: events come from backend, state syncs via API.
 * When backend is offline: falls through to original pure-frontend logic.
 * 
 * Strategy: This is a thin wrapper. It doesn't replace the original GameContext,
 * but adds a pre-hook that intercepts event handling when online.
 */

import React, { createContext, useContext, useCallback, useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/client';
import { GameProvider } from './GameContext';

export type OnlineStatus = 'checking' | 'online' | 'offline';

export interface OnlineAwareGameContextType {
  onlineStatus: OnlineStatus;
  checkOnline: () => Promise<boolean>;
  tryOnlineMode: (username: string, password: string) => Promise<boolean>;
  tryRegister: (username: string, password: string) => Promise<boolean>;
  switchToOfflineMode: () => void;
  backendCharId: number | null;
  setBackendCharId: (id: number | null) => void;
  isOnline: boolean;
}

const OnlineAwareContext = createContext<OnlineAwareGameContextType | null>(null);

const CHAR_ID_STORAGE_KEY = 'earth-online-char-id';

export function OnlineAwareGameProvider({ children, isPaused }: { children: ReactNode; isPaused?: boolean }) {
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>('offline');
  const [backendCharId, setBackendCharIdState] = useState<number | null>(() => {
    // 从 localStorage 恢复 charId
    const saved = localStorage.getItem(CHAR_ID_STORAGE_KEY);
    return saved ? parseInt(saved, 10) : null;
  });

  // 持久化 charId 到 localStorage
  const setBackendCharId = useCallback((id: number | null) => {
    setBackendCharIdState(id);
    if (id !== null) {
      localStorage.setItem(CHAR_ID_STORAGE_KEY, id.toString());
    } else {
      localStorage.removeItem(CHAR_ID_STORAGE_KEY);
    }
  }, []);

  const checkOnline = useCallback(async () => {
    setOnlineStatus('checking');
    const { success } = await api.ping();
    setOnlineStatus(success ? 'online' : 'offline');
    return success;
  }, []);

  const tryOnline = useCallback(async (username: string, password: string) => {
    const { success } = await api.login(username, password);
    if (success) {
      setOnlineStatus('online');
      return true;
    }
    return false;
  }, []);

  const tryReg = useCallback(async (username: string, password: string) => {
    const { success } = await api.register(username, password);
    if (success) {
      setOnlineStatus('online');
      return true;
    }
    return false;
  }, []);

  const switchToOfflineMode = useCallback(() => {
    setOnlineStatus('offline');
    setBackendCharId(null);
  }, []);

  const value = useMemo(
    () => ({
      onlineStatus,
      checkOnline,
      tryOnlineMode: tryOnline,
      tryRegister: tryReg,
      switchToOfflineMode,
      backendCharId,
      setBackendCharId,
      isOnline: onlineStatus === 'online',
    }),
    [onlineStatus, checkOnline, tryOnline, tryReg, switchToOfflineMode, backendCharId],
  );

  return (
    <OnlineAwareContext.Provider value={value}>
      <GameProvider charId={backendCharId} isPaused={isPaused}>
        {children}
      </GameProvider>
    </OnlineAwareContext.Provider>
  );
}

export function useOnlineAwareGame(): OnlineAwareGameContextType {
  const ctx = useContext(OnlineAwareContext);
  if (!ctx) throw new Error('useOnlineAwareGame must be used within OnlineAwareGameProvider');
  return ctx;
}
