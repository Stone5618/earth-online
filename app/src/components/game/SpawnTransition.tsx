import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/game/GameContext';
import { Dna, Sparkles, Skull, Star, Circle } from 'lucide-react';

const familyTierInfo = {
  SSR: {
    icon: Star,
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
    name: 'N - 困难模式',
    desc: '地狱开局，生存即是胜利',
  },
};

export function SpawnTransition() {
  const { state, completeSpawning } = useGame();
  const [stage, setStage] = useState<'connecting' | 'generating' | 'revealing' | 'finalizing'>('connecting');
  const [progress, setProgress] = useState(0);
  const [revealedTier, setRevealedTier] = useState<keyof typeof familyTierInfo | null>(null);
  // Pre-generate random values for data stream effect to avoid render-time impure calls
  const [randomValues] = useState(() => 
    Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
      bits: Array.from({ length: 50 }).map(() => Math.random() > 0.5 ? '1' : '0').join('')
    }))
  );

  useEffect(() => {
    if (state.phase !== 'SPAWNING') return;

    // Stage 1: Connecting (0-2s)
    const stage1Timer = setTimeout(() => {
      setStage('generating');
    }, 2000);

    return () => clearTimeout(stage1Timer);
  }, [state.phase]);

  useEffect(() => {
    if (stage !== 'generating') return;

    // Progress animation (2-5s)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Use tier from state
          if (state.familyTier) {
            setRevealedTier(state.familyTier as keyof typeof familyTierInfo);
            setStage('revealing');
          }
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [stage, state.familyTier]);

  // 额外检查：如果 state.familyTier 已经有值但 stage 还在 generating，直接跳到 revealing
  useEffect(() => {
    if (stage === 'generating' && state.familyTier && progress >= 100) {
      setRevealedTier(state.familyTier as keyof typeof familyTierInfo);
      setStage('revealing');
    }
  }, [stage, state.familyTier, progress]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-deep-space"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background Data Stream Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {randomValues.map((val, i) => (
          <motion.div
            key={i}
            className="absolute text-holo-blue/20 font-mono text-xs whitespace-nowrap"
            style={{
              left: `${val.left}%`,
              top: '-20px',
            }}
            animate={{
              y: ['0vh', '120vh'],
            }}
            transition={{
              duration: val.duration,
              repeat: Infinity,
              delay: val.delay,
              ease: 'linear',
            }}
          >
            {val.bits}
          </motion.div>
        ))}
      </div>

      {/* Scan Line Effect */}
      <motion.div
        className="absolute inset-x-0 h-1 bg-holo-blue/50"
        animate={{
          top: ['0%', '100%', '0%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          boxShadow: '0 0 20px rgba(0, 210, 255, 0.8)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center">
        <AnimatePresence mode="wait">
          {stage === 'connecting' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="space-y-6"
            >
              <motion.div
                className="w-24 h-24 mx-auto rounded-full border-4 border-holo-blue/30 border-t-holo-blue"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <div>
                <p className="text-holo-blue font-mono text-xl mb-2">
                  Connecting to Reincarnation Server...
                </p>
                <p className="text-white/50 text-sm">
                  正在连接轮回服务器...
                </p>
              </div>
              <div className="flex justify-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-holo-blue"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <Dna className="w-24 h-24 mx-auto text-holo-blue" />
              </motion.div>
              <div>
                <p className="text-holo-blue font-mono text-xl mb-2">
                  Generating DNA Sequence...
                </p>
                <p className="text-white/50 text-sm">
                  正在生成DNA序列...
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-80 mx-auto">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-holo-blue to-purple-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-white/40 text-sm mt-2 font-mono">{progress}%</p>
              </div>

              {/* Random DNA codes */}
              <div className="font-mono text-xs text-holo-blue/50 space-y-1">
                {progress > 20 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>ATCG-2947-ALPHA</motion.p>}
                {progress > 40 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>GENE-8832-BETA</motion.p>}
                {progress > 60 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>CELL-5561-GAMMA</motion.p>}
                {progress > 80 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>LIFE-0099-DELTA</motion.p>}
              </div>
            </motion.div>
          )}

          {stage === 'revealing' && revealedTier && (
            <motion.div
              key="revealing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className={`w-32 h-32 mx-auto rounded-full ${familyTierInfo[revealedTier].bgColor} ${familyTierInfo[revealedTier].borderColor} border-4 flex items-center justify-center`}
              >
                {(() => {
                  const Icon = familyTierInfo[revealedTier].icon;
                  return <Icon className={`w-16 h-16 ${familyTierInfo[revealedTier].color}`} />;
                })()}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className={`text-3xl font-bold ${familyTierInfo[revealedTier].color} mb-2`}>
                  {familyTierInfo[revealedTier].name}
                </p>
                <p className="text-white/60 mb-4">
                  {familyTierInfo[revealedTier].desc}
                </p>
                
                {state.birthServer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 mb-2"
                  >
                    <p className="text-white/40 text-xs mb-1">出生服务器</p>
                    <p className="text-holo-blue font-mono">{state.birthServer}</p>
                  </motion.div>
                )}
                
                {state.birthTalent && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <p className="text-white/40 text-xs mb-1">天赋</p>
                    <p className="text-gold font-mono">✨ {state.birthTalent}</p>
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex justify-center"
              >
                <Sparkles className="w-8 h-8 text-gold animate-pulse" />
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                onClick={completeSpawning}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-holo-blue to-purple-500 text-white font-bold rounded-lg 
                          hover:from-holo-blue/90 hover:to-purple-500/90 transform hover:scale-105 transition-all
                          shadow-lg shadow-holo-blue/30"
              >
                🌟 开始人生
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 text-white/20 font-mono text-xs">
        <p>SYS.REINCARNATION</p>
        <p>v4.6B.2024</p>
      </div>
      <div className="absolute bottom-4 right-4 text-white/20 font-mono text-xs text-right">
        <p>SERVER: ASIA-EAST</p>
        <p>LATENCY: 0ms</p>
      </div>
    </motion.div>
  );
}
