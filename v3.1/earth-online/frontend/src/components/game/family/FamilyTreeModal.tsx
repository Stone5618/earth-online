/**
 * FamilyTreeModal — 家族树可视化弹窗
 * 
 * Displays family relationships in a tree structure:
 * - Player at center
 * - Spouse connected
 * - Children branching out
 * - Interactive nodes for viewing details
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Heart, Baby, ChevronRight } from 'lucide-react';

interface FamilyTreeModalProps {
  family: {
    player_name: string;
    player_age: number;
    spouse: {
      name: string;
      age: number;
      intimacy: number;
    } | null;
    children: Array<{
      id: string;
      name: string;
      age: number;
      gender: 'male' | 'female';
      relationship: 'good' | 'neutral' | 'poor';
    }>;
  } | null;
  onClose: () => void;
  onMemberClick?: (member: { name: string; type: 'spouse' | 'child'; id?: string }) => void;
}

const GENDER_COLORS = {
  male: 'from-blue-400 to-cyan-400',
  female: 'from-pink-400 to-rose-400',
};

const RELATIONSHIP_COLORS = {
  good: 'text-green-400',
  neutral: 'text-yellow-400',
  poor: 'text-red-400',
};

export const FamilyTreeModal = React.memo(function FamilyTreeModal({
  family,
  onClose,
  onMemberClick,
}: FamilyTreeModalProps) {
  // Calculate tree layout
  const layout = useMemo(() => {
    if (!family) return null;

    const hasSpouse = family.spouse !== null;
    const children = family.children || [];
    const hasChildren = children.length > 0;

    return {
      hasSpouse,
      hasChildren,
      childrenCount: children.length,
      rows: 1 + (hasSpouse ? 1 : 0) + (hasChildren ? 1 : 0),
    };
  }, [family]);

  if (!family || !layout) return null;

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
          className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border border-amber-500/30 max-w-2xl w-full mx-4 p-6 shadow-2xl shadow-amber-500/10 max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              家族树
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

          {/* Tree structure */}
          <div className="space-y-6">
            {/* Row 1: Player */}
            <div className="flex justify-center">
              <FamilyMemberNode
                name={family.player_name}
                age={family.player_age}
                gender="male"
                type="player"
                onClick={undefined}
              />
            </div>

            {/* Connection line */}
            {(layout.hasSpouse || layout.hasChildren) && (
              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-gradient-to-b from-amber-400/50 to-transparent" />
              </div>
            )}

            {/* Row 2: Spouse */}
            {layout.hasSpouse && family.spouse && (
              <>
                <div className="flex items-center justify-center gap-8">
                  {/* Heart connector */}
                  <motion.div
                    className="flex items-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-pink-400/50" />
                    <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-pink-400/50" />
                  </motion.div>
                </div>
                <div className="flex justify-center">
                  <FamilyMemberNode
                    name={family.spouse.name}
                    age={family.spouse.age}
                    gender="female"
                    type="spouse"
                    intimacy={family.spouse.intimacy}
                    onClick={() => onMemberClick?.({ name: family.spouse!.name, type: 'spouse' })}
                  />
                </div>
              </>
            )}

            {/* Connection to children */}
            {layout.hasChildren && (
              <>
                <div className="flex justify-center">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-amber-400/50 to-transparent" />
                </div>
                <div className="flex justify-center">
                  <Baby className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex justify-center">
                  <div className="w-0.5 h-4 bg-gradient-to-b from-amber-400/50 to-transparent" />
                </div>
              </>
            )}

            {/* Row 3: Children */}
            {layout.hasChildren && (
              <div className="flex flex-wrap justify-center gap-4">
                {family.children.map((child, index) => (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <FamilyMemberNode
                      name={child.name}
                      age={child.age}
                      gender={child.gender}
                      type="child"
                      relationship={child.relationship}
                      onClick={() => onMemberClick?.({ name: child.name, type: 'child', id: child.id })}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!layout.hasSpouse && !layout.hasChildren && (
              <motion.div
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-white/40 text-sm">
                  家族树为空，寻找缘分或生育后代来扩展你的家族
                </p>
              </motion.div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-white/40 text-xs text-center">
              点击成员查看详细信息
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

// ============================================================
// Sub-components
// ============================================================

interface FamilyMemberNodeProps {
  name: string;
  age: number;
  gender: 'male' | 'female';
  type: 'player' | 'spouse' | 'child';
  intimacy?: number;
  relationship?: 'good' | 'neutral' | 'poor';
  onClick?: () => void;
}

const FamilyMemberNode = React.memo(function FamilyMemberNode({
  name,
  age,
  gender,
  type,
  intimacy,
  relationship,
  onClick,
}: FamilyMemberNodeProps) {
  const genderColor = GENDER_COLORS[gender];
  const typeLabel = type === 'player' ? '我' : type === 'spouse' ? '配偶' : '子女';
  const typeColor = type === 'player' ? 'text-amber-400' : type === 'spouse' ? 'text-pink-400' : 'text-green-400';

  const node = (
    <motion.div
      className={`bg-white/5 rounded-xl p-4 border border-white/10 min-w-[120px] ${onClick ? 'cursor-pointer hover:bg-white/10' : ''}`}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
    >
      {/* Avatar */}
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${genderColor} flex items-center justify-center text-white font-bold text-lg mx-auto mb-2`}>
        {name.charAt(0)}
      </div>
      
      {/* Info */}
      <p className="text-white text-sm font-medium text-center truncate">{name}</p>
      <p className="text-white/40 text-xs text-center">{age}岁</p>
      <p className={`${typeColor} text-xs text-center mt-1`}>{typeLabel}</p>

      {/* Intimacy/Relationship indicator */}
      {intimacy !== undefined && (
        <div className="mt-2">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${intimacy}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-white/40 text-xs text-center mt-1">{intimacy}%</p>
        </div>
      )}

      {relationship !== undefined && (
        <p className={`text-xs text-center mt-2 ${RELATIONSHIP_COLORS[relationship]}`}>
          {relationship === 'good' ? '亲密' : relationship === 'neutral' ? '一般' : '疏远'}
        </p>
      )}
    </motion.div>
  );

  return onClick ? (
    <button onClick={onClick}>{node}</button>
  ) : (
    node
  );
});
