/**
 * ChildDetailModal — 子女详情弹窗
 * 
 * Displays detailed information about a child including:
 * - Personal info (name, age, gender)
 * - Relationship quality
 * - Traits
 * - Interaction buttons (teach, play, scold, encourage)
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, Star, Heart, X, Book, Gamepad2, MessageSquare, Megaphone } from 'lucide-react';

interface ChildDetailModalProps {
  child: {
    id: string;
    name: string;
    age: number;
    gender: 'male' | 'female';
    relationship: 'good' | 'neutral' | 'poor';
    traits?: string[];
    born_at: number;
  } | null;
  onClose: () => void;
  onInteract?: (type: 'teach' | 'play' | 'scold' | 'encourage') => void;
}

const GENDER_CONFIG = {
  male: { icon: '♂', color: 'from-blue-400 to-cyan-400', label: '男孩' },
  female: { icon: '♀', color: 'from-pink-400 to-rose-400', label: '女孩' },
};

const RELATIONSHIP_CONFIG = {
  good: { emoji: '💕', label: '亲密', color: 'text-green-400' },
  neutral: { emoji: '👍', label: '一般', color: 'text-yellow-400' },
  poor: { emoji: '😔', label: '疏远', color: 'text-red-400' },
};

const INTERACTION_BUTTONS = [
  { type: 'teach' as const, icon: Book, label: '教导', color: 'from-blue-500 to-indigo-500', desc: '增长知识' },
  { type: 'play' as const, icon: Gamepad2, label: '玩耍', color: 'from-green-500 to-emerald-500', desc: '增进感情' },
  { type: 'scold' as const, icon: Megaphone, label: '批评', color: 'from-red-500 to-orange-500', desc: '纠正行为' },
  { type: 'encourage' as const, icon: MessageSquare, label: '鼓励', color: 'from-purple-500 to-pink-500', desc: '增强自信' },
];

export const ChildDetailModal = React.memo(function ChildDetailModal({
  child,
  onClose,
  onInteract,
}: ChildDetailModalProps) {
  if (!child) return null;

  const genderConfig = GENDER_CONFIG[child.gender];
  const relationshipConfig = RELATIONSHIP_CONFIG[child.relationship];

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
          className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border border-green-500/30 max-w-md w-full mx-4 p-6 shadow-2xl shadow-green-500/10"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-bold flex items-center gap-2">
              <Baby className="w-5 h-5 text-green-400" />
              子女详情
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

          {/* Avatar and basic info */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${genderConfig.color} flex items-center justify-center text-white font-bold text-3xl`}>
              {child.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-white text-xl font-bold flex items-center gap-2">
                {child.name}
                <span className="text-white/40 text-lg">{genderConfig.icon}</span>
              </p>
              <p className="text-white/50 text-sm">
                {child.age}岁 · {genderConfig.label}
              </p>
              <p className={`text-sm ${relationshipConfig.color}`}>
                {relationshipConfig.emoji} {relationshipConfig.label}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Age */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white/40 text-xs mb-1">年龄</p>
              <p className="text-2xl font-bold text-white">{child.age}</p>
              <p className="text-white/40 text-xs">岁</p>
            </div>

            {/* Born at */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white/40 text-xs mb-1">出生时</p>
              <p className="text-2xl font-bold text-white">{child.born_at}</p>
              <p className="text-white/40 text-xs">岁</p>
            </div>
          </div>

          {/* Traits */}
          {child.traits && child.traits.length > 0 && (
            <div className="mb-6">
              <p className="text-white/40 text-xs flex items-center gap-1 mb-2">
                <Star className="w-3 h-3" />
                天赋特质
              </p>
              <div className="flex flex-wrap gap-2">
                {child.traits.map((trait, i) => (
                  <motion.span
                    key={i}
                    className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 px-3 py-1.5 rounded-full border border-purple-500/30"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {trait}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Interaction buttons */}
          {onInteract && (
            <div>
              <p className="text-white/40 text-xs mb-2 flex items-center gap-1">
                <Heart className="w-3 h-3" />
                互动
              </p>
              <div className="grid grid-cols-4 gap-2">
                {INTERACTION_BUTTONS.map(({ type, icon: Icon, label, color, desc }) => (
                  <motion.button
                    key={type}
                    className={`bg-gradient-to-r ${color} text-white py-2 rounded-lg text-xs font-medium`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onInteract(type)}
                    title={desc}
                  >
                    <Icon className="w-3 h-3 inline mr-1" />
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
