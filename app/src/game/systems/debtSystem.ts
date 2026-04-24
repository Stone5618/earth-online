import type { PlayerStats, Debt } from '../core/types';

export function addDebt(
  stats: PlayerStats,
  amount: number,
  interestRate: number = 0.05,
  termMonths: number = 120,
  description: string = '贷款'
): { newStats: PlayerStats; debtId: string } {
  const id = `debt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const monthlyPayment = calculateMonthlyPayment(amount, interestRate, termMonths);
  
  const newDebt: Debt = {
    id,
    amount,
    remaining: amount,
    interestRate,
    monthlyPayment,
    termMonths,
    startAge: stats.age,
    description
  };
  
  const newStats: PlayerStats = {
    ...stats,
    debts: [...stats.debts, newDebt],
    money: stats.money + amount
  };
  
  return { newStats, debtId: id };
}

function calculateMonthlyPayment(principal: number, rate: number, months: number): number {
  if (months <= 0) return principal;
  const monthlyRate = rate / 12;
  const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(payment);
}

export function processDebts(stats: PlayerStats): {
  newStats: PlayerStats;
  totalPaid: number;
  totalInterest: number;
} {
  let totalPaid = 0;
  let totalInterest = 0;
  let newMoney = stats.money;
  const updatedDebts: Debt[] = [];
  
  for (const debt of stats.debts) {
    if (debt.remaining <= 0) continue;
    
    const monthlyInterest = debt.remaining * (debt.interestRate / 12);
    const principalPayment = Math.max(0, debt.monthlyPayment - monthlyInterest);
    const payment = Math.min(debt.monthlyPayment, debt.remaining + monthlyInterest);
    
    if (newMoney >= payment) {
      const newRemaining = Math.max(0, debt.remaining - principalPayment);
      newMoney -= payment;
      totalPaid += payment;
      totalInterest += monthlyInterest;
      
      if (newRemaining > 0) {
        updatedDebts.push({
          ...debt,
          remaining: newRemaining
        });
      }
    } else {
      const interest = debt.remaining * (debt.interestRate / 12);
      updatedDebts.push({
        ...debt,
        remaining: debt.remaining + interest
      });
      totalInterest += interest;
    }
  }
  
  return {
    newStats: {
      ...stats,
      money: newMoney,
      debts: updatedDebts
    },
    totalPaid,
    totalInterest
  };
}

export function payOffDebt(
  stats: PlayerStats,
  debtId: string
): { newStats: PlayerStats; success: boolean; amountPaid: number } {
  const debt = stats.debts.find(d => d.id === debtId);
  if (!debt) return { newStats: stats, success: false, amountPaid: 0 };
  
  if (stats.money < debt.remaining) {
    return { newStats: stats, success: false, amountPaid: 0 };
  }
  
  return {
    newStats: {
      ...stats,
      money: stats.money - debt.remaining,
      debts: stats.debts.filter(d => d.id !== debtId)
    },
    success: true,
    amountPaid: debt.remaining
  };
}

export function getTotalDebt(stats: PlayerStats): number {
  return stats.debts.reduce((sum, debt) => sum + debt.remaining, 0);
}

export function getMonthlyDebtPayment(stats: PlayerStats): number {
  return stats.debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
}

/**
 * 处理金钱变化后的状态，确保金钱为负时自动产生相应的债务
 */
export function handleMoneyChange(
  stats: PlayerStats,
  description: string = '消费'
): PlayerStats {
  let result = { ...stats };
  
  if (result.money < 0) {
    const debtAmount = Math.abs(result.money);
    
    // 根据债务金额计算合理的还款期限
    let termMonths: number;
    if (debtAmount < 10000) {
      termMonths = 24; // 小额债务2年还清
    } else if (debtAmount < 100000) {
      termMonths = 36; // 中等债务3年还清
    } else if (debtAmount < 500000) {
      termMonths = 60; // 较大债务5年还清
    } else if (debtAmount < 1000000) {
      termMonths = 120; // 大额债务10年还清
    } else {
      termMonths = 240; // 巨额债务20年还清
    }
    
    const interestRate = 0.03; // 年利率 3%（更友好）
    const monthlyPayment = calculateMonthlyPayment(debtAmount, interestRate, termMonths);
    
    const newDebt: Debt = {
      id: `debt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: debtAmount,
      remaining: debtAmount,
      interestRate,
      monthlyPayment,
      termMonths,
      startAge: stats.age,
      description,
    };
    
    result.debts = [...result.debts, newDebt];
    // 不再把 money 设回 0，保持负数显示债务金额
  }
  
  return result;
}
