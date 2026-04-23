import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Zap, TrendingUp, Trophy, Target, Heart } from 'lucide-react';

interface SurvivalGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SurvivalGuide({ isOpen, onClose }: SurvivalGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-[3000]"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-0 z-[3001] flex items-center justify-center p-4"
          >
            <div className="glass-card p-8 relative w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-white/60" />
              </button>
              
              <div className="flex items-center gap-4 mb-8">
                <BookOpen className="w-10 h-10 text-holo-blue" />
                <div>
                  <h2 className="text-3xl font-bold text-white">生存指南</h2>
                  <p className="text-white/50">地球Online v1.0.0 游戏完全攻略</p>
                </div>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    游戏玩法
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <p className="text-white/80">
                      点击「立即投胎」开始你的人生旅程！游戏会随机分配你的：
                    </p>
                    <ul className="list-disc list-inside text-white/70 space-y-1 ml-2">
                      <li><span className="text-holo-blue font-semibold">家庭等级</span> - 决定你的出生起点和初始资源</li>
                      <li><span className="text-purple-400 font-semibold">出生服务器</span> - 不同的地区有不同的特色</li>
                      <li><span className="text-gold font-semibold">天赋</span> - 你的特殊能力</li>
                    </ul>
                    <p className="text-white/80 mt-4">
                      每年你会面临一个事件，做出你的选择来影响你的人生走向！
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    属性说明
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: '健康', color: 'text-red-400', desc: '你的生命值，降到0游戏结束' },
                      { name: '精力', color: 'text-yellow-400', desc: '你的行动力，每年会恢复' },
                      { name: '金钱', color: 'text-holo-blue', desc: '你的财富，可以买东西' },
                      { name: '心情', color: 'text-pink-400', desc: '你的情绪状态' },
                      { name: '智力', color: 'text-purple-400', desc: '影响学习和成就' },
                      { name: '魅力', color: 'text-pink-400', desc: '社交和人际关系' },
                      { name: '创造力', color: 'text-yellow-400', desc: '艺术和创新能力' },
                      { name: '运气', color: 'text-gold', desc: '影响随机事件的走向' },
                      { name: '人品', color: 'text-green-400', desc: '你的善恶值' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className={`font-semibold ${stat.color}`}>{stat.name}</div>
                        <div className="text-xs text-white/50">{stat.desc}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-gold" />
                    成就系统
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-white/80 mb-3">
                      在游戏过程中达成各种成就！成就包括：
                    </p>
                    <ul className="list-disc list-inside text-white/70 space-y-1 ml-2">
                      <li>年龄相关成就（18岁、35岁、60岁、100岁）</li>
                      <li>属性成就（高智商、高魅力、高财富等）</li>
                      <li>特殊经历成就</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    获胜条件
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-white/80 mb-3">
                      游戏没有绝对的胜利！你的目标是：
                    </p>
                    <ul className="list-disc list-inside text-white/70 space-y-1 ml-2">
                      <li>尽可能长寿（活到100岁解锁「百岁老人」成就）</li>
                      <li>积累财富（累计100万解锁「富甲一方」成就）</li>
                      <li>解锁各种成就</li>
                      <li>体验不同的人生选择</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    提示与技巧
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <p className="text-white/80">
                      • 保持健康值，不要让它降到 0
                    </p>
                    <p className="text-white/80">
                      • 合理分配精力，不要过度消耗
                    </p>
                    <p className="text-white/80">
                      • 金钱不是万能的，但没有钱是万万不能的
                    </p>
                    <p className="text-white/80">
                      • 每年的选择都会影响未来，慎重决定！
                    </p>
                    <p className="text-white/80">
                      • 记得使用存档功能，保存你的进度
                    </p>
                  </div>
                </section>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-white/40 text-sm">
                  祝你在 地球Online 中玩得愉快！
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
