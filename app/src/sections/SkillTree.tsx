import { motion } from 'framer-motion';
import { Brain, Dumbbell, Sparkles, Lightbulb, HeartHandshake, Code, Music, Stethoscope, Building2, Gamepad2, Mic2, Guitar } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';

const attributes = [
  { icon: Brain, label: '智力', value: 85, color: '#00D2FF' },
  { icon: Dumbbell, label: '体力', value: 70, color: '#FF6B35' },
  { icon: Sparkles, label: '魅力', value: 75, color: '#FF4B9D' },
  { icon: Lightbulb, label: '创造力', value: 90, color: '#FFD700' },
  { icon: HeartHandshake, label: '情商', value: 80, color: '#00FF88' },
];

const classes = [
  {
    icon: Code,
    name: '代码术士',
    subtitle: '程序员',
    stats: { int: '+15', str: '-10' },
    aura: '内卷光环',
    description: '智力+15，体力流失加速，自带光环【内卷】',
    color: 'blue',
  },
  {
    icon: Music,
    name: '吟游诗人',
    subtitle: '原创音乐人',
    stats: { cre: '+20', gold: '不稳定' },
    special: '一夜爆红',
    description: '创造力+20，解锁民谣/说唱技能分支，概率触发【一夜爆红】暴击',
    color: 'purple',
    branches: ['民谣', '说唱', '电子'],
  },
  {
    icon: Stethoscope,
    name: '治愈牧师',
    subtitle: '医生',
    stats: { int: '极高', time: '长' },
    skill: '起死回生',
    description: '智力要求极高，转职时间长，附带技能【起死回生】',
    color: 'green',
  },
  {
    icon: Building2,
    name: '王国守卫',
    subtitle: '公务员',
    stats: { income: '平稳', def: 'MAX' },
    shield: '编制护盾',
    description: '收益平稳，拥有最强防御属性【编制护盾】',
    color: 'gold',
  },
];

const easterEggs = [
  { icon: Gamepad2, name: '电竞选手', desc: '反应速度MAX，职业生涯短暂但辉煌' },
  { icon: Mic2, name: '说唱歌手', desc: 'Flow技巧+30，概率触发【地下王者】' },
  { icon: Guitar, name: '独立音乐人', desc: '创作自由度高，金币产出极不稳定' },
];

export function SkillTree() {
  return (
    <section id="skilltree" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">天赋树与职业</h2>
          <p className="section-subtitle">Skill Tree & Classes</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart - Attributes */}
          <GlassCard delay={0.1}>
            <h3 className="text-lg font-bold text-white mb-6 text-center">基础属性</h3>
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Simple pentagon visualization */}
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Background pentagon */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
                  <polygon
                    key={i}
                    points={attributes.map((_, j) => {
                      const angle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
                      const x = 100 + 80 * scale * Math.cos(angle);
                      const y = 100 + 80 * scale * Math.sin(angle);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="rgba(0, 210, 255, 0.2)"
                    strokeWidth="0.5"
                  />
                ))}
                
                {/* Attribute lines */}
                {attributes.map((_, i) => {
                  const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                  const x = 100 + 80 * Math.cos(angle);
                  const y = 100 + 80 * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1="100"
                      y1="100"
                      x2={x}
                      y2={y}
                      stroke="rgba(0, 210, 255, 0.2)"
                      strokeWidth="0.5"
                    />
                  );
                })}
                
                {/* Data polygon */}
                <motion.polygon
                  points={attributes.map((attr, i) => {
                    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                    const x = 100 + 80 * (attr.value / 100) * Math.cos(angle);
                    const y = 100 + 80 * (attr.value / 100) * Math.sin(angle);
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="rgba(0, 210, 255, 0.2)"
                  stroke="#00D2FF"
                  strokeWidth="2"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
                
                {/* Labels */}
                {attributes.map((attr, i) => {
                  const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                  const x = 100 + 95 * Math.cos(angle);
                  const y = 100 + 95 * Math.sin(angle);
                  return (
                    <text
                      key={attr.label}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={attr.color}
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {attr.label}
                    </text>
                  );
                })}
              </svg>
            </div>
            
            {/* Attribute List */}
            <div className="grid grid-cols-5 gap-2 mt-4">
              {attributes.map((attr) => (
                <div key={attr.label} className="text-center">
                  <attr.icon className="w-5 h-5 mx-auto mb-1" style={{ color: attr.color }} />
                  <p className="text-white/60 text-xs">{attr.label}</p>
                  <p className="text-white font-mono text-sm">{attr.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Classes */}
          <div className="space-y-4">
            {classes.map((cls, index) => (
              <GlassCard key={cls.name} delay={0.2 + index * 0.1} className="group">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-${cls.color}-500/10 border border-${cls.color}-500/30`}>
                    <cls.icon className={`w-6 h-6 text-${cls.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-bold">{cls.name}</h4>
                      <span className="text-white/50 text-xs">/ {cls.subtitle}</span>
                    </div>
                    <p className="text-white/60 text-sm mb-2">{cls.description}</p>
                    
                    {/* Stats */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(cls.stats).map(([key, value]) => (
                        <span key={key} className="px-2 py-0.5 rounded bg-white/5 text-xs text-white/70">
                          {key === 'int' ? '🧠' : key === 'str' ? '🏃' : key === 'cre' ? '💡' : key === 'gold' ? '💰' : key === 'time' ? '⏱️' : key === 'income' ? '💵' : key === 'def' ? '🛡️' : '✨'} {value}
                        </span>
                      ))}
                      {cls.aura && (
                        <span className="px-2 py-0.5 rounded bg-holo-blue/20 text-xs text-holo-blue">
                          ✨ {cls.aura}
                        </span>
                      )}
                      {cls.special && (
                        <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-xs text-yellow-400">
                          ⚡ {cls.special}
                        </span>
                      )}
                      {cls.skill && (
                        <span className="px-2 py-0.5 rounded bg-green-500/20 text-xs text-green-400">
                          🔮 {cls.skill}
                        </span>
                      )}
                      {cls.shield && (
                        <span className="px-2 py-0.5 rounded bg-gold/20 text-xs text-gold">
                          🛡️ {cls.shield}
                        </span>
                      )}
                    </div>

                    {/* Branches */}
                    {cls.branches && (
                      <div className="flex gap-2 mt-2">
                        {cls.branches.map((branch) => (
                          <span key={branch} className="px-2 py-0.5 rounded-full bg-purple-500/20 text-xs text-purple-300">
                            {branch}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Easter Egg Classes */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-center text-white/50 text-sm mb-4">🎮 彩蛋职业分支</p>
          <div className="flex flex-wrap justify-center gap-4">
            {easterEggs.map((egg, index) => (
              <motion.div
                key={egg.name}
                className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-holo-blue/30 transition-colors cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <egg.icon className="w-4 h-4 text-holo-blue" />
                <span className="text-white text-sm">{egg.name}</span>
                <span className="text-white/40 text-xs">{egg.desc}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
