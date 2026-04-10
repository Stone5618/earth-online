import { motion } from 'framer-motion';
import { Coins, Heart, Trophy, Megaphone, Mountain, Dna, AlertTriangle } from 'lucide-react';
import { TypewriterText } from '@/components/TypewriterText';

const winConditions = [
  {
    icon: Coins,
    title: '财富大亨',
    desc: '解锁"福布斯排行榜"成就',
    color: 'gold',
  },
  {
    icon: Heart,
    title: '现世安稳',
    desc: '幸福度常年维持在 80% 以上',
    color: 'pink',
  },
  {
    icon: Trophy,
    title: '青史留名',
    desc: '学术、艺术、体育等领域解锁人类天花板',
    color: 'purple',
  },
  {
    icon: Megaphone,
    title: '一呼百应',
    desc: '获得超高社会影响力',
    color: 'blue',
  },
  {
    icon: Mountain,
    title: '探险大玩家',
    desc: '地图探索度 99%',
    color: 'green',
  },
  {
    icon: Dna,
    title: '基因传承',
    desc: '成功培育优秀的下一代玩家',
    color: 'cyan',
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  gold: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-400/30' },
  pink: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-400/30' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-400/30' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-400/30' },
  green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-400/30' },
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-400/30' },
};

export function WinConditions() {
  return (
    <section className="relative py-20 px-4">
      {/* Spotlight effect */}
      <div className="absolute inset-0 bg-gradient-radial opacity-50 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title text-gold glow-text-gold">胜利条件</h2>
          <p className="section-subtitle">Win Conditions - Choose Your Path</p>
          <p className="text-white/60 mt-4 max-w-2xl mx-auto">
            在《地球Online》中，没有绝对的主线通关方式，你可以选择自己的成就路线
          </p>
        </motion.div>

        {/* Win Condition Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {winConditions.map((condition, index) => {
            const colors = colorClasses[condition.color];
            return (
              <motion.div
                key={condition.title}
                className={`glass-card p-6 text-center border-${colors.border}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: `0 0 30px rgba(255, 215, 0, 0.3)`,
                }}
              >
                <motion.div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <condition.icon className={`w-8 h-8 ${colors.text}`} />
                </motion.div>
                <h4 className={`font-bold ${colors.text} mb-2`}>{condition.title}</h4>
                <p className="text-white/50 text-xs">{condition.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Ultimate Warning */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
        >
          <div className="glass-card p-8 border-fatal-red/50 text-center">
            <AlertTriangle className="w-12 h-12 text-fatal-red mx-auto mb-4 animate-pulse" />
            <h3 className="text-fatal-red font-bold text-xl mb-4">
              [ 终极警告 ]
            </h3>
            <p className="text-white/80 text-lg">
              <TypewriterText
                text="玩家寿命上限通常不超过 100 级（年）。时间不可逆，体验即全部意义。请享受你的游玩过程！"
                speed={40}
                variant="red"
              />
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
