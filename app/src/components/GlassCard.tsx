import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'red' | 'gold' | 'none';
  hoverScale?: number;
  delay?: number;
}

export function GlassCard({
  children,
  className = '',
  glowColor = 'blue',
  hoverScale = 1.02,
  delay = 0,
}: GlassCardProps) {
  const glowColors = {
    blue: 'hover:shadow-[0_0_30px_rgba(0,210,255,0.4)] hover:border-holo-blue/40',
    red: 'hover:shadow-[0_0_30px_rgba(255,75,75,0.4)] hover:border-fatal-red/40',
    gold: 'hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] hover:border-gold/40',
    none: '',
  };

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-white/[0.03] backdrop-blur-xl
        border border-holo-blue/15
        transition-all duration-300
        ${glowColors[glowColor]}
        ${className}
      `}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ 
        scale: hoverScale,
        y: -8,
      }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      {children}
    </motion.div>
  );
}
