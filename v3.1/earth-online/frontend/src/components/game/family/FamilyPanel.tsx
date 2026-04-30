/**
 * Enhanced FamilyPanel — 增强版家族面板
 * 
 * Displays comprehensive family information:
 * - Spouse status with intimacy bar and interaction buttons
 * - Children list with details access
 * - Relationship quality indicators
 * - Quick action buttons (date, gift, talk, etc.)
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Users,
  Baby,
  HeartCrack,
  Sparkles,
  MessageCircle,
  Gift,
  Coffee,
  Plane,
  ChevronRight,
} from 'lucide-react';
import type {
  FamilySummary,
  SpouseInfo,
  ChildInfo,
} from '@/game/core/types/family';

interface FamilyPanelProps {
  family: FamilySummary | null;
  onPropose?: () => void;
  onDivorce?: () => void;
  onSpouseInteract?: (type: 'date' | 'gift' | 'talk' | 'travel') => void;
  onChildDetail?: (child: ChildInfo) => void;
  showActions?: boolean;
}

// Spouse mood emoji mapping
const MOOD_EMOJI: Record<string, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
};

// Interaction buttons config
const INTERACTION_BUTTONS = [
  { type: 'date' as const, icon: Coffee, label: '约会', color: 'from-pink-500 to-rose-500' },
  { type: 'gift' as const, icon: Gift, label: '礼物', color: 'from-purple-500 to-indigo-500' },
  { type: 'talk' as const, icon: MessageCircle, label: '谈心', color: 'from-blue-500 to-cyan-500' },
  { type: 'travel' as const, icon: Plane, label: '旅行', color: 'from-green-500 to-emerald-500' },
];

/** Intimacy level label and color */
function getIntimacyInfo(intimacy: number): { label: string; color: string } {
  if (intimacy >= 90) return { label: '如胶似漆', color: 'text-pink-400' };
  if (intimacy >= 70) return { label: '恩爱甜蜜', color: 'text-green-400' };
  if (intimacy >= 50) return { label: '和睦相处', color: 'text-blue-400' };
  if (intimacy >= 30) return { label: '平淡如水', color: 'text-yellow-400' };
  return { label: '感情危机', color: 'text-red-400' };
}

export const EnhancedFamilyPanel = React.memo(function EnhancedFamilyPanel({
  family,
  onPropose,
  onDivorce,
  onSpouseInteract,
  onChildDetail,
  showActions = true,
}: FamilyPanelProps) {
  const [showInteractions, setShowInteractions] = useState(false);

  // Memoized intimacy info
  const intimacyInfo = useMemo(() => {
    if (!family?.spouse) return null;
    return getIntimacyInfo(family.spouse.intimacy);
  }, [family?.spouse?.intimacy]);

  // Memoized children sorted by age
  const sortedChildren = useMemo(() => {
    if (!family?.children) return [];
    return [...family.children].sort((a, b) => a.age - b.age);
  }, [family?.children]);

  if (!family) {
    return (
      <motion.div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
        <h4 className="text-white/70 text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-holo-blue" />
          家庭
        </h4>
        <p className="text-white/30 text-xs text-center py-4">暂无家庭信息</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      {/* Header */}
      <h4 className="text-white/70 text-sm flex items-center gap-2">
        <Users className="w-4 h-4 text-holo-blue" />
        家庭
      </h4>

      {/* Spouse section */}
      {family.is_married && family.spouse ? (
        <SpouseSection
          spouse={family.spouse}
          intimacyInfo={intimacyInfo!}
          showInteractions={showInteractions}
          onToggleInteractions={() => setShowInteractions(!showInteractions)}
          onInteract={onSpouseInteract}
          onDivorce={onDivorce}
          showActions={showActions}
        />
      ) : (
        <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
          <div className="p-2 rounded-full bg-white/10">
            <Heart className="w-4 h-4 text-white/30" />
          </div>
          <p className="text-white/40 text-sm flex-1">单身</p>
          {showActions && onPropose && (
            <motion.button
              className="text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPropose}
            >
              <Sparkles className="w-3 h-3" />
              寻找缘分
            </motion.button>
          )}
        </div>
      )}

      {/* Children section */}
      {sortedChildren.length > 0 && (
        <div className="space-y-2">
          <p className="text-white/50 text-xs flex items-center gap-1">
            <Baby className="w-3 h-3" />
            子女（{sortedChildren.length}人）
          </p>
          <div className="space-y-2">
            {sortedChildren.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onClick={() => onChildDetail?.(child)}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
});

// ============================================================
// Sub-components
// ============================================================

interface SpouseSectionProps {
  spouse: SpouseInfo;
  intimacyInfo: { label: string; color: string };
  showInteractions: boolean;
  onToggleInteractions: () => void;
  onInteract?: (type: 'date' | 'gift' | 'talk' | 'travel') => void;
  onDivorce?: () => void;
  showActions: boolean;
}

const SpouseSection = React.memo(function SpouseSection({
  spouse,
  intimacyInfo,
  showInteractions,
  onToggleInteractions,
  onInteract,
  onDivorce,
  showActions,
}: SpouseSectionProps) {
  return (
    <div className="space-y-3">
      {/* Spouse info card */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-lg p-3 border border-pink-500/20">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold text-lg">
          {spouse.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            配偶：{spouse.name} {MOOD_EMOJI[spouse.mood] || ''}
          </p>
          <p className="text-white/50 text-xs">
            婚龄：{spouse.relationship_years}年 ·{' '}
            <span className={intimacyInfo.color}>{intimacyInfo.label}</span>
          </p>
          {/* Intimacy bar */}
          <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${spouse.intimacy}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/30" />
      </div>

      {/* Interaction buttons */}
      {showInteractions && onInteract && (
        <motion.div
          className="grid grid-cols-4 gap-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {INTERACTION_BUTTONS.map(({ type, icon: Icon, label, color }) => (
            <motion.button
              key={type}
              className={`bg-gradient-to-r ${color} text-white py-2 rounded-lg text-xs font-medium`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onInteract(type)}
            >
              <Icon className="w-3 h-3 inline mr-1" />
              {label}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Action buttons row */}
      {showActions && (
        <div className="flex gap-2">
          <motion.button
            className="flex-1 text-xs bg-white/10 text-white/70 py-1.5 rounded-lg border border-white/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggleInteractions}
          >
            <Sparkles className="w-3 h-3 inline mr-1" />
            {showInteractions ? '收起互动' : '互动'}
          </motion.button>
          {onDivorce && (
            <motion.button
              className="text-xs bg-red-500/20 text-red-400 py-1.5 px-3 rounded-lg border border-red-500/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDivorce}
            >
              <HeartCrack className="w-3 h-3 inline mr-1" />
              离婚
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
});

interface ChildCardProps {
  child: ChildInfo;
  onClick: () => void;
}

const ChildCard = React.memo(function ChildCard({
  child,
  onClick,
}: ChildCardProps) {
  const genderColor = child.gender === 'male'
    ? 'from-blue-400 to-cyan-400'
    : 'from-pink-400 to-rose-400';

  const genderIcon = child.gender === 'male' ? '♂' : '♀';

  const relationshipColor = {
    good: 'text-green-400',
    neutral: 'text-yellow-400',
    poor: 'text-red-400',
  }[child.relationship];

  const relationshipText = {
    good: '亲密',
    neutral: '一般',
    poor: '疏远',
  }[child.relationship];

  return (
    <motion.button
      className="w-full flex items-center gap-3 bg-white/5 rounded-lg p-2.5 hover:bg-white/10 transition-colors text-left"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
    >
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${genderColor} flex items-center justify-center text-white font-bold text-sm`}>
        {child.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">
          {child.name} <span className="text-white/40 text-xs">{genderIcon}</span>
        </p>
        <p className="text-white/40 text-xs">
          {child.age}岁 · <span className={relationshipColor}>{relationshipText}</span>
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-white/20" />
    </motion.button>
  );
});
