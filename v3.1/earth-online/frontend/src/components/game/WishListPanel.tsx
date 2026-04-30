import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Heart, Award, Briefcase, GraduationCap, MapPin, Shield, ChevronDown } from 'lucide-react';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';

interface Wish {
  id: string;
  text: string;
  category: string;
  category_label: string;
  category_icon: string;
  completed: boolean;
  progress: number;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  wealth: Star,
  education: GraduationCap,
  family: Heart,
  career: Briefcase,
  health: Shield,
  travel: MapPin,
};

const CATEGORY_COLORS: Record<string, string> = {
  wealth: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  education: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  family: 'text-pink-400 border-pink-400/30 bg-pink-400/10',
  career: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  health: 'text-green-400 border-green-400/30 bg-green-400/10',
  travel: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
};

interface WishListPanelProps {
  isOpen: boolean;
  onClose: () => void;
  wishes?: Wish[];
  onAddWish?: (wishId: string) => void;
}

// Default wishes for demo/display
const DEFAULT_WISHES: Wish[] = [
  { id: 'wish_wealth_1', text: '存到第一桶金（10万元）', category: 'wealth', category_label: '财富', category_icon: '💰', completed: false, progress: 0 },
  { id: 'wish_wealth_2', text: '成为百万富翁', category: 'wealth', category_label: '财富', category_icon: '💰', completed: false, progress: 0 },
  { id: 'wish_edu_1', text: '完成中学教育', category: 'education', category_label: '学业', category_icon: '📚', completed: false, progress: 0 },
  { id: 'wish_edu_2', text: '考上大学', category: 'education', category_label: '学业', category_icon: '📚', completed: false, progress: 0 },
  { id: 'wish_family_1', text: '找到真爱', category: 'family', category_label: '家庭', category_icon: '👨‍👩‍👧', completed: false, progress: 0 },
  { id: 'wish_family_3', text: '养育孩子', category: 'family', category_label: '家庭', category_icon: '👨‍👩‍👧', completed: false, progress: 0 },
  { id: 'wish_career_1', text: '找到一份稳定工作', category: 'career', category_label: '事业', category_icon: '💼', completed: false, progress: 0 },
  { id: 'wish_career_3', text: '创业成功', category: 'career', category_label: '事业', category_icon: '💼', completed: false, progress: 0 },
  { id: 'wish_health_2', text: '活到80岁以上', category: 'health', category_label: '健康', category_icon: '❤️', completed: false, progress: 0 },
  { id: 'wish_travel_1', text: '去一次远方旅行', category: 'travel', category_label: '旅行', category_icon: '✈️', completed: false, progress: 0 },
];

export function WishListPanel({ isOpen, onClose, wishes = DEFAULT_WISHES, onAddWish }: WishListPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  // Focus management
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

  const filteredWishes = selectedCategory === 'all'
    ? wishes
    : wishes.filter(w => w.category === selectedCategory);

  const completedCount = wishes.filter(w => w.completed).length;
  const totalCount = wishes.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
              aria-labelledby="wish-panel-title"
              tabIndex={-1}
              onKeyDown={handleFocusTrap}
              className="glass-card relative w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col outline-none"
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <div className="flex flex-col items-center gap-1">
                    <ChevronDown className="w-5 h-5 text-white/40 -rotate-90" />
                    <div className="w-1 rounded-full bg-white/20" style={{ height: `${Math.max(20, progress * 50)}px` }} />
                    <ChevronDown className="w-5 h-5 text-white/40 -rotate-90" />
                  </div>
                </motion.div>
              )}
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-gold" />
                  <div>
                    <h2 id="wish-panel-title" className="text-2xl font-bold text-white">人生愿望</h2>
                    <p className="text-xs text-white/50">{completedCount}/{totalCount} 已完成 · {progressPercent}%</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 min-h-[44px] min-w-[44px] rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
                  aria-label="关闭愿望清单"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="px-6 pt-4">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gold to-yellow-300 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Category filter */}
              <div className="px-4 pt-3 flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 min-h-[44px] rounded-full text-sm whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-gold/30 text-gold border-gold/50'
                      : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                  } border`}
                >
                  全部
                </button>
                {Object.entries(CATEGORY_ICONS).map(([key, Icon]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-1.5 min-h-[44px] rounded-full text-sm whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedCategory === key
                        ? CATEGORY_COLORS[key]
                        : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                    } border`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {key === 'wealth' ? '财富' : key === 'education' ? '学业' : key === 'family' ? '家庭' : key === 'career' ? '事业' : key === 'health' ? '健康' : '旅行'}
                  </button>
                ))}
              </div>

              {/* Wish list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {filteredWishes.length === 0 ? (
                  <div className="text-center py-12 text-white/50">
                    <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>暂无愿望</p>
                  </div>
                ) : (
                  filteredWishes.map((wish) => {
                    const IconComponent = CATEGORY_ICONS[wish.category] || Star;
                    return (
                      <motion.div
                        key={wish.id}
                        className={`p-4 rounded-xl border transition-all ${
                          wish.completed
                            ? 'bg-gold/10 border-gold/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-2 rounded-lg ${CATEGORY_COLORS[wish.category] || 'text-white/50 border-white/10 bg-white/5'} border`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white/80 text-sm">{wish.category_icon}</span>
                              <span className={`text-sm ${wish.completed ? 'text-gold line-through' : 'text-white'}`}>
                                {wish.text}
                              </span>
                            </div>
                            {wish.completed && (
                              <span className="text-xs text-gold mt-1 block">✨ 已实现</span>
                            )}
                          </div>
                          {wish.completed ? (
                            <Award className="w-5 h-5 text-gold flex-shrink-0" />
                          ) : (
                            <button
                              onClick={() => onAddWish?.(wish.id)}
                              className="p-1.5 min-h-[32px] min-w-[32px] rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors flex items-center justify-center"
                              aria-label={`添加愿望: ${wish.text}`}
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-white/10 text-center text-xs text-white/40">
                实现愿望可获得额外心情、福报和人生分数加成
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
