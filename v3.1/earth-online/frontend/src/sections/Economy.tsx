import { memo } from 'react';
import { motion } from 'framer-motion';
import { Coins, Clock, Zap, Sword, Home, Hospital, TrendingUp } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';

const resources = [
  {
    icon: Coins,
    name: '金币',
    description: '通用货币，用于交易、购买装备、解锁服务',
    color: '#FFD700',
  },
  {
    icon: Clock,
    name: '时间',
    description: '不可再生资源，每秒都在流逝',
    color: '#00D2FF',
  },
  {
    icon: Zap,
    name: '精力',
    description: '行动能量，决定每日可执行任务数量',
    color: '#FF6B35',
  },
];

const pvpBattlefields = [
  { icon: Home, name: '优质学区', desc: '教育资源争夺战' },
  { icon: TrendingUp, name: '核心地段房产', desc: '长线吸血Debuff来源' },
  { icon: Hospital, name: '三甲医院床位', desc: '终局阶段关键资源' },
  { icon: Sword, name: '职场晋升名额', desc: '零和博弈战场' },
];

export const Economy = memo(function Economy() {
  return (
    <section id="economy" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">硬核经济系统</h2>
          <p className="section-subtitle">Economy - The Impossible Triangle</p>
        </motion.div>

        {/* Impossible Triangle */}
        <motion.div
          className="relative max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative aspect-square">
            <svg viewBox="0 0 300 260" className="w-full h-full">
              {/* Triangle */}
              <motion.polygon
                points="150,20 280,240 20,240"
                fill="none"
                stroke="rgba(0, 210, 255, 0.3)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5 }}
              />
              
              {/* Nodes */}
              {[
                { x: 150, y: 20, icon: Coins, label: '金币', color: '#FFD700' },
                { x: 280, y: 240, icon: Clock, label: '时间', color: '#00D2FF' },
                { x: 20, y: 240, icon: Zap, label: '精力', color: '#FF6B35' },
              ].map((node, i) => (
                <motion.g key={node.label}>
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r="25"
                    fill="rgba(8, 11, 26, 0.9)"
                    stroke={node.color}
                    strokeWidth="2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.2 }}
                  />
                  <foreignObject
                    x={node.x - 10}
                    y={node.y - 10}
                    width="20"
                    height="20"
                  >
                    <node.icon className="w-5 h-5" style={{ color: node.color }} />
                  </foreignObject>
                  <motion.text
                    x={node.x}
                    y={node.y + 45}
                    textAnchor="middle"
                    fill={node.color}
                    fontSize="14"
                    fontWeight="bold"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 + i * 0.2 }}
                  >
                    {node.label}
                  </motion.text>
                </motion.g>
              ))}
            </svg>
          </div>

          {/* Center Warning */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2 }}
          >
            <p className="text-fatal-red font-bold text-lg">不可能三角</p>
            <p className="text-white/50 text-xs">无法同时拥有</p>
          </motion.div>
        </motion.div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {resources.map((resource, index) => (
            <GlassCard key={resource.name} delay={index * 0.1}>
              <div className="flex flex-col items-center text-center">
                <div 
                  className="mb-4 p-4 rounded-full border-2"
                  style={{ borderColor: resource.color, backgroundColor: `${resource.color}15` }}
                >
                  <resource.icon className="w-8 h-8" style={{ color: resource.color }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{resource.name}</h3>
                <p className="text-white/60 text-sm">{resource.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Life Stage Hint */}
        <motion.div
          className="glass-card p-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-center text-white/70">
            <span className="text-holo-blue">年轻时</span>有时间精力缺金币 → 
            <span className="text-fatal-red mx-2">中年时</span>有金币精力缺时间 → 
            <span className="text-gold ml-2">老年时</span>有金币时间缺精力
          </p>
        </motion.div>

        {/* PvP Battlefields */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-white text-center mb-6">
            <Sword className="w-5 h-5 inline-block mr-2 text-fatal-red" />
            PvP 资源争夺战场
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pvpBattlefields.map((field, index) => (
              <motion.div
                key={field.name}
                className="p-4 rounded-xl bg-white/5 border border-fatal-red/20 hover:border-fatal-red/40 transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <field.icon className="w-6 h-6 text-fatal-red mb-2" />
                <p className="text-white font-medium text-sm">{field.name}</p>
                <p className="text-white/40 text-xs">{field.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
});
