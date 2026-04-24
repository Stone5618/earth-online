
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
      <div className="p-4 border-b border-slate-700 bg-slate-900/60">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          人生重大需求
        </h3>
      </div>

      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* House */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-900/30 rounded-lg">
                  <Home className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{house.name}</h4>
                  <p className="text-xs text-slate-400">舒适度 +{house.comfort}</p>
                </div>
              </div>
              {nextHouse && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">升级到: {nextHouse.name}</span>
                    <span className="text-sm font-mono text-yellow-400">¥{nextHouse.cost.toLocaleString()}</span>
                  </div>
                  {nextHouse.requirements && (
                    <div className="mb-2 text-xs text-slate-400 space-y-1">
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
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canUpgradeHouse ? '升级（可贷款）' : '条件不足'}
                  </button>
                </div>
              )}
            </div>

            {/* Car */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-900/30 rounded-lg">
                  <Car className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{car.name}</h4>
                  <p className="text-xs text-slate-400">声望 +{car.prestige}</p>
                </div>
              </div>
              {nextCar && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">升级到: {nextCar.name}</span>
                    <span className="text-sm font-mono text-yellow-400">¥{nextCar.cost.toLocaleString()}</span>
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
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canUpgradeCar ? '升级（可贷款）' : '条件不足'}
                  </button>
                </div>
              )}
            </div>

            {/* Job */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-900/30 rounded-lg">
                  <Briefcase className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{job.title}</h4>
                  <p className="text-xs text-slate-400">年收入 ¥{job.income.toLocaleString()}</p>
                </div>
              </div>
              {nextJob && stats.age >= 18 && !stats.retired && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">升职到: {nextJob.title}</span>
                    <span className="text-sm font-mono text-green-400">年收入 ¥{nextJob.income.toLocaleString()}</span>
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
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canUpgradeJob ? '努力升职（可贷款）' : '条件不足'}
                  </button>
                </div>
              )}
            </div>

            {/* Partner */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rose-900/30 rounded-lg">
                  <Heart className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">
                    {stats.partner.has ? '有伴侣' : '单身'}
                  </h4>
                  {stats.partner.has && (
                    <p className="text-xs text-slate-400">
                      关系质量: {stats.partner.relationshipQuality}/100
                    </p>
                  )}
                </div>
                {stats.partner.has && <CheckCircle2 className="w-5 h-5 text-green-400" />}
              </div>
            </div>

            {/* Children */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">孩子数量</h4>
                  <p className="text-xs text-slate-400">
                    {stats.children.length} 个孩子
                  </p>
                </div>
                {stats.children.length > 0 && <CheckCircle2 className="w-5 h-5 text-green-400" />}
              </div>
              {stats.children.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-300 space-y-1">
                  {stats.children.map((child, idx) => (
                    <div key={idx}>
                      {child.name}, {child.age}岁
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Debts */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">债务情况</h4>
                  <p className="text-xs text-slate-400">
                    总债务: ¥{getTotalDebt(stats).toLocaleString()}
                  </p>
                </div>
                {stats.debts.length > 0 && <CheckCircle2 className="w-5 h-5 text-red-400" />}
              </div>
              {stats.debts.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700 space-y-2">
                  {stats.debts.map((debt) => (
                    <div key={debt.id} className="text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>{debt.description}</span>
                        <span className="text-red-400 font-mono">
                          ¥{debt.remaining.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-slate-500 mt-1 flex justify-between">
                        <span>原金额: ¥{debt.amount.toLocaleString()}</span>
                        <span>利率: {(debt.interestRate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="text-slate-500">
                        月供: ¥{debt.monthlyPayment.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {stats.debts.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-2">没有债务</p>
              )}
            </div>
      </div>
    </>
  );

  if (mode === 'inline') {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        {content}
      </div>
    );
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-l-xl px-3 py-6 flex flex-col items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
      >
        <div className="flex -space-x-1">
          <Home className="w-5 h-5 text-holo-blue" />
          <Briefcase className="w-5 h-5 text-green-400" />
          <Heart className="w-5 h-5 text-rose-400" />
        </div>
        <span className="text-xs text-slate-400">需求</span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed right-20 top-1/2 -translate-y-1/2 z-40 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {content}
        </div>
      )}
    </>
  );
}
