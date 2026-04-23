import { motion } from 'framer-motion';
import { useGame } from '@/game/GameContext';
import { StatPanel } from './StatPanel';
import { LogStream } from './LogStream';
import { DecisionPanel } from './DecisionPanel';
import { DeathScreen } from './DeathScreen';

export function GameHUD() {
  const { state, currentEvent } = useGame();

  if (state.phase === 'GAMEOVER') {
    return <DeathScreen />;
  }

  return (
    <motion.div
      className="min-h-screen pt-24 pb-12 px-2 sm:px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-white mb-2">
            生存控制台
          </h2>
          <p className="text-white/50 text-xs sm:text-sm">
            Life Simulation Console v1.0
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Decision Panel - 在移动端显示在第一位 */}
          <motion.div
            className="lg:col-span-5 lg:order-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DecisionPanel event={currentEvent} />
          </motion.div>

          {/* Stat Panel - 在移动端显示在第二位 */}
          <motion.div
            className="lg:col-span-3 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatPanel />
          </motion.div>

          {/* Log Stream - 在移动端显示在第三位 */}
          <motion.div
            className="lg:col-span-4 lg:order-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <LogStream />
          </motion.div>
        </div>

        <motion.div
          className="mt-6 sm:mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-white/30 text-xs">
            💡 提示：精力耗尽会扣除健康值 | 35岁后健康自然衰减 | 100岁或健康归零时游戏结束
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
