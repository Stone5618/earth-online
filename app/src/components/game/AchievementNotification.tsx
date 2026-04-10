import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useGame } from '@/game/GameContext';
import { useSound } from './SoundManager';
import type { Achievement } from '@/game/gameState';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: (id: string) => void;
}

function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(achievement.id);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [achievement.id, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -100, scale: 0.8 }}
      className="max-w-sm"
    >
      <div className="glass-card p-6 border-gold/30 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute inset-0 bg-gold/10 pointer-events-none" />
        
        <button
          onClick={() => onClose(achievement.id)}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        <div className="flex items-start gap-4">
          <div className="text-5xl animate-bounce">
            {achievement.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-gold" />
              <span className="text-xs font-mono text-gold uppercase tracking-wider">
                成就解锁
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              {achievement.name}
            </h3>
            <p className="text-sm text-white/70">
              {achievement.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function AchievementNotificationProvider() {
  const { state, dispatch } = useGame();
  const { playSound } = useSound();
  const previousLengthRef = useRef(0);

  // 当有新成就解锁时播放音效
  useEffect(() => {
    if (state.newlyUnlockedAchievements.length > previousLengthRef.current) {
      playSound('achievement');
    }
    previousLengthRef.current = state.newlyUnlockedAchievements.length;
  }, [state.newlyUnlockedAchievements.length, playSound]);

  const closeSingleAchievement = (id: string) => {
    const filtered = state.newlyUnlockedAchievements.filter(a => a.id !== id);
    dispatch({ 
      type: 'CLEAR_ACHIEVEMENT_NOTIFICATIONS',
      payload: filtered 
    } as any);
  };

  return (
    <div className="fixed top-20 right-4 z-[1000] space-y-3">
      <AnimatePresence>
        {state.newlyUnlockedAchievements.map((achievement) => (
          <AchievementNotification
            key={achievement.id}
            achievement={achievement}
            onClose={closeSingleAchievement}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
