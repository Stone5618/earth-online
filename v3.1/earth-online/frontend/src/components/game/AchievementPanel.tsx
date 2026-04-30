import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, ChevronLeft } from 'lucide-react';
import { useGameState } from '@/game/GameContext';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';

interface AchievementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementPanel({ isOpen, onClose }: AchievementPanelProps) {
  const { state } = useGameState();
  const { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd, progress } = useSwipeToClose({
    onClose,
    direction: 'left',
    enableFeedback: true,
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const swipeTranslateX = progress > 0 ? -progress * 40 : 0;
  const swipeOpacity = progress > 0 ? 1 - progress * 0.25 : 1;

  // ESC 键关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // 焦点锁定与恢复
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      panelRef.current?.focus();
    }
    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

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
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          />

          {/* Panel Container */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            {/* Panel */}
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="achievement-panel-title"
              tabIndex={-1}
              onKeyDown={handleFocusTrap}
              className="w-full max-w-2xl max-h-[80vh] overflow-y-auto glass-card p-8 outline-none"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-gold" />
                <h2 id="achievement-panel-title" className="text-2xl font-orbitron font-bold text-white">成就列表</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 min-h-[44px] min-w-[44px] rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                aria-label="关闭成就面板"
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
                      <h4 className={`font-bold ${achievement.unlocked ? 'text-gold' : 'text-white/60'}`}>
                        {achievement.name}
                      </h4>
                      <p className={`text-sm mt-1 ${achievement.unlocked ? 'text-white/60' : 'text-white/60'}`}>
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
