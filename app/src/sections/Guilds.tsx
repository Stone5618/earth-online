import { motion } from 'framer-motion';
import { Users, Building2, UserCircle, Scale, AlertTriangle, Lock, LogOut, Ban } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';

const guildTypes = [
  {
    type: '强制绑定',
    icon: Lock,
    color: 'red',
    guilds: [
      {
        name: '家族',
        subtitle: 'Family Guild',
        description: '出生即自动加入，退会惩罚极高，包含复杂的亲缘关系网。',
        penalty: '退会可能导致【孤独终老】Debuff',
      },
    ],
  },
  {
    type: '自由加入',
    icon: LogOut,
    color: 'blue',
    guilds: [
      {
        name: '公司',
        subtitle: 'Company Guild',
        description: '为获取金币而加入，随时可被踢出，存在【裁员】风险。',
        penalty: '随时可能失去【稳定收入】Buff',
      },
      {
        name: '朋友圈',
        subtitle: 'Social Circle',
        description: '基于好感度建立的松散联盟，可自由进出。',
        penalty: '维护成本：时间 + 精力',
      },
    ],
  },
];

const reputationSystem = {
  title: '声望系统 (Karma)',
  metrics: [
    { label: '人品值', desc: '日常行为积累的道德分数' },
    { label: '个人征信', desc: '金融系统的信用评分' },
    { label: '社会口碑', desc: 'NPC对你的整体评价' },
  ],
  penalties: [
    { icon: Ban, name: '封号', desc: '社会性死亡，失去大部分交互权限' },
    { icon: AlertTriangle, name: '小黑屋', desc: '物理隔离，强制下线' },
  ],
};

export function Guilds() {
  return (
    <section id="guilds" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">公会与声望</h2>
          <p className="section-subtitle">Guilds & Reputation System</p>
        </motion.div>

        {/* Guild Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {guildTypes.map((type, typeIndex) => (
            <motion.div
              key={type.type}
              initial={{ opacity: 0, x: typeIndex === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: typeIndex * 0.1 }}
            >
              <div className={`flex items-center gap-2 mb-4 ${type.color === 'red' ? 'text-fatal-red' : 'text-holo-blue'}`}>
                <type.icon className="w-5 h-5" />
                <span className="font-bold">{type.type}公会</span>
              </div>
              
              <div className="space-y-4">
                {type.guilds.map((guild, guildIndex) => (
                  <GlassCard key={guild.name} delay={typeIndex * 0.1 + guildIndex * 0.1}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${type.color === 'red' ? 'bg-fatal-red/10 border-fatal-red/30' : 'bg-holo-blue/10 border-holo-blue/30'} border`}>
                        {type.type === '强制绑定' ? <Users className="w-6 h-6 text-fatal-red" /> : 
                         guild.name === '公司' ? <Building2 className="w-6 h-6 text-holo-blue" /> : 
                         <UserCircle className="w-6 h-6 text-holo-blue" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-bold">{guild.name}</h4>
                          <span className="text-white/50 text-xs font-mono">{guild.subtitle}</span>
                        </div>
                        <p className="text-white/60 text-sm mb-2">{guild.description}</p>
                        <div className={`flex items-center gap-2 text-xs ${type.color === 'red' ? 'text-fatal-red' : 'text-yellow-400'}`}>
                          <AlertTriangle className="w-3 h-3" />
                          <span>{guild.penalty}</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reputation System */}
        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-6 h-6 text-gold" />
            <h3 className="text-xl font-bold text-white">{reputationSystem.title}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {reputationSystem.metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                className="text-center p-4 rounded-xl bg-white/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <p className="text-gold font-bold mb-1">{metric.label}</p>
                <p className="text-white/50 text-sm">{metric.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Warning */}
          <motion.div
            className="p-4 rounded-xl bg-fatal-red/10 border border-fatal-red/30"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-fatal-red text-sm font-medium mb-3">
              <AlertTriangle className="w-4 h-4 inline-block mr-2" />
              触发【违法乱纪】将遭到系统通缉
            </p>
            <div className="grid grid-cols-2 gap-4">
              {reputationSystem.penalties.map((penalty) => (
                <div key={penalty.name} className="flex items-center gap-3">
                  <penalty.icon className="w-5 h-5 text-fatal-red" />
                  <div>
                    <p className="text-white font-medium">{penalty.name}</p>
                    <p className="text-white/50 text-xs">{penalty.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
