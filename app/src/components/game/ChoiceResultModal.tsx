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

  // 过滤掉非数值属性，特别过滤掉skills对象
  const filteredChanges = Object.entries(statChanges)
    .filter(([key, value]) => {
      // 过滤掉skills对象
      if (key === 'skills') return false;
      // 只保留数值类型
      return typeof value === 'number';
    });
  
  const hasChanges = filteredChanges.length > 0;
  
  // 处理技能变化的辅助函数
  const getSkillChanges = () => {
    if (!statChanges.skills || typeof statChanges.skills !== 'object') return [];
    return Object.entries(statChanges.skills)
      .filter(([_, value]) => typeof value === 'number' && value !== 0);
  };
  
  const skillChanges = getSkillChanges();
  const hasSkillChanges = skillChanges.length > 0;

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
                    {filteredChanges.map(([key, value]) => 
                      formatStatChange(key, value as number)
                    )}
                  </div>
                </div>
              )}
              
              {hasSkillChanges && (
                <div className="mb-6">
                  <p className="text-white/50 text-sm mb-3">技能变化</p>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    {skillChanges.map(([skillKey, value]) => {
                      const skillLabels: Record<string, string> = {
                        programming: '编程',
                        investing: '投资',
                        medicine: '医疗',
                        speech: '演讲',
                        romance: '恋爱',
                        management: '管理',
                        fitness: '健身',
                        driving: '驾驶',
                        cooking: '烹饪',
                        painting: '绘画',
                        music: '音乐',
                        entrepreneurship: '创业',
                        academics: '学术',
                        athletics: '体育'
                      };
                      const label = skillLabels[skillKey] || skillKey;
                      const numValue = value as number;
                      const colorClass = numValue > 0 ? 'text-green-400' : numValue < 0 ? 'text-red-400' : 'text-white/50';
                      const prefix = numValue > 0 ? '+' : '';
                      
                      return (
                        <div key={skillKey} className={`flex items-center justify-between ${colorClass}`}>
                          <span>{label}</span>
                          <span className="font-mono">{prefix}{numValue}</span>
                        </div>
                      );
                    })}
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
