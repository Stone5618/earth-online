import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Milestone, AlertTriangle, Skull, Sparkles } from 'lucide-react';
import { useGame } from '@/game/GameContext';
import { formatMoney } from '@/game/gameState';
import type { GameLog } from '@/game/gameState';

const LogItem = React.memo(({ log, index, isRecent }: { log: GameLog; index: number; isRecent: boolean }) => {
  const getIcon = () => {
    switch (log.type) {
      case 'milestone':
        return <Milestone className="w-4 h-4 text-gold" />;
      case 'positive':
        return <Sparkles className="w-4 h-4 text-green-400" />;
      case 'negative':
        return <AlertTriangle className="w-4 h-4 text-fatal-red" />;
      case 'death':
        return <Skull className="w-4 h-4 text-fatal-red" />;
      default:
        return <ScrollText className="w-4 h-4 text-holo-blue" />;
    }
  };

  const getBorderColor = () => {
    switch (log.type) {
      case 'milestone':
        return 'border-gold/30 bg-gold/5';
      case 'positive':
        return 'border-green-500/30 bg-green-500/5';
      case 'negative':
        return 'border-fatal-red/30 bg-fatal-red/5';
      case 'death':
        return 'border-fatal-red/50 bg-fatal-red/10';
      default:
        return 'border-white/10 bg-white/5';
    }
  };

  if (isRecent) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20, height: 0 }}
        animate={{ opacity: 1, x: 0, height: 'auto' }}
        exit={{ opacity: 0, x: 20, height: 0 }}
        transition={{ 
          duration: 0.3,
          delay: index * 0.05,
        }}
        className={`p-3 sm:p-4 rounded-xl border ${getBorderColor()} mb-2 sm:mb-3`}
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="mt-0.5">{getIcon()}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-holo-blue font-mono text-xs sm:text-sm font-bold">
                [Age. {log.year}]
              </span>
              {log.type === 'milestone' && (
                <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs">
                  里程碑
                </span>
              )}
            </div>
            {log.action && (
              <p className="text-white/50 text-xs mb-1 font-mono">
                选择: {log.action}
              </p>
            )}
            <p className="text-white/80 text-sm leading-relaxed">{log.event}</p>
            
            {/* Stat changes */}
            {log.statChanges && Object.keys(log.statChanges).length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                {Object.entries(log.statChanges).map(([key, value]) => {
                  if (value === 0) return null;
                  const isPositive = Number(value) > 0;
                  const displayValue = typeof value === 'number' && key === 'money' ? formatMoney(value as number) : value;
                  return (
                    <span
                      key={key}
                      className={`text-xs font-mono ${
                        isPositive ? 'text-green-400' : 'text-fatal-red'
                      }`}
                    >
                      {isPositive ? '+' : ''}{displayValue} {key === 'health' ? '健康' :
                        key === 'energy' ? '精力' :
                        key === 'mood' ? '心情' :
                        key === 'intelligence' ? '智力' :
                        key === 'charm' ? '魅力' :
                        key === 'creativity' ? '创造力' :
                        key === 'luck' ? '运气' :
                        key === 'karma' ? '人品' : key}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={`p-3 sm:p-4 rounded-xl border ${getBorderColor()} mb-2 sm:mb-3`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-holo-blue font-mono text-xs sm:text-sm font-bold">
              [Age. {log.year}]
            </span>
            {log.type === 'milestone' && (
              <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs">
                里程碑
              </span>
            )}
          </div>
          {log.action && (
            <p className="text-white/50 text-xs mb-1 font-mono">
              选择: {log.action}
            </p>
          )}
          <p className="text-white/80 text-sm leading-relaxed">{log.event}</p>
          
          {/* Stat changes */}
          {log.statChanges && Object.keys(log.statChanges).length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
              {Object.entries(log.statChanges).map(([key, value]) => {
                if (value === 0) return null;
                const isPositive = Number(value) > 0;
                const displayValue = typeof value === 'number' && key === 'money' ? formatMoney(value as number) : value;
                return (
                  <span
                    key={key}
                    className={`text-xs font-mono ${
                      isPositive ? 'text-green-400' : 'text-fatal-red'
                    }`}
                  >
                    {isPositive ? '+' : ''}{displayValue} {key === 'health' ? '健康' :
                      key === 'energy' ? '精力' :
                      key === 'mood' ? '心情' :
                      key === 'intelligence' ? '智力' :
                      key === 'charm' ? '魅力' :
                      key === 'creativity' ? '创造力' :
                      key === 'luck' ? '运气' :
                      key === 'karma' ? '人品' : key}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export function LogStream() {
  const { state } = useGame();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new logs are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [state.logs.length]);

  return (
    <div className="glass-card p-4 sm:p-6 h-full flex flex-col">
      <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mb-4">
        <ScrollText className="w-5 h-5 text-holo-blue" />
        命运文本流
      </h3>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 space-y-1.5 sm:space-y-2 max-h-[400px] sm:max-h-[500px]"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0, 210, 255, 0.3) transparent',
        }}
      >
        <AnimatePresence mode="popLayout">
          {state.logs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 sm:py-12 text-white/40"
            >
              <ScrollText className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-sm sm:text-base">人生尚未开始...</p>
              <p className="text-xs sm:text-sm mt-2">点击"立即投胎"开启你的旅程</p>
            </motion.div>
          ) : (
            state.logs.map((log, index) => (
              <LogItem key={`${log.year}-${index}`} log={log} index={index} isRecent={index < 5} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      {state.logs.length > 5 && (
        <div className="text-center pt-2 text-white/30 text-xs">
          滚动查看更多历史
        </div>
      )}
    </div>
  );
}
