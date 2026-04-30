import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Play, Trash2, Calendar, User, Cloud, ChevronLeft } from 'lucide-react';
import { useGameState, useGameActions } from '@/game/GameContext';
import { useToast } from './ToastNotification';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';
import { useESCToClose } from '@/hooks/useKeyboardShortcuts';
import { useAuth } from '@/contexts/AuthContext';
import { useOnlineAwareGame } from '@/game/OnlineAwareGameProvider';
import { fetchCloudSaves, saveToCloud, loadFromCloud, deleteCloudSave, CloudSaveInfo, saveGame as saveGameToLocal } from '@/game/core/gameSaver';

interface SaveSlotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
}

export function SaveSlotPanel({ isOpen, onClose, mode }: SaveSlotPanelProps) {
  const { saveGame, loadGame, dispatch } = useGameActions();
  const { state: gameState } = useGameState();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { setBackendCharId } = useOnlineAwareGame();
  const { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd, progress } = useSwipeToClose({
    onClose,
    direction: 'left',
    enableFeedback: true,
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  const [cloudSaves, setCloudSaves] = useState<CloudSaveInfo[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  
  const slots = [1, 2, 3];
  
  const swipeTranslateX = progress > 0 ? -progress * 40 : 0;
  const swipeOpacity = progress > 0 ? 1 - progress * 0.25 : 1;
  
  useESCToClose(onClose, isOpen);
  
  // 焦点锁定与恢复
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      panelRef.current?.focus();
      
      if (isAuthenticated) {
        loadCloudSaves();
      }
    }
    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, isAuthenticated]);
  
  const loadCloudSaves = async () => {
    setIsLoadingCloud(true);
    try {
      const saves = await fetchCloudSaves();
      setCloudSaves(saves);
    } catch (error) {
      console.error('加载存档失败:', error);
      showToast('加载存档失败', 'error');
    } finally {
      setIsLoadingCloud(false);
    }
  };
  
  const handleFocusTrap = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);
  
  const formatTime = (timestamp: number | Date) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // 存档操作（已登录时使用云端）
  const handleSaveToCloud = async (slot: number) => {
    if (!gameState) return;
    if (!isAuthenticated) {
      showToast('请先登录', 'error');
      return;
    }
    setIsLoadingCloud(true);
    try {
      // 从 localStorage 获取当前 charId
      const charIdStr = localStorage.getItem('earth-online-char-id');
      const charId = charIdStr ? parseInt(charIdStr, 10) : null;
      
      const success = await saveToCloud(gameState, slot, charId);
      if (success) {
        showToast(`存档 ${slot} 已保存到云端！`, 'success');
        await loadCloudSaves();
        onClose();
      } else {
        showToast('保存到云端失败', 'error');
      }
    } catch (error) {
      console.error('保存到云端失败:', error);
      showToast('保存到云端失败', 'error');
    } finally {
      setIsLoadingCloud(false);
    }
  };
  
  // 读档操作（已登录时使用云端）
  const handleLoadFromCloud = async (slot: number) => {
    if (!isAuthenticated) {
      showToast('请先登录', 'error');
      return;
    }
    setIsLoadingCloud(true);
    try {
      const result = await loadFromCloud(slot);
      if (!result) {
        showToast('加载云存档失败', 'error');
        return;
      }
      if (result.success && result.data) {
        // 恢复 charId 关联，使事件系统能正常工作
        if (result.charId) {
          setBackendCharId(result.charId);
        }
        // 直接加载云端存档，避免本地存储中间环节
        dispatch({ type: 'LOAD_GAME', payload: result.data });
        showToast(`云存档 ${slot} 已加载！`, 'success');
        onClose();
      } else {
        showToast('云存档不存在！', 'error');
      }
    } catch (error) {
      console.error('加载云存档失败:', error);
      showToast('加载云存档失败', 'error');
    } finally {
      setIsLoadingCloud(false);
    }
  };
  
  const handleDeleteCloud = async (slot: number) => {
    if (!isAuthenticated) return;
    
    if (confirm(`确定要删除云端存档 ${slot} 吗？`)) {
      setIsLoadingCloud(true);
      try {
        const success = await deleteCloudSave(slot);
        if (success) {
          showToast(`云端存档 ${slot} 已删除！`, 'info');
          await loadCloudSaves();
        } else {
          showToast('删除云存档失败', 'error');
        }
      } catch (error) {
        console.error('删除云存档失败:', error);
        showToast('删除云存档失败', 'error');
      } finally {
        setIsLoadingCloud(false);
      }
    }
  };
  
  // 渲染槽位（云端）
  const renderSlot = (slot: number) => {
    const saveInfo = cloudSaves.find(s => s.slot === slot) || { hasSave: false, slot };
    return (
      <div
        key={`cloud-${slot}`}
        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-holo-blue/30 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
              <span className="text-xl font-bold text-purple-400">{slot}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white">云存档 - 槽位 {slot}</h3>
                <Cloud className="w-3 h-3 text-purple-400" />
              </div>
              {saveInfo.hasSave ? (
                <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {saveInfo.age} 岁
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {saveInfo.createdTime && formatTime(saveInfo.createdTime)}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-white/60 mt-1">空槽位</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {mode === 'save' ? (
              <>
                {saveInfo.hasSave && (
                  <button
                    onClick={() => handleDeleteCloud(slot)}
                    className="p-2 min-h-[44px] min-w-[44px] rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors flex items-center justify-center"
                    aria-label={`删除云存档 ${slot}`}
                    title="删除存档"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleSaveToCloud(slot)}
                  className="px-4 py-2 min-h-[44px] rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-400 hover:bg-purple-500/30 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saveInfo.hasSave ? '覆盖' : '保存'}
                </button>
              </>
            ) : (
              <>
                {saveInfo.hasSave && (
                  <>
                    <button
                      onClick={() => handleDeleteCloud(slot)}
                      className="p-2 min-h-[44px] min-w-[44px] rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors flex items-center justify-center"
                      aria-label={`删除云存档 ${slot}`}
                      title="删除存档"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleLoadFromCloud(slot)}
                      className="px-4 py-2 min-h-[44px] rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 transition-all flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      加载
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            className="fixed inset-0 bg-black/60 z-[2000]"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-0 z-[2001] flex items-center justify-center p-4"
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="save-slot-panel-title"
              tabIndex={-1}
              onKeyDown={handleFocusTrap}
              className="glass-card p-6 relative w-full max-w-md max-h-[85vh] overflow-y-auto outline-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                transform: progress > 0 ? `translateX(${swipeTranslateX}px)` : undefined,
                opacity: swipeOpacity,
                transition: progress > 0 ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
              }}
            >
              {progress > 0.1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: progress }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-50"
                >
                  <div className="flex flex-col items-center gap-1">
                    <ChevronLeft className="w-5 h-5 text-white/40" />
                    <div className="w-1 rounded-full bg-white/20" style={{ height: `${Math.max(20, progress * 50)}px` }} />
                    <ChevronLeft className="w-5 h-5 text-white/40" />
                  </div>
                </motion.div>
              )}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 min-h-[44px] min-w-[44px] rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
                aria-label="关闭存档面板"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                {mode === 'save' ? (
                  <Save className="w-6 h-6 text-holo-blue" />
                ) : (
                  <Play className="w-6 h-6 text-holo-blue" />
                )}
                <h2 id="save-slot-panel-title" className="text-2xl font-bold text-white">
                  {mode === 'save' ? '保存游戏' : '继续游戏'}
                </h2>
              </div>
              
              {/* 存储类型显示 */}
              <div className="flex gap-2 mb-6">
                <div className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 bg-purple-500/30 border border-purple-400/50 text-purple-400">
                  <Cloud className="w-4 h-4" />
                  云端存档
                </div>
              </div>
              
              <div className="space-y-3">
                {slots.map(renderSlot)}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
