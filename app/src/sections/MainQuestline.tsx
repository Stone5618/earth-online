import { motion } from 'framer-motion';
import { BookOpen, Briefcase, Home, Baby, AlertTriangle, Skull, Shield } from 'lucide-react';

const phases = [
  {
    level: 'Lv.1 - Lv.18',
    title: '新手村阶段',
    subtitle: 'Tutorial Phase',
    icon: BookOpen,
    color: 'from-green-400 to-emerald-500',
    content: {
      main: '九年义务教育、服从长辈指令',
      boss: {
        name: '高考/大学入学考试',
        desc: '关底史诗级 BOSS（影响后续转职分支）',
      },
    },
  },
  {
    level: 'Lv.18 - Lv.60',
    title: '爆肝阶段',
    subtitle: 'Grinding Phase',
    icon: Briefcase,
    color: 'from-blue-400 to-cyan-500',
    content: {
      main: '打怪升级（搬砖/打工）、组队副本（恋爱/婚姻）',
      dungeons: [
        { icon: Home, name: '买房还贷', desc: '长达30年的持续掉血Debuff（游戏术语：长线吸血Debuff）' },
        { icon: Baby, name: '抚养新人', desc: '资源极速消耗，24/7全天候副本' },
      ],
      event: {
        name: 'Lv.35强制剧本杀',
        desc: '必然触发【中年危机】隐藏剧情',
        icon: AlertTriangle,
      },
    },
  },
  {
    level: 'Lv.60+',
    title: '终局结算',
    subtitle: 'Endgame Phase',
    icon: Skull,
    color: 'from-purple-400 to-pink-500',
    content: {
      main: '体力上限与恢复速度大幅削减',
      challenge: {
        name: '对抗【疾病】怪',
        desc: '高频刷新，依靠前期积累的【金币】与【子嗣公会】进行防御',
        icon: Shield,
      },
    },
  },
];

export function MainQuestline() {
  return (
    <section id="questline" className="relative py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">主线副本与时间轴</h2>
          <p className="section-subtitle">Main Questline Timeline</p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-holo-blue/50 via-holo-blue/30 to-transparent" />

          {/* Phases */}
          <div className="space-y-12">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.level}
                className={`relative flex flex-col md:flex-row items-start gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                {/* Node */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                  <motion.div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${phase.color} p-0.5`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-full h-full rounded-full bg-deep-space flex items-center justify-center">
                      <phase.icon className="w-7 h-7 text-white" />
                    </div>
                  </motion.div>
                  {/* Level badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full bg-deep-space border border-holo-blue/30 text-holo-blue text-xs font-mono">
                      {phase.level}
                    </span>
                  </div>
                </div>

                {/* Content Card */}
                <div className={`ml-24 md:ml-0 md:w-[45%] ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{phase.title}</h3>
                    <p className="text-xs text-white/50 font-mono mb-4">{phase.subtitle}</p>
                    
                    <p className="text-white/70 text-sm mb-4">{phase.content.main}</p>

                    {/* BOSS */}
                    {phase.content.boss && (
                      <div className="p-3 rounded-lg bg-fatal-red/10 border border-fatal-red/30">
                        <p className="text-fatal-red text-xs font-mono mb-1">关底 BOSS</p>
                        <p className="text-white font-bold">【{phase.content.boss.name}】</p>
                        <p className="text-white/60 text-xs mt-1">{phase.content.boss.desc}</p>
                      </div>
                    )}

                    {/* Dungeons */}
                    {phase.content.dungeons && (
                      <div className="space-y-2 mt-4">
                        <p className="text-white/50 text-xs font-mono">高难副本</p>
                        {phase.content.dungeons.map((dungeon) => (
                          <div key={dungeon.name} className="flex items-start gap-3 p-2 rounded bg-white/5">
                            <dungeon.icon className="w-4 h-4 text-holo-blue mt-0.5" />
                            <div>
                              <p className="text-white text-sm font-medium">【{dungeon.name}】</p>
                              <p className="text-white/50 text-xs">{dungeon.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Random Event */}
                    {phase.content.event && (
                      <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <div className="flex items-center gap-2 mb-1">
                          <phase.content.event.icon className="w-4 h-4 text-yellow-400" />
                          <p className="text-yellow-400 text-xs font-mono">随机事件</p>
                        </div>
                        <p className="text-white font-bold">【{phase.content.event.name}】</p>
                        <p className="text-white/60 text-xs mt-1">{phase.content.event.desc}</p>
                      </div>
                    )}

                    {/* Challenge */}
                    {phase.content.challenge && (
                      <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-1">
                          <phase.content.challenge.icon className="w-4 h-4 text-purple-400" />
                          <p className="text-purple-400 text-xs font-mono">生存挑战</p>
                        </div>
                        <p className="text-white font-bold">【{phase.content.challenge.name}】</p>
                        <p className="text-white/60 text-xs mt-1">{phase.content.challenge.desc}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
