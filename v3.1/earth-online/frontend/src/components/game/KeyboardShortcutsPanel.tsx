import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Search, HelpCircle } from 'lucide-react';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';

interface ShortcutItem {
  key: string;
  description: string;
  category: 'general' | 'gameplay' | 'navigation' | 'panel';
}

const SHORTCUTS: ShortcutItem[] = [
  // General
  { key: 'Esc', description: '关闭当前面板/弹窗', category: 'general' },
  { key: '?', description: '打开/关闭快捷键面板', category: 'general' },
  { key: 'Ctrl + S', description: '保存游戏', category: 'general' },
  { key: 'Ctrl + Z', description: '撤销上一步（如果可用）', category: 'general' },

  // Gameplay
  { key: 'Space', description: '确认选择/继续', category: 'gameplay' },
  { key: '1', description: '选择第一个选项', category: 'gameplay' },
  { key: '2', description: '选择第二个选项', category: 'gameplay' },
  { key: '3', description: '选择第三个选项', category: 'gameplay' },
  { key: 'R', description: '快速重新游戏', category: 'gameplay' },

  // Navigation
  { key: '←', description: '上一个面板/页签', category: 'navigation' },
  { key: '→', description: '下一个面板/页签', category: 'navigation' },
  { key: '↑', description: '向上滚动', category: 'navigation' },
  { key: '↓', description: '向下滚动', category: 'navigation' },
  { key: 'Home', description: '滚动到顶部', category: 'navigation' },
  { key: 'End', description: '滚动到底部', category: 'navigation' },

  // Panel quick access
  { key: 'S', description: '属性面板', category: 'panel' },
  { key: 'K', description: '技能面板', category: 'panel' },
  { key: 'A', description: '成就面板', category: 'panel' },
  { key: 'F', description: '家庭面板', category: 'panel' },
  { key: 'L', description: '排行榜', category: 'panel' },
  { key: 'H', description: '设置面板', category: 'panel' },
  { key: 'I', description: '需求面板', category: 'panel' },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  general: { label: '通用快捷键', color: 'text-holo-blue' },
  gameplay: { label: '游戏操作', color: 'text-green-400' },
  navigation: { label: '导航控制', color: 'text-yellow-400' },
  panel: { label: '面板快捷', color: 'text-purple-400' },
};

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsPanel({ isOpen, onClose }: KeyboardShortcutsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd } = useSwipeToClose({ onClose });
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      setTimeout(() => searchInputRef.current?.focus(), 100);
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

  const filteredShortcuts = SHORTCUTS.filter((s) => {
    const matchesSearch =
      searchQuery === '' ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedShortcuts = filteredShortcuts.reduce<Record<string, ShortcutItem[]>>(
    (groups, shortcut) => {
      if (!groups[shortcut.category]) {
        groups[shortcut.category] = [];
      }
      groups[shortcut.category].push(shortcut);
      return groups;
    },
    {}
  );

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
            className="fixed inset-0 bg-black/60 z-[2500]"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-0 z-[2501] flex items-center justify-center p-4"
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="shortcuts-panel-title"
              tabIndex={-1}
              onKeyDown={handleFocusTrap}
              className="glass-card relative w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col outline-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Keyboard className="w-6 h-6 text-holo-blue" />
                  <h2 id="shortcuts-panel-title" className="text-2xl font-bold text-white">
                    快捷键
                  </h2>
                  <span className="text-sm text-white/50 font-mono">(按 ? 打开)</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 min-h-[44px] min-w-[44px] rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
                  aria-label="关闭快捷键面板"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              {/* Search bar */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索快捷键..."
                    className="w-full pl-10 pr-4 py-2 min-h-[44px] rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-holo-blue/50 focus:ring-1 focus:ring-holo-blue/30"
                  />
                </div>
              </div>

              {/* Category filter */}
              <div className="px-4 pt-3 flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 py-1.5 min-h-[44px] rounded-full text-sm whitespace-nowrap transition-all ${
                    activeCategory === 'all'
                      ? 'bg-holo-blue/30 text-holo-blue border-holo-blue/50'
                      : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                  } border`}
                >
                  全部
                </button>
                {Object.entries(CATEGORY_LABELS).map(([key, { label, color }]) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`px-3 py-1.5 min-h-[44px] rounded-full text-sm whitespace-nowrap transition-all ${
                      activeCategory === key
                        ? `bg-white/10 ${color} border-white/30`
                        : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                    } border`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Shortcuts list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {Object.keys(groupedShortcuts).length === 0 ? (
                  <div className="text-center py-12 text-white/50">
                    <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>未找到匹配的快捷键</p>
                  </div>
                ) : (
                  Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                    <div key={category}>
                      <h3 className={`text-sm font-semibold mb-3 ${CATEGORY_LABELS[category]?.color}`}>
                        {CATEGORY_LABELS[category]?.label}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {shortcuts.map((shortcut, index) => (
                          <div
                            key={`${shortcut.key}-${index}`}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            <span className="text-white/80 text-sm">{shortcut.description}</span>
                            <kbd className="px-2 py-1 min-w-[32px] text-center rounded bg-white/10 border border-white/20 text-white font-mono text-xs">
                              {shortcut.key}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="px-6 py-3 border-t border-white/10 text-center text-xs text-white/40">
                提示：按 <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono">?</kbd> 可随时打开此面板
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
