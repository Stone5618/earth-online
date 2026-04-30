/**
 * SpouseProfileModal — 配偶档案弹窗
 * 
 * Displays detailed information about the spouse including:
 * - Personal info (name, age, traits)
 * - Relationship stats (intimacy, years together)
 * - Interaction history
 * - Quick action buttons
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Calendar, Sparkles, X } from 'lucide-react';

interface SpouseProfileModalProps {
  spouse: {
    name: string;
    age: number;
    intimacy: number;
    relationship_years: number;
    mood: 'happy' | 'neutral' | 'sad';
    traits?: string[];
  } | null;
  onClose: () => void;
  onInteract?: (type: 'date' | 'gift' | 'talk' | 'travel') => void;
}

const MOOD_CONFIG = {
  happy: { emoji: '😊', label: '心情愉快', color: 'text-green-400' },
  neutral: { emoji: '😐', label: '心情平静', color: 'text-yellow-400' },
  sad: { emoji: '😢', label: '心情低落', color: 'text-red-400' },
};

const INTIMACY_LEVELS = [
  { min: 90, label: '如胶似漆', color: 'text-pink-400' },
  { min: 70, label: '恩爱甜蜜', color: 'text-green-400' },
  { min: 50, label: '和睦相处', color: 'text-blue-400' },
  { min: 30, label: '平淡如水', color: 'text-yellow-400' },
  { min: 0, label: '感情危机', color: 'text-red-400' },
];

function getIntimacyLevel(intimacy: number) {
  return INTIMACY_LEVELS.find(level => intimacy >= level.min) || INTIMACY_LEVELS[INTIMACY_LEVELS.length - 1];
}

export const SpouseProfileModal = React.memo(function SpouseProfileModal({
  spouse,
  onClose,
  onInteract,
}: SpouseProfileModalProps) {
  if (!spouse) return null;

  const moodConfig = MOOD_CONFIG[spouse.mood];
  const intimacyLevel = getIntimacyLevel(spouse.intimacy);

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
          className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border border-pink-500/30 max-w-md w-full mx-4 p-6 shadow-2xl shadow-pink-500/10"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              配偶档案
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
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold text-3xl">
              {spouse.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-white text-xl font-bold">{spouse.name}</p>
              <p className="text-white/50 text-sm">
                {spouse.age}岁 · <span className={moodConfig.color}>{moodConfig.emoji} {moodConfig.label}</span>
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Intimacy */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white/40 text-xs flex items-center gap-1 mb-2">
                <Heart className="w-3 h-3" />
                亲密度
              </p>
              <p className={`text-2xl font-bold ${intimacyLevel.color}`}>
                {spouse.intimacy}
              </p>
              <p className={`text-xs ${intimacyLevel.color}`}>
                {intimacyLevel.label}
              </p>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${spouse.intimacy}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            {/* Years together */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white/40 text-xs flex items-center gap-1 mb-2">
                <Calendar className="w-3 h-3" />
                婚龄
              </p>
              <p className="text-2xl font-bold text-white">
                {spouse.relationship_years}
              </p>
              <p className="text-white/40 text-xs">年</p>
            </div>
          </div>

          {/* Traits */}
          {spouse.traits && spouse.traits.length > 0 && (
            <div className="mb-6">
              <p className="text-white/40 text-xs flex items-center gap-1 mb-2">
                <Sparkles className="w-3 h-3" />
                特质
              </p>
              <div className="flex flex-wrap gap-2">
                {spouse.traits.map((trait, i) => (
                  <span
                    key={i}
                    className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30"
                  >
                    <Star className="w-3 h-3 inline mr-1" />
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interaction buttons */}
          {onInteract && (
            <div className="grid grid-cols-4 gap-2">
              <motion.button
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 rounded-lg text-xs font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onInteract('date')}
              >
                ☕ 约会
              </motion.button>
              <motion.button
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-lg text-xs font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onInteract('gift')}
              >
                🎁 礼物
              </motion.button>
              <motion.button
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-lg text-xs font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onInteract('talk')}
              >
                💬 谈心
              </motion.button>
              <motion.button
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg text-xs font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onInteract('travel')}
              >
                ✈️ 旅行
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
