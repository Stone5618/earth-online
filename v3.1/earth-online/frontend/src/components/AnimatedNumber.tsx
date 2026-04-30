import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  liveUpdate?: boolean;
  liveRange?: [number, number];
}

export function AnimatedNumber({
  value,
  duration = 1.5,
  format = (n) => n.toLocaleString(),
  className = '',
  liveUpdate = false,
  liveRange = [-5, 5],
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const liveValueRef = useRef(value);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = Date.now();
    const startValue = 0;
    const endValue = value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut);
      
      setDisplayValue(currentValue);
      liveValueRef.current = currentValue;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  useEffect(() => {
    if (!liveUpdate) return;

    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * (liveRange[1] - liveRange[0] + 1)) + liveRange[0];
      const newValue = liveValueRef.current + change;
      liveValueRef.current = newValue;
      setDisplayValue(newValue);
    }, 2000);

    return () => clearInterval(interval);
  }, [liveUpdate, liveRange]);

  return (
    <motion.span
      ref={ref}
      className={className}
    >
      {format(displayValue)}
    </motion.span>
  );
}
