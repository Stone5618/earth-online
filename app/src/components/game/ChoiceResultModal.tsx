import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { GlowingButton } from '@/components/GlowingButton';
import type { PlayerStats } from '@/game/gameState';

interface ChoiceResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  choiceText: string;
  statChanges: Partial<PlayerStats>;
  followUp?: string;
}

export function ChoiceResultModal(props: ChoiceResultModalProps) {
  const { isOpen, onClose, choiceText, statChanges, followUp } = props;
  
  if (!isOpen) return null;

  const formatStatChange = (key: string, value: number) => {
    const labels: Record<string, string> = {
      health: '健康',
      energy: '精力',
      money: '金钱',
      mood: '心情',
      intelligence: '智力',
      charm: '魅力',
      creativity: '创造力',
      luck: '运气',
      karma: '福报'
    };

    const label = labels[key] || key;
    const prefix = value > 0 ? '+' : '';
    const colorClass = value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-white/50';

    if (key === 'money') {
      return (
        <div key={key} className={`flex items-center justify-between ${colorClass}`}>
          <span>{label}</span>
          <span className="font-mono">{prefix}¥{Math.abs(value).toLocaleString()}</span>
        </div>
      );
    }

    return (
      <div key={key} className={`flex items-center justify-between ${colorClass}`}>
        <span>{label}</span>
        <span className="font-mono">{prefix}{value}</span>
      </div>
    );
  };

  const hasChanges = Object.keys(statChanges).length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            <motion.div
              className="w-full max-w-lg glass-card p-8"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-holo-blue" />
                  <h2 className="text-2xl font-orbitron font-bold text-white">选择结果</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-white/50 text-sm mb-2">你的选择</p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white leading-relaxed">{choiceText}</p>
                </div>
              </div>

              {followUp && (
                <div className="mb-6">
                  <p className="text-white/50 text-sm mb-3">结果</p>
                  <div className="p-4 rounded-xl bg-holo-blue/5 border border-holo-blue/10">
                    <p className="text-white leading-relaxed">{followUp}</p>
                  </div>
                </div>
              )}
              
              {hasChanges && (
                <div className="mb-6">
                  <p className="text-white/50 text-sm mb-3">属性变化</p>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    {Object.entries(statChanges).map(([key, value]) => 
                      formatStatChange(key, value as number)
                    )}
                  </div>
                </div>
              )}

              <GlowingButton
                onClick={onClose}
                variant="primary"
                className="w-full text-center justify-center min-h-[48px]"
              >
                确定继续
              </GlowingButton>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
