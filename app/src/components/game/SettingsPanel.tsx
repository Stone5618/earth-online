import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Volume2, VolumeX, Save, RotateCcw } from 'lucide-react';
import { useToast } from './ToastNotification';
import { useSound } from './SoundManager';
import { useGame } from '@/game/GameContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { showToast } = useToast();
  const { isSoundEnabled, toggleSound } = useSound();
  const { state, setDifficulty: setGameDifficulty } = useGame();

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
            <div className="glass-card p-6 relative w-full max-w-md max-h-[80vh] overflow-y-auto">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
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
                    className={`w-14 h-8 rounded-full transition-all relative ${
                      isSoundEnabled ? 'bg-green-500/30 border-green-500/50' : 'bg-white/10 border-white/20'
                    } border`}
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
                        className={`p-3 rounded-lg text-center transition-all ${
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
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={resetSettings}
                    className="flex-1 py-3 rounded-lg bg-white/5 border border-white/20 text-white/60 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重置
                  </button>
                  <button
                    onClick={() => {
                      saveSettings();
                      onClose();
                    }}
                    className="flex-1 py-3 rounded-lg bg-holo-blue/20 border border-holo-blue/50 text-holo-blue hover:bg-holo-blue/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    保存
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
