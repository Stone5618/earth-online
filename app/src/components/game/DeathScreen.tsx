import { motion } from 'framer-motion';
import { Skull, RotateCcw, Home, Trophy, Activity, Heart, Star, CheckCircle2, XCircle } from 'lucide-react';
import { useGame } from '@/game/GameContext';
import { GlowingButton } from '@/components/GlowingButton';
import { determineEnding } from '@/game/gameState';

export function DeathScreen() {
  const { state, resetGame } = useGame();
  const { stats, logs, achievements, challenge, challengeVictory } = state;

  // 判定结局
  const ending = determineEnding(stats);

  const avgMood = Math.min(100, Math.max(0, Math.round(stats.mood)));
  const majorEventsCount = logs.filter(l => l.type === 'milestone').length;
  const negativeEventsCount = logs.filter(l => l.type === 'negative').length;
  const positiveEventsCount = logs.filter(l => l.type === 'positive').length;
  const achievementsUnlocked = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-deep-space/95 backdrop-blur-sm"
      />
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 max-w-4xl w-full my-4"
      >
        <div className="glass-card p-6 md:p-8 border-fatal-red/30">
          {/* 挑战结果 */}
          {challenge && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl md:text-3xl">{challenge.icon}</span>
                <h2 className="text-xl md:text-2xl font-bold text-white">{challenge.name}</h2>
              </div>
              <p className="text-white/70 mb-4">{challenge.description}</p>
              {challengeVictory !== undefined && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
                    challengeVictory 
                      ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                      : 'bg-red-500/20 border border-red-500/50 text-red-400'
                  }`}
                >
                  {challengeVictory ? (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="text-lg font-bold">挑战成功！</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6" />
                      <span className="text-lg font-bold">挑战失败</span>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          <div className="text-center mb-8">
            {/* 根据结局类型展示不同图标 */}
            {ending ? (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-full bg-holo-blue/20 border-2 border-holo-blue/50 flex items-center justify-center"
              >
                <span className="text-4xl md:text-5xl">{ending.icon}</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-full bg-fatal-red/20 border-2 border-fatal-red/50 flex items-center justify-center"
              >
                <Skull className="w-10 h-10 md:w-12 md:h-12 text-fatal-red" />
              </motion.div>
            )}
            
            {ending ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-gold mb-2">
                  {ending.name}
                </h1>
                <p className="text-white/80 text-lg md:text-xl">
                  {ending.description}
                </p>
              </motion.div>
            ) : (
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-fatal-red mb-2">
                  游戏结束
                </h1>
                <p className="text-white/60 mb-4">
                  {state.deathReason}
                </p>
                
                {state.finalTitle && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6"
                  >
                    <p className="text-gold text-xl md:text-2xl font-bold">
                      {state.finalTitle}
                    </p>
                    {state.finalComment && (
                      <p className="text-white/50 mt-2 italic text-sm md:text-base">
                        "{state.finalComment}"
                      </p>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Detailed Stats */}
          <div className="mb-8">
            <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-holo-blue" />
              生涯统计
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              <div className="p-3 md:p-4 rounded-xl bg-white/5 text-center">
                <p className="text-white/50 text-xs md:text-sm">享年</p>
                <p className="text-2xl md:text-3xl font-bold text-holo-blue">{stats.age}</p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-white/5 text-center">
                <p className="text-white/50 text-xs md:text-sm">最终积蓄</p>
                <p className="text-2xl md:text-3xl font-bold text-holo-blue">{stats.money.toLocaleString()}</p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-white/5 text-center">
                <p className="text-white/50 text-xs md:text-sm">最终心情</p>
                <p className="text-2xl md:text-3xl font-bold text-holo-blue">{avgMood}</p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-white/5 text-center">
                <p className="text-white/50 text-xs md:text-sm">成就解锁</p>
                <p className="text-2xl md:text-3xl font-bold text-holo-blue">{achievementsUnlocked}/{totalAchievements}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="p-3 md:p-4 rounded-xl bg-white/5 text-center">
                <p className="text-white/50 text-xs md:text-sm mb-1">里程碑事件</p>
                <p className="text-xl md:text-2xl font-bold text-gold flex items-center justify-center gap-1 md:gap-2">
                  <Star className="w-3 h-3 md:w-4 md:h-4" />
                  {majorEventsCount}
                </p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-white/5 text-center">
                <p className="text-white/50 text-xs md:text-sm mb-1">积极事件</p>
                <p className="text-xl md:text-2xl font-bold text-green-400">{positiveEventsCount}</p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-white/5 text-center">
                <p className="text-white/50 text-xs md:text-sm mb-1">消极事件</p>
                <p className="text-xl md:text-2xl font-bold text-fatal-red">{negativeEventsCount}</p>
              </div>
            </div>
          </div>

          {/* Final Stats Grid */}
          <div className="mb-8">
            <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-fatal-red" />
              最终属性
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {[
                { label: '健康', value: stats.health, color: 'text-green-400' },
                { label: '精力', value: stats.energy, color: 'text-yellow-400' },
                { label: '心情', value: stats.mood, color: 'text-pink-400' },
                { label: '智力', value: stats.intelligence, color: 'text-holo-blue' },
                { label: '魅力', value: stats.charm, color: 'text-purple-400' },
                { label: '创造力', value: stats.creativity, color: 'text-orange-400' },
                { label: '运气', value: stats.luck, color: 'text-green-300' },
                { label: '人品', value: stats.karma, color: 'text-blue-400' },
              ].map((stat) => (
                <div key={stat.label} className="p-2 md:p-3 rounded-xl bg-white/5 text-center">
                  <p className="text-white/50 text-xs">{stat.label}</p>
                  <p className={`text-lg md:text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Unlocked Achievements */}
          {achievementsUnlocked > 0 && (
            <div className="mb-8">
              <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                解锁成就
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                {achievements
                  .filter(a => a.unlocked)
                  .map((achievement) => (
                    <div key={achievement.id} className="p-2 md:p-3 rounded-xl bg-gold/5 border border-gold/20">
                      <div className="flex items-center gap-1 md:gap-2 mb-1">
                        <span className="text-lg md:text-xl">{achievement.icon}</span>
                        <span className="text-gold font-bold text-xs md:text-sm">{achievement.name}</span>
                      </div>
                      <p className="text-white/50 text-xs">{achievement.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <GlowingButton
              onClick={resetGame}
              variant="secondary"
              className="flex-1"
            >
              <RotateCcw className="w-5 h-5" />
              再来一局
            </GlowingButton>
            <GlowingButton
              onClick={() => {
                window.location.reload();
              }}
              variant="primary"
              className="flex-1"
            >
              <Home className="w-5 h-5" />
              返回主页
            </GlowingButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
