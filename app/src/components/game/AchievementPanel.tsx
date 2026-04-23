import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { useGame } from '@/game/GameContext';

interface AchievementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementPanel({ isOpen, onClose }: AchievementPanelProps) {
  const { state } = useGame();
  const [touchStart, setTouchStart] = React.useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = React.useState({ x: 0, y: 0 });

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel Container */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            {/* Panel */}
            <motion.div
              className="w-full max-w-2xl max-h-[80vh] overflow-y-auto glass-card p-8"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-gold" />
                <h2 className="text-2xl font-orbitron font-bold text-white">成就列表</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 min-h-[44px] min-w-[44px] rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                <X className="w-6 h-6 text-white/60" />
              </button>
            </div>

            {/* Stats */}
            <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white/60">已解锁成就</span>
                <span className="text-xl font-bold text-holo-blue">
                  {state.achievements.filter(a => a.unlocked).length} / {state.achievements.length}
                </span>
              </div>
              <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold to-holo-blue"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(state.achievements.filter(a => a.unlocked).length / state.achievements.length) * 100}%`
                  }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-2 gap-4">
              {state.achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border ${
                    achievement.unlocked
                      ? 'bg-gold/10 border-gold/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-4xl ${!achievement.unlocked ? 'grayscale opacity-30' : ''}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${achievement.unlocked ? 'text-gold' : 'text-white/40'}`}>
                        {achievement.name}
                      </h4>
                      <p className={`text-sm mt-1 ${achievement.unlocked ? 'text-white/60' : 'text-white/30'}`}>
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-xs text-black font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
