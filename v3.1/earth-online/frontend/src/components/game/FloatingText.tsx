import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingTextItem {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
}

interface FloatingTextProps {
  texts: FloatingTextItem[];
  onComplete?: (id: string) => void;
}

export const FloatingText: React.FC<FloatingTextProps> = ({ texts, onComplete }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {texts.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 1, y: item.y, x: item.x, scale: 0.8 }}
            animate={{ opacity: 0, y: item.y - 80, x: item.x, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            onAnimationComplete={() => onComplete?.(item.id)}
            className="absolute text-sm font-bold font-mono whitespace-nowrap"
            style={{ color: item.color }}
          >
            {item.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// 飘字管理 Hook
export const useFloatingTexts = () => {
  const [texts, setTexts] = useState<FloatingTextItem[]>([]);

  const addFloatingText = (text: string, color: string = '#00D2FF') => {
    const id = `${Date.now()}-${Math.random()}`;
    // 随机水平位置，避免重叠
    const x = Math.random() * 200 - 100; // -100 到 100
    const y = 0;
    
    setTexts(prev => {
      // 限制同时显示的飘字数量
      const newTexts = [...prev, { id, text, color, x, y }];
      if (newTexts.length > 5) {
        return newTexts.slice(-5);
      }
      return newTexts;
    });

    // 自动移除
    setTimeout(() => {
      setTexts(prev => prev.filter(t => t.id !== id));
    }, 1200);
  };

  const removeFloatingText = (id: string) => {
    setTexts(prev => prev.filter(t => t.id !== id));
  };

  return { texts, addFloatingText, removeFloatingText };
};

// 属性变化飘字
export const useStatFloatingTexts = () => {
  const { texts, addFloatingText, removeFloatingText } = useFloatingTexts();

  const addStatChange = (statName: string, value: number) => {
    const color = value > 0 ? '#66BB6A' : value < 0 ? '#EF5350' : '#9E9E9E';
    const sign = value > 0 ? '+' : '';
    addFloatingText(`${statName} ${sign}${value}`, color);
  };

  return { texts, addStatChange, removeFloatingText };
};
