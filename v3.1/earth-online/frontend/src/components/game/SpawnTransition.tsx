import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/game/GameContext';
import { Dna, Sparkles, Skull, Star, Circle, Crown, User, Users } from 'lucide-react';

const familyTierInfo: Record<string, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  name: string;
  desc: string;
}> = {
  SSR: {
    icon: Crown,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
    borderColor: 'border-yellow-400/50',
    name: 'SSR - 豪门世家',
    desc: '含着金汤匙出生，开局即巅峰',
  },
  SR: {
    icon: Star,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    borderColor: 'border-purple-400/50',
    name: 'SR - 小康家庭',
    desc: '衣食无忧，起点不错',
  },
  R: {
    icon: Circle,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
    borderColor: 'border-blue-400/50',
    name: 'R - 普通家庭',
    desc: '芸芸众生，靠自己奋斗',
  },
  IRON: {
    icon: Skull,
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/20',
    borderColor: 'border-gray-400/50',
    name: 'IRON - 困难模式',
    desc: '地狱开局，生存即是胜利',
  },
};

export function SpawnTransition() {
  const { state, completeSpawning } = useGame();
  const [step, setStep] = useState(0);
  const tier = state.familyTier || 'R';
  const tierInfo = familyTierInfo[tier] || familyTierInfo['R'];
  const TierIcon = tierInfo.icon;

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3500),
      setTimeout(() => completeSpawning(), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [completeSpawning]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-deep-space"
    >
      <div className="text-center px-4">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Dna className="w-16 h-16 text-holo-blue" />
              </motion.div>
              <p className="text-white/60 text-lg">正在生成灵魂...</p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <TierIcon className={`w-20 h-20 ${tierInfo.color}`} />
              </motion.div>
              <p className="text-white/60 text-lg">正在选择出身...</p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className={`p-8 rounded-2xl border-2 ${tierInfo.borderColor} ${tierInfo.bgColor} backdrop-blur-sm`}
            >
              <div className="flex flex-col items-center gap-3">
                <TierIcon className={`w-16 h-16 ${tierInfo.color}`} />
                <h2 className={`text-2xl font-bold ${tierInfo.color}`}>{tierInfo.name}</h2>
                <p className="text-white/80 text-base">{tierInfo.desc}</p>
                
                {/* 角色信息 */}
                <div className="mt-2 space-y-1.5 text-sm">
                  {state.characterName && (
                    <div className="flex items-center gap-2 text-white/80">
                      <User className="w-4 h-4 text-holo-blue" />
                      <span>姓名: <span className="text-white font-bold">{state.characterName}</span></span>
                    </div>
                  )}
                  {state.familyName && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Users className="w-4 h-4 text-holo-purple" />
                      <span>家族: <span className="text-white font-bold">{state.familyName}</span></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-white/60">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>服务器: {state.birthServer || '未知'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Sparkles className="w-4 h-4 text-holo-blue" />
                    <span>天赋: {state.birthTalent || '随机'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Sparkles className="w-16 h-16 text-holo-blue" />
              </motion.div>
              <p className="text-white text-xl font-bold">
                {state.characterName ? `${state.characterName}，` : ''}即将降生...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
