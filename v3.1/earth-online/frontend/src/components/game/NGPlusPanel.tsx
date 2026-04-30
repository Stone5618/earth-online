import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Trophy, Star, Zap, Coins, Heart, Brain, Sparkles, ChevronLeft } from 'lucide-react';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';

interface LegacyBreakdown {
  wealth: number;
  education: number;
  career: number;
  family: number;
  skills: number;
  karma: number;
  achievement: number;
  longevity: number;
}

interface LegacyData {
  total_score: number;
  tier: string;
  tier_label: string;
  bonus_multiplier: number;
  color: string;
  breakdown: LegacyBreakdown;
  ng_plus_count: number;
}

interface NGPlusPanelProps {
  isOpen: boolean;
  onClose: () => void;
  legacyData?: LegacyData | null;
  onStartNGPlus?: () => void;
}

const BREAKDOWN_LABELS: Record<string, string> = {
  wealth: '财富',
  education: '教育',
  career: '事业',
  family: '家庭',
  skills: '技能',
  karma: '福报',
  achievement: '成就',
  longevity: '寿命',
};

const TIER_EMOJIS: Record<string, string> = {
  E: '😐', D: '🙂', C: '😊', B: '😄', A: '😎', S: '👑', SS: '⭐', SSS: '🌟',
};

export function NGPlusPanel({ isOpen, onClose, legacyData = null, onStartNGPlus }: NGPlusPanelProps) {
  const { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd, progress } = useSwipeToClose({
    onClose,
    direction: 'left',
    enableFeedback: true,
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const swipeTranslateX = progress > 0 ? -progress * 40 : 0;
  const swipeOpacity = progress > 0 ? 1 - progress * 0.25 : 1;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      panelRef.current?.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
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
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            className="fixed inset-0 bg-black/60 z-[2000]"
          />

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
              aria-labelledby="ngplus-panel-title"
              tabIndex={-1}
              onKeyDown={handleFocusTrap}
              className="glass-card p-6 relative w-full max-w-md max-h-[80vh] overflow-y-auto outline-none"
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
                aria-label="关闭新游戏+面板"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <Crown className="w-6 h-6 text-gold" />
                <div>
                  <h2 id="ngplus-panel-title" className="text-2xl font-bold text-white">
                    新游戏+ 家族传承
                  </h2>
                  {legacyData && legacyData.ng_plus_count > 0 && (
                    <p className="text-sm text-white/50">
                      第 {legacyData.ng_plus_count} 次传承
                    </p>
                  )}
                </div>
              </div>

              {legacyData ? (
                <div className="space-y-6">
                  {/* Tier display */}
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
                    <div className="text-5xl mb-2">{TIER_EMOJIS[legacyData.tier] || '😐'}</div>
                    <div className="text-4xl font-black" style={{ color: legacyData.color }}>
                      {legacyData.tier} - {legacyData.tier_label}
                    </div>
                    <div className="text-lg text-white/60 mt-1">
                      传承分数: {legacyData.total_score}
                    </div>
                    <div className="text-sm text-gold mt-2">
                      ✨ 后代加成: x{legacyData.bonus_multiplier.toFixed(2)}
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5 text-gold" />
                      传承分数构成
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(BREAKDOWN_LABELS).map(([key, label]) => {
                        const value = legacyData.breakdown[key as keyof LegacyBreakdown] || 0;
                        if (value === 0) return null;
                        const Icon = key === 'wealth' ? Coins : key === 'education' ? Brain : key === 'career' ? Zap : key === 'family' ? Heart : key === 'skills' ? Sparkles : Star;
                        return (
                          <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-white/40" />
                              <span className="text-sm text-white/70">{label}</span>
                            </div>
                            <span className="text-sm font-mono text-white">+{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bonuses description */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="font-bold text-white mb-2">后代继承加成</h3>
                    <ul className="text-sm text-white/60 space-y-1">
                      <li>• 运气 +{Math.round(5 * legacyData.bonus_multiplier)}</li>
                      <li>• 福报 +{Math.round(5 * legacyData.bonus_multiplier)}</li>
                      {['A', 'S', 'SS', 'SSS'].includes(legacyData.tier) && (
                        <li>• 智力 +{Math.round(5 * legacyData.bonus_multiplier)}</li>
                      )}
                      {['B', 'A', 'S', 'SS', 'SSS'].includes(legacyData.tier) && (
                        <li>• 魅力 +{Math.round(3 * legacyData.bonus_multiplier)}</li>
                      )}
                      {['S', 'SS', 'SSS'].includes(legacyData.tier) && (
                        <li>• 起始金钱 +¥{Math.round(10000 * legacyData.bonus_multiplier).toLocaleString()}</li>
                      )}
                      {legacyData.ng_plus_count > 0 && (
                        <li>• NG+ 额外加成: +{legacyData.ng_plus_count * 5}%</li>
                      )}
                    </ul>
                  </div>

                  {/* Start NG+ button */}
                  {onStartNGPlus && (
                    <button
                      onClick={onStartNGPlus}
                      className="w-full py-4 min-h-[56px] rounded-xl bg-gradient-to-r from-gold/20 to-yellow-500/20 border border-gold/50 text-gold hover:from-gold/30 hover:to-yellow-500/30 transition-all font-bold text-lg flex items-center justify-center gap-2"
                    >
                      <Crown className="w-5 h-5" />
                      开启新人生
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Crown className="w-12 h-12 text-gold/30 mx-auto mb-3" />
                  <p className="text-white/50">完成一次人生后即可开启新游戏+</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
