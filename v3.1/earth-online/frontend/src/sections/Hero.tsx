import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dices, BookOpen, ChevronDown, Play } from 'lucide-react';
import { TypewriterText } from '@/components/TypewriterText';
import { GlowingButton } from '@/components/GlowingButton';

interface HeroProps {
  onSpawnClick: () => void;
  onGuideClick: () => void;
  onContinueClick?: () => void;
}

export function Hero({ onSpawnClick, onGuideClick, onContinueClick }: HeroProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Earth Hologram */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="relative w-[600px] h-[600px] md:w-[800px] md:h-[800px] opacity-40"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.img
            src="/images/earth-hologram.png"
            alt="Earth Hologram"
            className="w-full h-full object-contain"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          />
          {/* Glow effect */}
          <div className="absolute inset-0 bg-holo-blue/20 blur-3xl rounded-full" />
        </motion.div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Main Title */}
        <motion.h1
          className="font-orbitron text-5xl md:text-7xl lg:text-8xl font-black mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="metal-text glow-text">《地球 Online》</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl md:text-2xl text-white/80 mb-8 font-light tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <TypewriterText
            text="超大型、全拟真、无缝加载的开放世界生存 RPG"
            speed={25}
            delay={500}
            onComplete={() => setShowWarning(true)}
          />
        </motion.p>

        {/* Warning Message */}
        {showWarning && (
          <motion.div
            className="mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-fatal-red font-mono text-sm md:text-base animate-pulse-red">
              <TypewriterText
                text="[System Warning] 无法删号重开 · 死亡永久封号 · 时间轴单向锁定 · 严禁存档/读档"
                speed={20}
                variant="red"
                onComplete={() => setShowButtons(true)}
              />
            </p>
          </motion.div>
        )}

        {/* Buttons */}
        {showButtons && (
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {onContinueClick && (
              <GlowingButton
                onClick={onContinueClick}
                variant="primary"
                size="lg"
                pulse
              >
                <Play className="w-5 h-5" />
                继续游戏
              </GlowingButton>
            )}

            <GlowingButton
              onClick={onSpawnClick}
              variant={onContinueClick ? "secondary" : "primary"}
              size="lg"
              pulse={!onContinueClick}
            >
              <Dices className="w-5 h-5" />
              随机投胎开局
            </GlowingButton>
            
            <GlowingButton
              onClick={onGuideClick}
              variant="secondary"
              size="lg"
            >
              <BookOpen className="w-5 h-5" />
              查看生存指南
            </GlowingButton>
          </motion.div>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-holo-blue/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
