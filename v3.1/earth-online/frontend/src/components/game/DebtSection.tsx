import React from 'react';
import { CreditCard, DollarSign, Clock } from 'lucide-react';
import type { PlayerStats } from '@/game/gameState';
import { formatMoney, getTotalDebt, getMonthlyDebtPayment } from '@/game/gameState';

interface DebtSectionProps {
  stats: PlayerStats;
}

export const DebtSection = React.memo(function DebtSection({ stats }: DebtSectionProps) {
  if (stats.debts.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2 mb-3">
        <CreditCard className="w-4 h-4 text-red-400" />
        债务账单
      </h4>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/70">
          <span>总债务</span>
          <span className="text-red-400">¥{formatMoney(getTotalDebt(stats))}</span>
        </div>
        <div className="flex justify-between text-xs text-white/70">
          <span>月供</span>
          <span className="text-orange-400">¥{formatMoney(getMonthlyDebtPayment(stats))}</span>
        </div>

        <div className="mt-3 space-y-2">
          {stats.debts.map((debt) => (
            <div key={debt.id} className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3 h-3 text-red-400" />
                  <span className="text-sm font-medium text-white">{debt.description}</span>
                </div>
                <span className="text-xs text-white/60">
                  <Clock className="w-3 h-3 inline mr-1" />
                  开始于 {debt.startAge}岁
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-white/60">剩余</span>
                  <div className="text-red-400 font-medium">¥{formatMoney(debt.remaining)}</div>
                </div>
                <div>
                  <span className="text-white/60">月供</span>
                  <div className="text-orange-400 font-medium">¥{formatMoney(debt.monthlyPayment)}</div>
                </div>
                <div>
                  <span className="text-white/60">利率</span>
                  <div className="text-yellow-400">{(debt.interestRate * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <span className="text-white/60">期限</span>
                  <div className="text-white/80">{debt.termMonths}个月</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
