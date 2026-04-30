/**
 * RelationshipActionModal — 关系互动弹窗
 * 
 * Provides quick interaction interface for family members:
 * - Spouse interactions (date, gift, talk, travel)
 * - Child interactions (teach, play, scold, encourage)
 * - Shows interaction effects preview
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Coffee, Gift, MessageCircle, Plane, Book, Gamepad2, Megaphone, MessageSquare } from 'lucide-react';

interface RelationshipActionModalProps {
  target: {
    name: string;
    type: 'spouse' | 'child';
    relationship?: number;
  } | null;
  onClose: () => void;
  onInteract: (action: {
    type: string;
    target_name: string;
    target_type: 'spouse' | 'child';
    amount?: number;
  }) => void;
}

const SPOUSE_ACTIONS = [
  { type: 'date', icon: Coffee, label: '约会', desc: '一起度过美好时光', cost: 5000, intimacy: 5, mood: 10 },
  { type: 'gift', icon: Gift, label: '送礼', desc: '精心挑选的礼物', cost: 10000, intimacy: 8, mood: 15 },
  { type: 'talk', icon: MessageCircle, label: '谈心', desc: '深入交流增进感情', cost: 0, intimacy: 4, mood: 8 },
  { type: 'travel', icon: Plane, label: '旅行', desc: '一起去看世界', cost: 20000, intimacy: 10, mood: 20 },
];

const CHILD_ACTIONS = [
  { type: 'teach', icon: Book, label: '教导', desc: '传授知识和经验', cost: 0, relationship: 5 },
  { type: 'play', icon: Gamepad2, label: '玩耍', desc: '陪伴孩子快乐成长', cost: 1000, relationship: 8 },
  { type: 'scold', icon: Megaphone, label: '批评', desc: '纠正不良行为', cost: 0, relationship: -5 },
  { type: 'encourage', icon: MessageSquare, label: '鼓励', desc: '给予肯定和支持', cost: 0, relationship: 6 },
];

export const RelationshipActionModal = React.memo(function RelationshipActionModal({
  target,
  onClose,
  onInteract,
}: RelationshipActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleAction = useCallback((actionType: string, cost?: number) => {
    if (!target) return;
    onInteract({
      type: actionType,
      target_name: target.name,
      target_type: target.type,
      amount: cost || 0,
    });
    onClose();
  }, [target, onInteract, onClose]);

  if (!target) return null;

  const actions = target.type === 'spouse' ? SPOUSE_ACTIONS : CHILD_ACTIONS;
  const title = target.type === 'spouse' ? '配偶互动' : '子女互动';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border border-white/20 max-w-sm w-full mx-4 p-6 shadow-2xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              {title}
            </h3>
            <motion.button
              className="p-1 rounded-full hover:bg-white/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
            >
              <X className="w-5 h-5 text-white/50" />
            </motion.button>
          </div>

          {/* Target name */}
          <p className="text-white/60 text-sm mb-4">
            与 <span className="text-white font-medium">{target.name}</span> 互动
          </p>

          {/* Actions list */}
          <div className="space-y-2">
            {actions.map(({ type, icon: Icon, label, desc, cost, ...effects }) => (
              <motion.button
                key={type}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedAction === type
                    ? 'bg-white/10 border-pink-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAction(type, cost)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20">
                    <Icon className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className="text-white/40 text-xs">{desc}</p>
                  </div>
                  {cost !== undefined && cost > 0 && (
                    <span className="text-yellow-400 text-xs">
                      💰 {cost.toLocaleString()}
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
