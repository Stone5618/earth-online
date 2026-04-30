// Endings, challenges, talents, flaws — extracted from gameConfig.ts
import type { SkillTree } from '../types/game';
import type { PlayerStats, ChallengeConfig, Ending, Talent, Flaw } from '../game/core/types';
// ========== 天赋配置 ==========
export const TALENTS: Talent[] = [
  { id: 'genius', name: '神童', description: '智力极高但体弱多病', effect: (s) => ({ ...s, intelligence: s.intelligence + 30, health: s.health - 10, maxHealth: s.maxHealth - 10 }) },
  { id: 'social_butterfly', name: '社交蝴蝶', description: '魅力超凡', effect: (s) => ({ ...s, charm: s.charm + 25, mood: s.mood + 15 }) },
  { id: 'iron_body', name: '铁打筋骨', description: '身体异常强健', effect: (s) => ({ ...s, health: s.health + 30, maxHealth: s.maxHealth + 30, energy: s.energy + 20, maxEnergy: s.maxEnergy + 20 }) },
  { id: 'born_rich', name: '天生我财', description: '财运极佳', effect: (s) => ({ ...s, money: s.money + 100000, totalMoneyEarned: s.totalMoneyEarned + 100000, luck: s.luck + 10 }) },
  { id: 'late_bloomer', name: '大器晚成', description: '前期平庸，后期爆发', effect: (s) => ({ ...s, intelligence: s.intelligence - 10, karma: s.karma + 20 }) },
  { id: 'creative_soul', name: '艺术灵魂', description: '创造力惊人', effect: (s) => ({ ...s, creativity: s.creativity + 30, charm: s.charm + 10 }) },
  { id: 'lucky_star', name: '幸运星', description: '运气极好', effect: (s) => ({ ...s, luck: s.luck + 25, karma: s.karma + 10 }) },
];

// ========== 缺陷配置 ==========
export const FLAWS: Flaw[] = [
  { id: 'weak_body', name: '体弱多病', description: '身体虚弱但运气不错', effect: (s) => ({ ...s, health: s.health - 20, maxHealth: s.maxHealth - 20, luck: s.luck + 15 }) },
  { id: 'poor_start', name: '穷困潦倒', description: '出生贫穷，但有骨气', effect: (s) => ({ ...s, money: s.money - 5000, karma: s.karma + 20 }) },
  { id: 'loner', name: '天煞孤星', description: '孤独但聪明', effect: (s) => ({ ...s, charm: s.charm - 20, intelligence: s.intelligence + 15, creativity: s.creativity + 10 }) },
  { id: 'anxious', name: '社恐达人', description: '社交焦虑但智力超群', effect: (s) => ({ ...s, intelligence: s.intelligence + 25, charm: s.charm - 15, mood: s.mood - 10 }) },
  { id: 'clumsy', name: '笨手笨脚', description: '笨拙但善良', effect: (s) => ({ ...s, creativity: s.creativity - 10, karma: s.karma + 15, charm: s.charm + 5 }) },
];

// ========== 结局配置（≥12种） ==========
export const ENDINGS: Ending[] = [
  { id: 'death_health', name: '病入膏肓', priority: 100, condition: (s) => s.health <= 0, description: '你的健康归零，生命消逝了...', icon: '💀' },
  { id: 'death_old', name: '寿终正寝', priority: 99, condition: (s) => s.age >= 120, description: '你度过了漫长而精彩的一生...', icon: '👴' },
  { id: 'rich', name: '家财万贯', priority: 95, condition: (s) => s.money >= 1000000, description: '你成为了一代富豪，享尽荣华富贵！', icon: '💰' },
  { id: 'family_happy', name: '天伦之乐', priority: 90, condition: (s) => s.partner.has && s.children.length >= 2 && s.houseLevel >= 3 && s.mood >= 80, description: '你拥有了完美的家庭，幸福美满！', icon: '👨‍👩‍👧‍👦' },
  { id: 'career_success', name: '行业翘楚', priority: 85, condition: (s) => s.jobLevel === 5 && s.money >= 500000, description: '你在事业上达到了巅峰，成为了行业领袖！', icon: '🏆' },
  { id: 'genius', name: '旷世奇才', priority: 80, condition: (s) => s.intelligence >= 180 && s.creativity >= 120, description: '你的才华无人能及，名垂青史！', icon: '🧠' },
  { id: 'evil', name: '恶贯满盈', priority: 75, condition: (s) => s.karma <= 20, description: '你坏事做尽，最终恶有恶报...', icon: '👿' },
  { id: 'saint', name: '圣人转世', priority: 70, condition: (s) => s.karma >= 130, description: '你善良仁慈，是真正的圣人！', icon: '✨' },
  { id: 'poor_old', name: '穷困潦倒', priority: 65, condition: (s) => s.money <= 0 && s.age >= 60, description: '你在贫穷中度过了一生，令人唏嘘...', icon: '🏚️' },
  { id: 'lonely_old', name: '孤老一生', priority: 60, condition: (s) => s.age >= 80 && !s.partner.has && s.children.length === 0, description: '你孤独地度过了一生，无依无靠...', icon: '🏠' },
  { id: 'wanderer', name: '浪迹天涯', priority: 55, condition: (s) => s.houseLevel === 0 && s.carLevel >= 1 && !s.partner.has && s.mood >= 80 && s.health >= 80, description: '你自由自在地浪迹天涯，无拘无束！', icon: '🌍' },
  { id: 'artist_master', name: '艺术大师', priority: 50, condition: (s) => s.creativity >= 150, description: '你成为了一代艺术大师，作品流传千古！', icon: '🎨' },
  { id: 'powerful_couple', name: '神仙眷侣', priority: 88, condition: (s) => s.partner.has && s.partner.relationshipQuality === 100 && s.houseLevel >= 4, description: '你和伴侣是令人羡慕的神仙眷侣！', icon: '💕' },
  { id: 'big_family', name: '儿孙满堂', priority: 82, condition: (s) => s.children.length >= 3 && s.age >= 70, description: '你儿孙满堂，享尽天伦之乐！', icon: '👨‍👩‍👧‍👦👶' },
  { id: 'early_retirement', name: '提前退休', priority: 78, condition: (s) => s.retired && s.age <= 55 && s.money >= 300000, description: '你早早实现了财务自由，享受生活！', icon: '🏖️' },
  { id: 'all_needs_max', name: '人生赢家', priority: 97, condition: (s) => s.houseLevel === 4 && s.carLevel === 3 && s.jobLevel === 5 && s.partner.has && s.money >= 1000000, description: '你达成了所有人生目标，是真正的人生赢家！', icon: '👑' },
];

// ========== 挑战模式配置 ==========
// ChallengeConfig 类型已在 gameState.ts 中定义

export const CHALLENGES: ChallengeConfig[] = [
  {
    id: 'poor',
    name: '赤贫挑战',
    description: '初始金钱=0，所有收入+30%，目标攒够100万',
    icon: '💸',
    initialStats: { money: 0, totalMoneyEarned: 0 },
    rules: { incomeMultiplier: 1.3 },
    victoryCondition: (s) => s.money >= 1000000,
  },
  {
    id: 'short_life',
    name: '短命挑战',
    description: '寿命上限50岁，目标50岁前拥有3项重大需求满级',
    icon: '⏱️',
    initialStats: {},
    rules: { maxAge: 50 },
    victoryCondition: (s) => 
      (s.houseLevel >= 4 ? 1 : 0) +
      (s.carLevel >= 3 ? 1 : 0) +
      (s.jobLevel >= 5 ? 1 : 0) >= 3,
  },
  {
    id: 'loner',
    name: '天煞孤星',
    description: '无法结婚/恋爱，目标达成职业满级并攒够500万',
    icon: '🏔️',
    initialStats: {},
    rules: { disableRomance: true, incomeMultiplier: 1.5 },
    victoryCondition: (s) => s.jobLevel >= 5 && s.money >= 5000000,
  },
  {
    id: 'academic',
    name: '学术霸主',
    description: '智力初始80，目标智力达到200',
    icon: '📚',
    initialStats: { intelligence: 80 },
    rules: {},
    victoryCondition: (s) => s.intelligence >= 200,
  },
  {
    id: 'quick_rich',
    name: '暴富挑战',
    description: '30岁前赚到1000万',
    icon: '💰',
    initialStats: {},
    rules: { maxAge: 30, incomeMultiplier: 2.0 },
    victoryCondition: (s) => s.money >= 10000000,
  },
];

