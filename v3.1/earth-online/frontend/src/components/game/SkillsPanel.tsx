import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, BookOpen } from 'lucide-react';
import { useGame } from '@/game/GameContext';
import { SKILL_COSTS } from '@/config/gameConfig';
import { SKILL_META } from '@/config/skills';
import type { SkillKey } from '@/game/gameState';

const SKILL_INFO = SKILL_META;
const SKILL_KEYS = Object.keys(SKILL_META) as SkillKey[];

interface SkillsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SkillsPanel({ isOpen, onClose }: SkillsPanelProps) {
  const { state, dispatch } = useGame();
  const { stats } = state;

  const handleUpgradeSkill = (skill: SkillKey) => {
    dispatch({ type: 'UPGRADE_SKILL', payload: { skill } });
  };

  const getSkillCost = (currentLevel: number) => {
    return SKILL_COSTS[(currentLevel + 1) as keyof typeof SKILL_COSTS] || 0;
  };

  const canUpgrade = (skill: SkillKey) => {
    const currentLevel = stats.skills[skill];
    const cost = getSkillCost(currentLevel);
    return currentLevel < 5 && stats.skillPoints >= cost;
  };

  const renderStars = (level: number, color: string) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.div
            key={star}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: star * 0.05 }}
          >
            {star <= level ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill={color}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 opacity-30" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel Container */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            {/* Panel */}
            <motion.div
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card p-6 sm:p-8"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-holo-purple" />
                  <h2 className="text-2xl font-orbitron font-bold text-white">技能树</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 min-h-[44px] min-w-[44px] rounded-lg hover:bg-white/10 transition-all flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-white/60" />
                </button>
              </div>

              {/* Skill Points Display */}
              <div className="mb-8 p-4 rounded-xl bg-holo-purple/10 border border-holo-purple/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-holo-purple" />
                    <div>
                      <p className="text-white/60 text-sm">技能点数</p>
                      <p className="text-2xl font-bold text-holo-purple">{stats.skillPoints}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">提示：通过做出人生决定获得技能点</p>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(SKILL_INFO).map(([key, info]) => {
                  const skillKey = key as SkillKey;
                  const level = stats.skills[skillKey];
                  const cost = getSkillCost(level);
                  const canUpgradeThis = canUpgrade(skillKey);

                  return (
                    <motion.div
                      key={skillKey}
                      className={`p-4 rounded-xl border transition-all ${
                        canUpgradeThis
                          ? 'bg-white/5 border-white/20 hover:border-white/40 hover:bg-white/10'
                          : 'bg-white/5 border-white/10'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: SKILL_KEYS.indexOf(skillKey) * 0.03 }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${info.color}20` }}>
                          <info.icon className="w-5 h-5" style={{ color: info.color }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white">{info.name}</h4>
                          <p className="text-xs text-white/50 mt-1">{info.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        {renderStars(level, info.color)}
                        <span className="text-xs text-white/60">Lv.{level}</span>
                      </div>

                      {level < 5 ? (
                        <button
                          onClick={() => handleUpgradeSkill(skillKey)}
                          disabled={!canUpgradeThis}
                          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            canUpgradeThis
                              ? 'border hover:border-opacity-70 hover:bg-opacity-30'
                              : 'bg-white/5 border border-white/10 text-white/60 cursor-not-allowed'
                          }`}
                          style={{
                            backgroundColor: canUpgradeThis ? `${info.color}33` : undefined,
                            borderColor: canUpgradeThis ? `${info.color}80` : undefined,
                            color: canUpgradeThis ? info.color : undefined,
                          }}
                        >
                          <Zap className="w-4 h-4" />
                          升级 ({cost} 点)
                        </button>
                      ) : (
                        <div className="w-full py-2 px-3 rounded-lg text-sm font-medium bg-holo-purple/20 border border-holo-purple/50 text-holo-purple text-center">
                          已满级
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
