
// 从 core 模块重新导出所有内容
export * from './core/gameEngine';
export * from './core/gameInitializer';
export * from './core/gameSaver';
export * from './core/types';

// 从 systems 模块重新导出
export { getTotalDebt, getMonthlyDebtPayment } from './systems/debtSystem';
export { formatMoney } from './systems/economySystem';
