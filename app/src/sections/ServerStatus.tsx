import { motion } from 'framer-motion';
import { Globe, Cog, Map, Shield } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { AnimatedNumber } from '@/components/AnimatedNumber';

const stats = [
  {
    icon: Globe,
    label: '当前在线玩家',
    value: 8103452198,
    suffix: '',
    liveUpdate: true,
    description: '数字模拟实时小幅增减',
  },
  {
    icon: Cog,
    label: '物理引擎状态',
    value: 100,
    suffix: '%',
    liveUpdate: false,
    description: '真实运作（引力常数、热力学定律稳定运行中）',
  },
  {
    icon: Map,
    label: '地图边界拓展',
    value: 0,
    suffix: '',
    liveUpdate: false,
    description: 'Lv. 无限大（太阳系副本开发进度 0.0001%）',
    customDisplay: 'Lv. ∞',
  },
  {
    icon: Shield,
    label: 'GM 干预次数',
    value: 0,
    suffix: '',
    liveUpdate: false,
    description: '客服系统已永久离线，请玩家自行探索',
    customDisplay: '0 次',
  },
];

export function ServerStatus() {
  return (
    <section id="server-status" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">实时服务器状态面板</h2>
          <p className="section-subtitle">Server Status Monitor</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <GlassCard key={stat.label} delay={index * 0.1}>
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-4 p-3 rounded-full bg-holo-blue/10 border border-holo-blue/30">
                  <stat.icon className="w-6 h-6 text-holo-blue" />
                </div>

                {/* Label */}
                <p className="text-white/60 text-sm mb-2">{stat.label}</p>

                {/* Value */}
                <div className="text-3xl md:text-4xl font-mono font-bold text-white mb-2">
                  {stat.customDisplay ? (
                    <span>{stat.customDisplay}</span>
                  ) : (
                    <AnimatedNumber
                      value={stat.value}
                      liveUpdate={stat.liveUpdate}
                      format={(n) => n.toLocaleString() + stat.suffix}
                    />
                  )}
                </div>

                {/* Description */}
                <p className="text-white/40 text-xs">{stat.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
