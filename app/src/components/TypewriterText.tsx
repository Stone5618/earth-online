import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  showCursor?: boolean;
  onComplete?: () => void;
  variant?: 'default' | 'red' | 'gold';
}

export function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  className = '',
  showCursor = true,
  onComplete,
  variant = 'default',
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [hasStarted, text, speed, onComplete]);

  const cursorColorClass = {
    default: 'bg-holo-blue',
    red: 'bg-fatal-red',
    gold: 'bg-gold',
  }[variant];

  return (
    <span className={className}>
      {displayText}
      {showCursor && !isComplete && hasStarted && (
        <motion.span
          className={`inline-block w-0.5 h-[1em] ml-1 ${cursorColorClass}`}
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        />
      )}
    </span>
  );
}
