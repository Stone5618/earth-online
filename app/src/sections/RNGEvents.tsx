import { motion } from 'framer-motion';
import { Sparkles, CloudRain, Flame, Zap, TrendingDown, Cpu, Biohazard } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';

const dailyDrops = [
  {
    icon: Sparkles,
    name: '捡到一百块',
    effect: '好运Buff +1天',
    type: 'positive',
    rarity: '常见',
  },
  {
    icon: CloudRain,
    name: '踩到狗屎',
    effect: '心情 -10',
    type: 'negative',
    rarity: '常见',
  },
  {
    icon: Zap,
    name: '偶遇贵人',
    effect: '人脉 +1，机遇触发率提升',
    type: 'positive',
    rarity: '稀有',
  },
  {
    icon: Flame,
    name: '手机碎屏',
    effect: '金币 -500~2000',
    type: 'negative',
    rarity: '常见',
  },
];

const worldEvents = [
  {
    icon: TrendingDown,
    name: '经济危机',
    desc: '全服金币贬值，失业率上升，所有玩家强制参与',
    impact: '灾难级',
    color: 'red',
  },
  {
    icon: Cpu,
    name: '技术革命',
    desc: '新职业解锁，旧职业淘汰，技能树重置',
    impact: '变革级',
    color: 'blue',
  },
  {
    icon: Biohazard,
    name: '全球流行病',
    desc: '健康值持续下降，社交系统受限',
    impact: '灾难级',
    color: 'purple',
  },
];

export function RNGEvents() {
  return (
    <section className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">随机事件系统</h2>
          <p className="section-subtitle">RNG Events - Expect the Unexpected</p>
        </motion.div>

        {/* Daily Drops */}
        <div className="mb-12">
          <motion.h3
            className="text-lg font-bold text-white mb-6 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-5 h-5 text-holo-blue" />
            日常掉落
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dailyDrops.map((event, index) => (
              <GlassCard key={event.name} delay={index * 0.1}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${event.type === 'positive' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <event.icon className={`w-5 h-5 ${event.type === 'positive' ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{event.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        event.rarity === '稀有' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-white/50'
                      }`}>
                        {event.rarity}
                      </span>
                    </div>
                    <p className={`text-xs ${event.type === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                      {event.effect}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* World Events */}
        <div>
          <motion.h3
            className="text-lg font-bold text-white mb-6 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Flame className="w-5 h-5 text-fatal-red" />
            世界大事件
            <span className="text-white/50 text-sm font-normal">- 服务器级别更新，所有玩家强制参与</span>
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {worldEvents.map((event, index) => (
              <motion.div
                key={event.name}
                className="glass-card p-6 border-fatal-red/30"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl bg-${event.color}-500/10 border border-${event.color}-500/30`}>
                    <event.icon className={`w-6 h-6 text-${event.color}-400`} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{event.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded bg-${event.color}-500/20 text-${event.color}-400`}>
                      {event.impact}
                    </span>
                  </div>
                </div>
                <p className="text-white/60 text-sm">{event.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
