import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Play, Trash2, Calendar, User } from 'lucide-react';
import { useGame } from '@/game/GameContext';
import { useToast } from './ToastNotification';

interface SaveSlotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
}

export function SaveSlotPanel({ isOpen, onClose, mode }: SaveSlotPanelProps) {
  const { saveGame, loadGame, deleteSave, getSaveInfo } = useGame();
  const { showToast } = useToast();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = (slot: number) => {
    saveGame(slot);
    showToast(`存档 ${slot} 已保存！`, 'success');
    onClose();
  };

  const handleLoad = (slot: number) => {
    const success = loadGame(slot);
    if (success) {
      showToast(`存档 ${slot} 已加载！`, 'success');
      onClose();
    } else {
      showToast('存档不存在！', 'error');
    }
  };

  const handleDelete = (slot: number) => {
    if (confirm(`确定要删除存档 ${slot} 吗？`)) {
      deleteSave(slot);
      showToast(`存档 ${slot} 已删除！`, 'info');
    }
  };

  const slots = [1, 2, 3];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[2000]"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2001] w-full max-w-lg px-4"
          >
            <div className="glass-card p-6 relative max-h-[80vh] overflow-y-auto">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                {mode === 'save' ? (
                  <Save className="w-6 h-6 text-holo-blue" />
                ) : (
                  <Play className="w-6 h-6 text-holo-blue" />
                )}
                <h2 className="text-2xl font-bold text-white">
                  {mode === 'save' ? '保存游戏' : '继续游戏'}
                </h2>
              </div>

              <div className="space-y-3">
                {slots.map((slot) => {
                  const info = getSaveInfo(slot);
                  return (
                    <div
                      key={slot}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-holo-blue/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-holo-blue/20 border border-holo-blue/40 flex items-center justify-center">
                            <span className="text-xl font-bold text-holo-blue">{slot}</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-white">存档槽位 {slot}</h3>
                            {info.hasSave ? (
                              <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {info.age} 岁
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {info.timestamp && formatTime(info.timestamp)}
                                </span>
                              </div>
                            ) : (
                              <p className="text-sm text-white/30 mt-1">空槽位</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {mode === 'save' ? (
                            <>
                              {info.hasSave && (
                                <button
                                  onClick={() => handleDelete(slot)}
                                  className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                                  title="删除存档"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleSave(slot)}
                                className="px-4 py-2 rounded-lg bg-holo-blue/20 border border-holo-blue/50 text-holo-blue hover:bg-holo-blue/30 transition-all flex items-center gap-2"
                              >
                                <Save className="w-4 h-4" />
                                {info.hasSave ? '覆盖' : '保存'}
                              </button>
                            </>
                          ) : (
                            <>
                              {info.hasSave && (
                                <>
                                  <button
                                    onClick={() => handleDelete(slot)}
                                    className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                                    title="删除存档"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleLoad(slot)}
                                    className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 transition-all flex items-center gap-2"
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
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
