import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlowingButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  disabled?: boolean;
}

export function GlowingButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  pulse = false,
  disabled = false,
}: GlowingButtonProps) {
  const [isDebouncing, setIsDebouncing] = useState(false);

  const variants = {
    primary: 'bg-holo-blue/20 text-holo-blue border-holo-blue/50 hover:bg-holo-blue/30 hover:border-holo-blue',
    secondary: 'bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-white/40',
    danger: 'bg-fatal-red/20 text-fatal-red border-fatal-red/50 hover:bg-fatal-red/30 hover:border-fatal-red',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const handleClick = () => {
    if (disabled || !onClick || isDebouncing) return;
    setIsDebouncing(true);
    onClick();
    setTimeout(() => setIsDebouncing(false), 100);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-xl font-medium
        border backdrop-blur-sm
        transition-all duration-300
        min-h-[44px] min-w-[44px]
        touch-manipulation
        ${variants[variant]}
        ${sizes[size]}
        ${pulse ? 'animate-pulse-glow' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      whileHover={disabled ? undefined : { 
        scale: 1.02,
        boxShadow: variant === 'primary' 
          ? '0 0 30px rgba(0, 210, 255, 0.6)' 
          : variant === 'danger'
          ? '0 0 30px rgba(255, 75, 75, 0.6)'
          : '0 0 20px rgba(255, 255, 255, 0.2)'
      }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
    >
      <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
