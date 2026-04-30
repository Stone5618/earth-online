/**
 * WeddingCeremonyModal — 婚礼动画弹窗
 * 
 * Displays a multi-step wedding ceremony animation with:
 * - Petal falling effect
 * - Light transition
 * - Ceremony steps progression
 * - Spouse profile reveal
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Users, Star, Music } from 'lucide-react';

interface WeddingCeremonyModalProps {
  ceremony: {
    spouse_name: string;
    spouse_age: number;
    ceremony_type: 'simple' | 'grand' | 'private';
    guest_count: number;
    ceremony_text: string;
    compatibility: number;
  } | null;
  onComplete: () => void;
}

const CEREMONY_STEPS = [
  { title: '💒 仪式开始', description: '婚礼正式开始，现场充满温馨的氛围' },
  { title: '💑 交换誓言', description: '彼此承诺，共度余生' },
  { title: '💍 交换戒指', description: '戒指象征着永恒的爱情' },
  { title: '🎉 庆祝时刻', description: '亲朋好友共同庆祝这美好时刻' },
];

// Petal component for falling animation
const Petal = React.memo(function Petal({ delay, left }: { delay: number; left: number }) {
  return (
    <motion.div
      className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 to-rose-300 opacity-60"
      style={{ left: `${left}%`, top: -10 }}
      initial={{ y: -10, rotate: 0, opacity: 0.6 }}
      animate={{
        y: ['0vh', '100vh'],
        rotate: [0, 360],
        x: [0, Math.sin(delay) * 50, 0],
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        delay: delay,
        ease: 'linear',
      }}
    />
  );
});

export const WeddingCeremonyModal = React.memo(function WeddingCeremonyModal({
  ceremony,
  onComplete,
}: WeddingCeremonyModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const isGrand = ceremony?.ceremony_type === 'grand';
  const isPrivate = ceremony?.ceremony_type === 'private';

  // Auto-advance ceremony steps
  useEffect(() => {
    if (!ceremony) return undefined;

    if (currentStep < CEREMONY_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      // Show confetti on final step
      setShowConfetti(true);
    }
    return undefined;
  }, [currentStep, ceremony]);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  if (!ceremony) return null;

  const bgGradient = isGrand
    ? 'from-purple-900 via-pink-900 to-rose-900'
    : isPrivate
    ? 'from-blue-900 via-purple-900 to-pink-900'
    : 'from-gray-900 via-gray-800 to-gray-900';

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-[2000] flex items-center justify-center bg-gradient-to-b ${bgGradient}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Petals animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <Petal key={i} delay={i * 0.3} left={Math.random() * 100} />
          ))}
        </div>

        {/* Main content */}
        <motion.div
          className="relative z-10 max-w-lg w-full mx-4 p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl"
          initial={{ scale: 0.8, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              className="inline-flex p-4 rounded-full bg-gradient-to-br from-pink-500/30 to-rose-500/30 mb-4"
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 20px rgba(236, 72, 153, 0)',
                  '0 0 30px rgba(236, 72, 153, 0.5)',
                  '0 0 20px rgba(236, 72, 153, 0)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-12 h-12 text-pink-400 fill-pink-400" />
            </motion.div>
            <h2 className="text-white text-2xl font-bold mb-2">💕 婚礼进行中</h2>
            <p className="text-white/60 text-sm">
              {isGrand ? '盛大的婚礼' : isPrivate ? '私密的仪式' : '简约的婚礼'}
              {ceremony.guest_count > 0 && ` · ${ceremony.guest_count}位宾客`}
            </p>
          </div>

          {/* Couple display */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2">
                你
              </div>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-8 h-8 text-pink-400 fill-pink-400" />
            </motion.div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-2">
                {ceremony.spouse_name.charAt(0)}
              </div>
            </div>
          </div>

          {/* Ceremony steps */}
          <div className="space-y-3 mb-6">
            {CEREMONY_STEPS.map((step, i) => (
              <motion.div
                key={i}
                className={`p-3 rounded-lg border transition-all ${
                  i <= currentStep
                    ? 'bg-white/10 border-pink-500/30'
                    : 'bg-white/5 border-white/10 opacity-40'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: i <= currentStep ? 1 : 0.4, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-2">
                  {i < currentStep ? (
                    <motion.div
                      className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Sparkles className="w-3 h-3 text-white" />
                    </motion.div>
                  ) : i === currentStep ? (
                    <motion.div
                      className="w-5 h-5 rounded-full bg-pink-500 animate-pulse"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/30" />
                  )}
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{step.title}</p>
                    {i === currentStep && (
                      <motion.p
                        className="text-white/50 text-xs mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Compatibility display */}
          <div className="bg-white/5 rounded-lg p-3 mb-6">
            <p className="text-white/50 text-xs mb-2 flex items-center gap-1">
              <Star className="w-3 h-3" />
              契合度
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${ceremony.compatibility}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </div>
              <span className="text-white font-medium text-sm">
                {ceremony.compatibility}%
              </span>
            </div>
          </div>

          {/* Complete button (only show on final step) */}
          <AnimatePresence>
            {showConfetti && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <motion.button
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-medium text-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleComplete}
                >
                  <Music className="w-5 h-5" />
                  完成婚礼，开始新生活
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
