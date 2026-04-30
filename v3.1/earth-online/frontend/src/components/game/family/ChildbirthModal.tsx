/**
 * ChildbirthModal — 生育事件弹窗
 * 
 * Displays when a child is born, showing baby information
 * with celebratory animations and naming option.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, Sparkles, Heart, Star } from 'lucide-react';
import { safeRender } from '@/lib/safeRender';

interface ChildbirthModalProps {
  child: {
    name: string;
    gender: 'male' | 'female';
    born_at: number;
    traits?: string[];
  } | null;
  onClose: () => void;
  onNameChange?: (newName: string) => void;
}

const TRAIT_DESCRIPTIONS: Record<string, string> = {
  '健康': '身体素质优秀',
  '聪明': '智力发育良好',
  '活泼': '性格外向开朗',
  '安静': '性格温和安静',
  '幸运': '天生运气较好',
  '坚强': '意志力强',
};

export const ChildbirthModal = React.memo(function ChildbirthModal({
  child,
  onClose,
  onNameChange,
}: ChildbirthModalProps) {
  const [showTraits, setShowTraits] = useState(false);
  const [customName, setCustomName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleConfirmName = useCallback(() => {
    if (customName.trim() && onNameChange) {
      onNameChange(customName.trim());
    }
    setIsEditing(false);
  }, [customName, onNameChange]);

  if (!child) return null;

  // Defensive: ensure all fields are valid before rendering
  const safeName = typeof child?.name === 'string' ? child.name : '新生儿';
  const safeGender = ['male', 'female'].includes(child?.gender) ? child.gender : 'male';
  const safeBornAt = typeof child?.born_at === 'number' ? child.born_at : 0;
  const safeTraits = Array.isArray(child?.traits) ? child.traits : [];

  const genderColor = safeGender === 'male' ? 'from-blue-400 to-cyan-400' : 'from-pink-400 to-rose-400';
  const genderIcon = safeGender === 'male' ? '♂' : '♀';
  const genderText = safeGender === 'male' ? '男孩' : '女孩';

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
          initial={{ scale: 0.5, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: 50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with baby icon */}
          <div className="text-center mb-6">
            <motion.div
              className="inline-flex p-4 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-500/20 mb-3"
              animate={{ 
                scale: [1, 1.2, 1],
                boxShadow: [
                  '0 0 0px rgba(34, 197, 94, 0)',
                  '0 0 20px rgba(34, 197, 94, 0.5)',
                  '0 0 0px rgba(34, 197, 94, 0)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Baby className="w-10 h-10 text-green-400" />
            </motion.div>
            <h3 className="text-white text-xl font-bold mb-1">🎉 新生命降临！</h3>
            <p className="text-white/50 text-sm">一个可爱的{genderText}来到了这个世界</p>
          </div>

          {/* Baby info card */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-5 space-y-4">
            {/* Name section */}
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${genderColor} flex items-center justify-center text-white font-bold text-2xl`}>
                {isEditing ? customName.charAt(0) || '?' : safeName.charAt(0)}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-green-400"
                      placeholder="输入新名字..."
                      maxLength={10}
                      autoFocus
                    />
                    <motion.button
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleConfirmName}
                    >
                      确认
                    </motion.button>
                  </div>
                ) : (
                  <div>
                    <p className="text-white font-medium text-lg flex items-center gap-2">
                      {safeName}
                      <span className="text-white/40 text-sm">{genderIcon}</span>
                    </p>
                    <p className="text-white/40 text-xs">
                      出生于 {safeBornAt} 岁
                    </p>
                  </div>
                )}
              </div>
              {!isEditing && onNameChange && (
                <motion.button
                  className="text-xs text-white/50 hover:text-white/70"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setIsEditing(true);
                    setCustomName(safeName);
                  }}
                >
                  改名
                </motion.button>
              )}
            </div>

            {/* Traits section */}
            {safeTraits && safeTraits.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <p className="text-white/50 text-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  天赋特质
                </p>
                <div className="flex flex-wrap gap-2">
                  {safeTraits.map((trait, i) => (
                    <motion.span
                      key={i}
                      className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Star className="w-3 h-3 inline mr-1" />
                      {safeRender(trait)}
                    </motion.span>
                  ))}
                </div>
                <p className="text-white/30 text-xs">
                  {TRAIT_DESCRIPTIONS[safeTraits[0]] || ''}
                </p>
              </motion.div>
            )}
          </div>

          {/* Celebration message */}
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-white/60 text-sm italic">
              "生命的奇迹，从此开始..."
            </p>
          </motion.div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <motion.button
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              欢迎新生命
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
