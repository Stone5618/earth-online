import { memo } from 'react';
import { motion } from 'framer-motion';
import { Mountain, CloudRain, Sun, Lock, Key, Plane } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';

const features = [
  {
    icon: Mountain,
    title: '多样生态系统',
    description: '从钢铁丛林到自然荒野，从极地冰川到热带海岛，每个区域都有独特的环境机制。',
  },
  {
    icon: CloudRain,
    title: '动态天气系统',
    description: '24/7 实时运行，随机触发暴雨、暴雪、沙尘暴等环境事件，影响玩家状态。',
  },
  {
    icon: Sun,
    title: '昼夜循环',
    description: '真实的昼夜交替，不同时间段解锁不同的任务和事件。',
  },
];

const hiddenAreas = [
  {
    icon: Plane,
    name: '私人岛屿',
    requirement: '私人飞机 + 岛屿所有权证书',
    difficulty: 'SSR',
  },
  {
    icon: Key,
    name: 'VIP专属区域',
    requirement: '特定通行证或会员资格',
    difficulty: 'SR',
  },
  {
    icon: Lock,
    name: '禁区',
    requirement: '特殊权限或剧情解锁',
    difficulty: '???',
  },
];

export const OpenWorld = memo(function OpenWorld() {
  return (
    <section id="openworld" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">开放世界探索</h2>
          <p className="section-subtitle">The Open World</p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <GlassCard key={feature.title} delay={index * 0.1}>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-4 rounded-full bg-holo-blue/10 border border-holo-blue/30">
                  <feature.icon className="w-8 h-8 text-holo-blue" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Hidden Areas */}
        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-gold" />
            <h3 className="text-xl font-bold text-white">隐藏区域</h3>
            <span className="text-white/50 text-sm">需要特殊道具才能解锁的高级VIP地图</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hiddenAreas.map((area, index) => (
              <motion.div
                key={area.name}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-gold/30 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <area.icon className="w-5 h-5 text-gold" />
                  <span className="text-white font-medium">{area.name}</span>
                  <span className={`ml-auto px-2 py-0.5 rounded text-xs font-mono ${
                    area.difficulty === 'SSR' ? 'bg-yellow-500/20 text-yellow-400' :
                    area.difficulty === 'SR' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {area.difficulty}
                  </span>
                </div>
                <p className="text-white/50 text-sm">
                  <span className="text-white/30">解锁条件：</span>
                  {area.requirement}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
});
