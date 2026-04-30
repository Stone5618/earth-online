
import { useState } from 'react';
import { useGame } from '@/game/GameContext';
import { Home, Car, Briefcase, Heart, Users, Star, CheckCircle2, DollarSign } from 'lucide-react';
import { HOUSE_UPGRADES, CAR_UPGRADES, JOB_UPGRADES } from '@/config/gameConfig';
import { getTotalDebt } from '@/game/systems/debtSystem';

type NeedsPanelMode = 'floating' | 'inline';

export function NeedsPanel({ mode = 'floating' }: { mode?: NeedsPanelMode }) {
  const { state, dispatch } = useGame();
  const { stats } = state;
  const [isOpen, setIsOpen] = useState(false);

  const house = HOUSE_UPGRADES[stats.houseLevel];
  const nextHouse = HOUSE_UPGRADES[stats.houseLevel + 1];
  
  const car = CAR_UPGRADES[stats.carLevel];
  const nextCar = CAR_UPGRADES[stats.carLevel + 1];
  
  const job = JOB_UPGRADES[stats.jobLevel];
  const nextJob = JOB_UPGRADES[stats.jobLevel + 1];

  const canUpgradeHouse = nextHouse && 
    (!nextHouse.requirements || (
      (!nextHouse.requirements.jobLevel || stats.jobLevel >= nextHouse.requirements.jobLevel) &&
      (!nextHouse.requirements.charm || stats.charm >= nextHouse.requirements.charm) &&
      (!nextHouse.requirements.intelligence || stats.intelligence >= nextHouse.requirements.intelligence)
    ));

  const canUpgradeCar = nextCar;
  
  const canUpgradeJob = nextJob && 
    stats.age >= 18;

  const content = (
    <>
      <div className="p-4 border-b border-border-glow bg-deep-space-light">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-gold" />
          人生重大需求
        </h3>
      </div>

      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto bg-deep-space-light">
            {/* House */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#3B82F6]/20 rounded-lg">
                  <Home className="w-5 h-5 text-[#60A5FA]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{house.name}</h4>
                  <p className="text-xs text-white/50">舒适度 +{house.comfort}</p>
                </div>
              </div>
              {nextHouse && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70">升级到: {nextHouse.name}</span>
                    <span className="text-sm font-mono text-[#FFD700]">¥{nextHouse.cost.toLocaleString()}</span>
                  </div>
                  {nextHouse.requirements && (
                    <div className="mb-2 text-xs text-white/50 space-y-1">
                      {nextHouse.requirements.jobLevel && <div>• 工作等级 ≥ {nextHouse.requirements.jobLevel}</div>}
                      {nextHouse.requirements.charm && <div>• 魅力 ≥ {nextHouse.requirements.charm}</div>}
                      {nextHouse.requirements.intelligence && <div>• 智力 ≥ {nextHouse.requirements.intelligence}</div>}
                    </div>
                  )}
                  <button
                    disabled={!canUpgradeHouse}
                    onClick={() => {
                      if (canUpgradeHouse) {
                        dispatch({ type: 'UPGRADE_HOUSE' });
                        dispatch({
                          type: 'ADD_LOG',
                          payload: {
                            year: stats.age,
                            event: `你搬进了${nextHouse.name}`,
                            type: 'positive',
                            statChanges: { money: -nextHouse.cost },
                            action: '买房/升级',
                          }
                        });
                      }
                    }}
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${
                      canUpgradeHouse
                        ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {canUpgradeHouse ? '升级（可贷款）' : '条件不足'}
                  </button>
                </div>
              )}
            </div>

            {/* Car */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#A855F7]/20 rounded-lg">
                  <Car className="w-5 h-5 text-[#C084FC]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{car.name}</h4>
                  <p className="text-xs text-white/50">声望 +{car.prestige}</p>
                </div>
              </div>
              {nextCar && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70">升级到: {nextCar.name}</span>
                    <span className="text-sm font-mono text-[#FFD700]">¥{nextCar.cost.toLocaleString()}</span>
                  </div>
                  <button
                    disabled={!canUpgradeCar}
                    onClick={() => {
                      if (canUpgradeCar) {
                        dispatch({ type: 'UPGRADE_CAR' });
                        dispatch({
                          type: 'ADD_LOG',
                          payload: {
                            year: stats.age,
                            event: `你买了一辆${nextCar.name}`,
                            type: 'positive',
                            statChanges: { money: -nextCar.cost },
                            action: '买车/升级',
                          }
                        });
                      }
                    }}
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${
                      canUpgradeCar
                        ? 'bg-[#A855F7] hover:bg-[#9333EA] text-white'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {canUpgradeCar ? '升级（可贷款）' : '条件不足'}
                  </button>
                </div>
              )}
            </div>

            {/* Job */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#10B981]/20 rounded-lg">
                  <Briefcase className="w-5 h-5 text-[#34D399]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{job.title}</h4>
                  <p className="text-xs text-white/50">年收入 ¥{job.income.toLocaleString()}</p>
                </div>
              </div>
              {nextJob && stats.age >= 18 && !stats.retired && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70">升职到: {nextJob.title}</span>
                    <span className="text-sm font-mono text-[#34D399]">年收入 ¥{nextJob.income.toLocaleString()}</span>
                  </div>
                  <button
                    disabled={!canUpgradeJob}
                    onClick={() => {
                      if (canUpgradeJob) {
                        dispatch({ type: 'UPGRADE_JOB' });
                        dispatch({
                          type: 'ADD_LOG',
                          payload: {
                            year: stats.age,
                            event: `你升职为${nextJob.title}`,
                            type: 'positive',
                            statChanges: { money: -5000 * (stats.jobLevel + 1) },
                            action: '升职',
                          }
                        });
                      }
                    }}
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${
                      canUpgradeJob
                        ? 'bg-[#10B981] hover:bg-[#059669] text-white'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {canUpgradeJob ? '努力升职（可贷款）' : '条件不足'}
                  </button>
                </div>
              )}
            </div>

            {/* Partner */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#F43F5E]/20 rounded-lg">
                  <Heart className="w-5 h-5 text-[#FB7185]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">
                    {stats.partner.has ? '有伴侣' : '单身'}
                  </h4>
                  {stats.partner.has && (
                    <p className="text-xs text-white/50">
                      关系质量: {stats.partner.relationshipQuality}/100
                    </p>
                  )}
                </div>
                {stats.partner.has && <CheckCircle2 className="w-5 h-5 text-[#34D399]" />}
              </div>
            </div>

            {/* Children */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#F59E0B]/20 rounded-lg">
                  <Users className="w-5 h-5 text-[#FBBF24]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">孩子数量</h4>
                  <p className="text-xs text-white/50">
                    {stats.children.length} 个孩子
                  </p>
                </div>
                {stats.children.length > 0 && <CheckCircle2 className="w-5 h-5 text-[#34D399]" />}
              </div>
              {stats.children.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/70 space-y-1">
                  {stats.children.map((child, idx) => (
                    <div key={idx}>
                      {child.name}, {child.age}岁
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Debts */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#EF4444]/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-[#F87171]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">债务情况</h4>
                  <p className="text-xs text-white/50">
                    总债务: ¥{getTotalDebt(stats).toLocaleString()}
                  </p>
                </div>
                {stats.debts.length > 0 && <CheckCircle2 className="w-5 h-5 text-[#F87171]" />}
              </div>
              {stats.debts.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10 space-y-2">
                  {stats.debts.map((debt) => (
                    <div key={debt.id} className="text-xs">
                      <div className="flex items-center justify-between text-white/70">
                        <span>{debt.description}</span>
                        <span className="text-[#F87171] font-mono">
                          ¥{debt.remaining.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-white/40 mt-1 flex justify-between">
                        <span>原金额: ¥{debt.amount.toLocaleString()}</span>
                        <span>利率: {(debt.interestRate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="text-white/40">
                        月供: ¥{debt.monthlyPayment.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {stats.debts.length === 0 && (
                <p className="text-xs text-white/40 text-center py-2">没有债务</p>
              )}
            </div>
      </div>
    </>
  );

  if (mode === 'inline') {
    return (
      <div className="bg-deep-space-light border border-border-glow rounded-xl shadow-2xl overflow-hidden">
        {content}
      </div>
    );
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 bg-deep-space-light/80 backdrop-blur-sm border border-border-glow rounded-l-xl px-3 py-6 flex flex-col items-center gap-2 hover:bg-deep-space-light transition-all shadow-lg"
      >
        <div className="flex -space-x-1">
          <Home className="w-5 h-5 text-holo-blue" />
          <Briefcase className="w-5 h-5 text-emerald-400" />
          <Heart className="w-5 h-5 text-rose-400" />
        </div>
        <span className="text-xs text-white/50">需求</span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed right-20 top-1/2 -translate-y-1/2 z-40 w-80 max-w-[calc(100vw-6rem)] max-h-[calc(100vh-2rem)] bg-deep-space-light border border-border-glow rounded-xl shadow-2xl overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
