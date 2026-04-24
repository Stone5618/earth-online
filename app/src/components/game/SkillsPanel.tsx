import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, BookOpen, TrendingUp, HeartPulse, MessageSquare, Heart, Briefcase, Dumbbell, Car, Utensils, Palette as PaletteIcon, Music, Sparkles, GraduationCap, Trophy } from 'lucide-react';
import { useGame } from '@/game/GameContext';
import { SKILL_COSTS } from '@/config/gameConfig';
import type { SkillKey } from '@/game/gameState';

interface SkillInfo {
  icon: React.ElementType;
  name: string;
  description: string;
  color: string;
}

const SKILL_INFO: Record<SkillKey, SkillInfo> = {
  programming: {
    icon: Zap,
    name: '编程',
    description: '掌握编程技术，提高收入和创业成功率',
    color: '#00D2FF',
  },
  investing: {
    icon: TrendingUp,
    name: '投资',
    description: '学习投资，提高理财能力',
    color: '#FFD700',
  },
  medicine: {
    icon: HeartPulse,
    name: '医疗',
    description: '了解医学知识，提高健康恢复能力',
    color: '#FF4B4B',
  },
  speech: {
    icon: MessageSquare,
    name: '演讲',
    description: '提升口才和表达能力',
    color: '#FF69B4',
  },
  romance: {
    icon: Heart,
    name: '恋爱',
    description: '掌握恋爱技巧，提升魅力',
    color: '#FF1493',
  },
  management: {
    icon: Briefcase,
    name: '管理',
    description: '学习管理，提高事业成功率',
    color: '#8B5CF6',
  },
  fitness: {
    icon: Dumbbell,
    name: '健身',
    description: '坚持锻炼，提高身体素质',
    color: '#00FF88',
  },
  driving: {
    icon: Car,
    name: '驾驶',
    description: '学习驾驶，提升出行便利性',
    color: '#3B82F6',
  },
  cooking: {
    icon: Utensils,
    name: '烹饪',
    description: '掌握烹饪技巧，提升生活品质',
    color: '#F59E0B',
  },
  painting: {
    icon: PaletteIcon,
    name: '绘画',
    description: '培养艺术细胞，提升创造力',
    color: '#EC4899',
  },
  music: {
    icon: Music,
    name: '音乐',
    description: '学习音乐，提升艺术修养',
    color: '#A855F7',
  },
  entrepreneurship: {
    icon: Sparkles,
    name: '创业',
    description: '学习创业，提升商业能力',
    color: '#F97316',
  },
  academics: {
    icon: GraduationCap,
    name: '学术',
    description: '深耕学术领域，提升专业能力',
    color: '#10B981',
  },
  athletics: {
    icon: Trophy,
    name: '体育',
    description: '发展体育特长，提升身体素质',
    color: '#06B6D4',
  },
};

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
                  <p className="text-white/40 text-sm">提示：通过做出人生决定获得技能点</p>
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
                      transition={{ delay: Object.keys(SKILL_INFO).indexOf(skillKey) * 0.03 }}
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
                        <span className="text-xs text-white/40">Lv.{level}</span>
                      </div>

                      {level < 5 ? (
                        <button
                          onClick={() => handleUpgradeSkill(skillKey)}
                          disabled={!canUpgradeThis}
                          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            canUpgradeThis
                              ? `bg-[${info.color}]/20 border border-[${info.color}]/50 text-[${info.color}] hover:bg-[${info.color}]/30 hover:border-[${info.color}]/70`
                              : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                          }`}
                          style={{
                            backgroundColor: canUpgradeThis ? `${info.color}20` : undefined,
                            borderColor: canUpgradeThis ? `${info.color}50` : undefined,
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
