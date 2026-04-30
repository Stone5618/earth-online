/**
 * RelationshipEndModal — 关系结束弹窗（离婚/丧偶）
 * 
 * Displays when a relationship ends, showing:
 * - Relationship summary
 * - Emotional message
 * - Impact on stats (mood, money, etc.)
 * - Acceptance/confirmation
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartCrack, X, AlertTriangle, ChevronRight, Heart, DollarSign, Brain } from 'lucide-react';

interface RelationshipEndModalProps {
  type: 'divorce' | 'widowed' | null;
  spouse: {
    name: string;
    relationship_years: number;
    intimacy: number;
  } | null;
  effects: {
    mood_change: number;
    money_change: number;
    karma_change: number;
  };
  onClose: () => void;
  onConfirm?: () => void;
}

const END_MESSAGES = {
  divorce: {
    title: '💔 婚姻结束',
    description: '一段感情的终结，也是新的开始',
    icon: HeartCrack,
    color: 'from-red-500 to-orange-500',
    borderColor: 'border-red-500/30',
  },
  widowed: {
    title: '🕊️ 配偶离世',
    description: '失去挚爱的痛苦，需要时间治愈',
    icon: HeartCrack,
    color: 'from-gray-500 to-slate-500',
    borderColor: 'border-gray-500/30',
  },
};

export const RelationshipEndModal = React.memo(function RelationshipEndModal({
  type,
  spouse,
  effects,
  onClose,
  onConfirm,
}: RelationshipEndModalProps) {
  const [showEffects, setShowEffects] = useState(false);

  const handleConfirm = useCallback(() => {
    onConfirm?.();
    onClose();
  }, [onConfirm, onClose]);

  if (!type || !spouse) return null;

  const config = END_MESSAGES[type];
  const Icon = config.icon;

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
          className={`bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border ${config.borderColor} max-w-md w-full mx-4 p-6 shadow-2xl`}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-bold flex items-center gap-2">
              <Icon className="w-5 h-5 text-red-400" />
              {config.title}
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

          {/* Description */}
          <p className="text-white/50 text-sm mb-6 text-center italic">
            "{config.description}"
          </p>

          {/* Spouse info */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-lg">
                {spouse.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{spouse.name}</p>
                <p className="text-white/40 text-xs">
                  婚龄：{spouse.relationship_years}年 · 亲密度：{spouse.intimacy}%
                </p>
              </div>
            </div>
          </div>

          {/* Effects section */}
          <motion.button
            className="w-full text-left mb-6"
            whileHover={{ scale: 1.01 }}
            onClick={() => setShowEffects(!showEffects)}
          >
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-white text-sm">影响预览</span>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-white/40 transition-transform ${
                  showEffects ? 'rotate-90' : ''
                }`}
              />
            </div>
          </motion.button>

          <AnimatePresence>
            {showEffects && (
              <motion.div
                className="space-y-3 mb-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {/* Mood change */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm">心情</span>
                  </div>
                  <span className={`font-medium ${effects.mood_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {effects.mood_change > 0 ? '+' : ''}{effects.mood_change}
                  </span>
                </div>

                {/* Money change */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm">财产</span>
                  </div>
                  <span className={`font-medium ${effects.money_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {effects.money_change > 0 ? '+' : ''}{effects.money_change > 0 ? effects.money_change.toLocaleString() : effects.money_change.toLocaleString()}
                  </span>
                </div>

                {/* Karma change */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-purple-400" />
                    <span className="text-white text-sm">因果</span>
                  </div>
                  <span className={`font-medium ${effects.karma_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {effects.karma_change > 0 ? '+' : ''}{effects.karma_change}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action button */}
          <motion.button
            className={`w-full bg-gradient-to-r ${config.color} text-white py-3 rounded-xl font-medium`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
          >
            接受现实，继续前行
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
