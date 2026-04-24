import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Volume2, VolumeX, Save, RotateCcw, Skull } from 'lucide-react';
import { useToast } from './ToastNotification';
import { useSound } from './SoundManager';
import { useGame } from '@/game/GameContext';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { showToast } = useToast();
  const { isSoundEnabled, toggleSound } = useSound();
  const { state, setDifficulty: setGameDifficulty, resetGame } = useGame();
  const [touchStart, setTouchStart] = React.useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = React.useState({ x: 0, y: 0 });
  const [confirmResetGame, setConfirmResetGame] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => {
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 当滑动距离超过30px时关闭面板
    if (distance > 30) {
      onClose();
    }
  };

  const saveSettings = () => {
    showToast('设置已保存！', 'success');
  };

  const resetSettings = () => {
    if (!isSoundEnabled) {
      toggleSound();
    }
    setGameDifficulty('normal');
    showToast('设置已重置！', 'info');
  };

  const handleResetGame = () => {
    resetGame();
    setConfirmResetGame(false);
    onClose();
    showToast('游戏已重置！新的人生即将开始', 'success');
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
            onClick={onClose}
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
              className="glass-card p-6 relative w-full max-w-md max-h-[80vh] overflow-y-auto"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 min-h-[44px] min-w-[44px] rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-holo-blue" />
                <h2 className="text-2xl font-bold text-white">游戏设置</h2>
              </div>

              <div className="space-y-6">
                {/* Sound Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    {isSoundEnabled ? (
                      <Volume2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-white/40" />
                    )}
                    <div>
                      <h3 className="font-semibold text-white">音效</h3>
                      <p className="text-sm text-white/50">{isSoundEnabled ? '已开启' : '已关闭'}</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleSound}
                    className={`w-14 min-h-[44px] rounded-full transition-all relative ${
                      isSoundEnabled ? 'bg-green-500/30 border-green-500/50' : 'bg-white/10 border-white/20'
                    } border flex items-center`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                        isSoundEnabled ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Difficulty */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="font-semibold text-white mb-4">游戏难度</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'easy', label: '简单', desc: '轻松体验' },
                      { id: 'normal', label: '普通', desc: '标准难度' },
                      { id: 'hard', label: '困难', desc: '挑战模式' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setGameDifficulty(d.id as any)}
                        className={`p-3 min-h-[44px] rounded-lg text-center transition-all ${
                          state.difficulty === d.id
                            ? 'bg-holo-blue/30 border-holo-blue/50 text-holo-blue'
                            : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'
                        } border`}
                      >
                        <div className="font-bold">{d.label}</div>
                        <div className="text-xs mt-1 opacity-70">{d.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <div className="flex gap-3">
                    <button
                      onClick={resetSettings}
                      className="flex-1 py-3 min-h-[44px] rounded-lg bg-white/5 border border-white/20 text-white/60 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      重置设置
                    </button>
                    <button
                      onClick={() => {
                        saveSettings();
                        onClose();
                      }}
                      className="flex-1 py-3 min-h-[44px] rounded-lg bg-holo-blue/20 border border-holo-blue/50 text-holo-blue hover:bg-holo-blue/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                  </div>
                  
                  {/* Reset Game Button with Confirmation */}
                  <AlertDialog open={confirmResetGame} onOpenChange={setConfirmResetGame}>
                    <AlertDialogTrigger asChild>
                      <button
                        className="w-full py-3 min-h-[44px] rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all flex items-center justify-center gap-2"
                      >
                        <Skull className="w-4 h-4" />
                        重置游戏
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-card bg-zinc-900 border-zinc-700 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">重置游戏？</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60">
                          您确定要重置当前人生并重新开始吗？所有进度将丢失，此操作不可恢复！
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                          取消
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetGame} className="bg-red-500 hover:bg-red-600">
                          确认重置
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
