import { memo } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Fingerprint, Backpack, Star, Circle, Skull } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';

const cards = [
  {
    icon: Shuffle,
    title: '出生抽卡',
    subtitle: 'Birth RNG',
    description: '无法自选！你的出生地（服务器）、家境（初始金币库）、基因（初始种族值）完全由 RNG（随机数生成器）决定。',
    color: 'blue',
  },
  {
    icon: Fingerprint,
    title: '终身绑定 ID',
    subtitle: 'Permanent ID',
    description: '虹膜与指纹防伪，账号不可交易，密码不可重置。一次注册，终身有效。',
    color: 'blue',
  },
  {
    icon: Backpack,
    title: '初始资源包',
    subtitle: 'Starter Pack',
    description: '随机分配初始资源，从含着金汤匙的SSR到地狱模式的黑铁级，一切皆有可能。',
    color: 'blue',
    tiers: [
      { icon: Star, label: 'SSR级', text: '含着金汤匙', desc: '极小概率', color: 'text-yellow-400' },
      { icon: Circle, label: 'R级', text: '普通NPC开局', desc: '高概率', color: 'text-blue-400' },
      { icon: Skull, label: '黑铁级', text: '地狱模式-极限生存', desc: '存在一定概率', color: 'text-red-400' },
    ],
  },
];

export const CharacterCreation = memo(function CharacterCreation() {
  return (
    <section id="character" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">角色创建系统</h2>
          <p className="section-subtitle">Character Creation - RNG Based</p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <GlassCard key={card.title} delay={index * 0.1} className="h-full">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-holo-blue/10 border border-holo-blue/30">
                    <card.icon className="w-6 h-6 text-holo-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{card.title}</h3>
                    <p className="text-xs text-white/50 font-mono">{card.subtitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/70 text-sm leading-relaxed mb-4 flex-grow">
                  {card.description}
                </p>

                {/* Tiers (for backpack card) */}
                {card.tiers && (
                  <div className="space-y-3 mt-auto">
                    {card.tiers.map((tier) => (
                      <motion.div
                        key={tier.label}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                      >
                        <tier.icon className={`w-4 h-4 ${tier.color}`} fill="currentColor" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${tier.color}`}>{tier.label}</span>
                            <span className="text-white/80 text-sm">{tier.text}</span>
                          </div>
                          <p className="text-white/40 text-xs">{tier.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
});
