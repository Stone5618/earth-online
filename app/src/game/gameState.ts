export type GamePhase = 'LANDING' | 'SPAWNING' | 'PLAYING' | 'GAMEOVER';

export type FamilyTier = 'SSR' | 'SR' | 'R' | 'IRON';

export interface PlayerStats {
  age: number;
  health: number;
  maxHealth: number;
  money: number;
  energy: number;
  maxEnergy: number;
  mood: number;
  intelligence: number;
  charm: number;
  creativity: number;
  luck: number;
  karma: number;
  totalMoneyEarned: number; // 累计获得的金钱
  isMarried: boolean; // 婚姻状态
}

export interface GameLog {
  year: number;
  event: string;
  type: 'normal' | 'positive' | 'negative' | 'milestone' | 'death';
  statChanges?: Partial<PlayerStats>;
  action?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface GameState {
  phase: GamePhase;
  stats: PlayerStats;
  familyTier: FamilyTier | null;
  birthServer: string | null;
  birthTalent: string | null;
  logs: GameLog[];
  currentYear: number;
  achievements: Achievement[];
  newlyUnlockedAchievements: Achievement[];
  deathReason: string | null;
  finalTitle: string | null;
  finalComment: string | null;
  consecutiveHappyYears: number;
  difficulty: 'easy' | 'normal' | 'hard';
  lastTriggeredEvents: Record<string, number>;
}

export type GameAction =
  | { type: 'START_SPAWNING'; payload: { familyTier: FamilyTier; initialStats: PlayerStats; birthServer: string; birthTalent: string } }
  | { type: 'COMPLETE_SPAWNING' }
  | { type: 'TICK_YEAR'; payload: { action: string; statChanges: Partial<PlayerStats>; event: string; eventType: GameLog['type'] } }
  | { type: 'REST_AND_RECOVER'; payload: { statChanges: Partial<PlayerStats> } }
  | { type: 'GAME_OVER'; payload: { reason: string; title: string; comment: string } }
  | { type: 'RESET_GAME' }
  | { type: 'GO_TO_LANDING' }
  | { type: 'UPDATE_STATS'; payload: Partial<PlayerStats> }
  | { type: 'ADD_LOG'; payload: GameLog }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'CLEAR_ACHIEVEMENT_NOTIFICATIONS'; payload?: Achievement[] }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'SET_DIFFICULTY'; payload: 'easy' | 'normal' | 'hard' }
  | { type: 'TRIGGER_EVENT'; payload: { eventId: string; year: number } };

const achievementLibrary = [
  { id: 'first_birthday', name: '生日快乐', description: '庆祝你的第一个生日', icon: '🎂' },
  { id: 'adult', name: '长大成人', description: '度过18岁生日', icon: '🎉' },
  { id: 'middle_aged', name: '人到中年', description: '度过35岁生日', icon: '🍵' },
  { id: 'senior', name: '老年生活', description: '度过60岁生日', icon: '👴' },
  { id: 'centenarian', name: '百岁老人', description: '活到100岁', icon: '🎊' },
  { id: 'rich', name: '富甲一方', description: '累计获得100万元', icon: '💰' },
  { id: 'genius', name: '天才少年', description: '智力达到120', icon: '🧠' },
  { id: 'charmer', name: '万人迷', description: '魅力达到90', icon: '💖' },
  { id: 'creative', name: '创意无限', description: '创造力达到120', icon: '🎨' },
  { id: 'lucky', name: '幸运儿', description: '运气达到90', icon: '🍀' },
  { id: 'happy', name: '乐观派', description: '心情连续保持90+', icon: '😊' },
  { id: 'survivor', name: '幸存者', description: '健康低于10但还活着', icon: '🏥' },
  { id: 'hardworker', name: '工作狂', description: '精力低于10还在坚持', icon: '⚡' },
];

function getInitialAchievements(): Achievement[] {
  return achievementLibrary.map((a) => ({ ...a, unlocked: false }));
}

export const initialState: GameState = {
  phase: 'LANDING',
  stats: {
    age: 0,
    health: 100,
    maxHealth: 100,
    money: 0,
    energy: 100,
    maxEnergy: 100,
    mood: 50,
    intelligence: 50,
    charm: 50,
    creativity: 50,
    luck: 50,
    karma: 50,
    totalMoneyEarned: 0,
    isMarried: false,
  },
  familyTier: null,
  birthServer: null,
  birthTalent: null,
  logs: [],
  currentYear: 0,
  achievements: getInitialAchievements(),
  newlyUnlockedAchievements: [],
  deathReason: null,
  finalTitle: null,
  finalComment: null,
  consecutiveHappyYears: 0,
  difficulty: 'normal',
  lastTriggeredEvents: {},
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateFamilyTier(): FamilyTier {
  const roll = Math.random() * 100;
  if (roll < 0.1) return 'SSR';
  if (roll < 5.1) return 'SR';
  if (roll < 65.1) return 'R';
  return 'IRON';
}

export function generateInitialStats(tier: FamilyTier): PlayerStats {
  const baseStats: PlayerStats = {
    age: 0,
    health: 100,
    maxHealth: 100,
    money: 0,
    energy: 100,
    maxEnergy: 100,
    mood: 50,
    intelligence: randomInt(40, 70),
    charm: randomInt(40, 70),
    creativity: randomInt(40, 70),
    luck: randomInt(40, 60),
    karma: randomInt(30, 70),
    totalMoneyEarned: 0,
    isMarried: false,
  };

  switch (tier) {
    case 'SSR':
      return {
        ...baseStats,
        money: 1000000,
        health: 100,
        maxHealth: 120,
        intelligence: randomInt(80, 100),
        charm: randomInt(80, 100),
        creativity: randomInt(75, 95),
        luck: randomInt(70, 90),
        mood: 80,
        karma: randomInt(70, 100),
        totalMoneyEarned: 1000000,
      };
    case 'SR':
      return {
        ...baseStats,
        money: 100000,
        intelligence: randomInt(65, 85),
        charm: randomInt(65, 85),
        creativity: randomInt(60, 80),
        luck: randomInt(55, 75),
        mood: 70,
        karma: randomInt(55, 80),
        totalMoneyEarned: 100000,
      };
    case 'R':
      return {
        ...baseStats,
        money: 10000,
        intelligence: randomInt(50, 70),
        charm: randomInt(50, 70),
        creativity: randomInt(50, 70),
        luck: randomInt(45, 65),
        totalMoneyEarned: 10000,
      };
    default:
      return baseStats;
  }
}

export function getRandomTitle(age: number, stats: PlayerStats): string {
  if (stats.health <= 0) return '早夭者';
  if (stats.money > 10000000) return '亿万富豪';
  if (stats.intelligence > 140) return '天才';
  if (stats.charm > 95) return '万人迷';
  if (stats.creativity > 140) return '艺术大师';
  if (stats.karma > 95) return '圣人';
  if (age >= 100) return '人瑞';
  if (age >= 80) return '长寿老人';
  if (stats.money < 0) return '穷光蛋';
  return '普通人';
}

export function getRandomComment(title: string): string {
  const comments: Record<string, string[]> = {
    '亿万富豪': ['有钱能使鬼推磨', '你的人生是爽文剧本'],
    '天才': ['上帝赏饭吃', '智商碾压众生'],
    '万人迷': ['颜值即正义', '走到哪都是焦点'],
    '圣人': ['人间天使', '你是好人'],
    '人瑞': ['这体质，绝了', '可以申请吉尼斯了'],
    '早夭者': ['天妒英才', '人生有时就是这么残酷'],
    '穷光蛋': ['运气守恒，下辈子好运', '至少你收获了贫穷'],
    '普通人': ['平凡是福', '也是大多数人的人生'],
  };
  const list = comments[title] || ['这就是人生啊。'];
  return list[Math.floor(Math.random() * list.length)];
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_SPAWNING':
      return {
        ...state,
        phase: 'SPAWNING',
        familyTier: action.payload.familyTier,
        birthServer: action.payload.birthServer,
        birthTalent: action.payload.birthTalent,
        stats: action.payload.initialStats,
      };

    case 'COMPLETE_SPAWNING':
      return {
        ...state,
        phase: 'PLAYING',
      };

    case 'TICK_YEAR': {
      const newAge = state.stats.age + 1;
      
      // Base difficulty multipliers
      const difficultyMultipliers = {
        easy: { positive: 1.3, negative: 0.7 },
        normal: { positive: 1, negative: 1 },
        hard: { positive: 0.8, negative: 1.3 },
      };
      let diff = { ...difficultyMultipliers[state.difficulty] };
      
      // Dynamic difficulty adjustment
      // 1. 如果健康值过低，稍微降低负面效果
      if (state.stats.health < 30) {
        diff.negative = Math.min(diff.negative * 0.8, 1);
      }
      
      // 2. 如果金钱过多，稍微降低正面效果
      if (state.stats.money > 100000) {
        diff.positive = Math.max(diff.positive * 0.85, 0.7);
      }
      
      // 3. 如果心情持续低落，稍微提高正面效果
      if (state.stats.mood < 30) {
        diff.positive = Math.min(diff.positive * 1.2, 1.5);
      }
      
      const applyDiff = (value: number, isPositive: boolean) => {
        return Math.round(value * (isPositive ? diff.positive : diff.negative));
      };
      
      const healthChange = action.payload.statChanges.health || 0;
      const energyChange = action.payload.statChanges.energy || 0;
      const moneyChange = action.payload.statChanges.money || 0;
      const moodChange = action.payload.statChanges.mood || 0;
      const intelligenceChange = action.payload.statChanges.intelligence || 0;
      const charmChange = action.payload.statChanges.charm || 0;
      const creativityChange = action.payload.statChanges.creativity || 0;
      const luckChange = action.payload.statChanges.luck || 0;
      const karmaChange = action.payload.statChanges.karma || 0;
      const isMarriedChange = action.payload.statChanges.isMarried;
      
      const newHealth = Math.max(
        0,
        Math.min(
          state.stats.maxHealth,
          state.stats.health +
            applyDiff(healthChange, healthChange > 0) +
            (state.stats.energy <= 0 ? -10 : 0) +
            (newAge >= 35 ? -2 : 0)
        )
      );
      const newEnergy = Math.max(
        0,
        Math.min(
          state.stats.maxEnergy,
          state.stats.energy + applyDiff(energyChange, energyChange > 0) + 20
        )
      );
      const newMoney = Math.max(0, state.stats.money + applyDiff(moneyChange, moneyChange > 0));
      const newTotalMoneyEarned = state.stats.totalMoneyEarned + Math.max(0, applyDiff(moneyChange, moneyChange > 0));
      const newMood = Math.max(0, Math.min(100, state.stats.mood + applyDiff(moodChange, moodChange > 0)));
      const newIntelligence = Math.max(0, Math.min(150, state.stats.intelligence + applyDiff(intelligenceChange, intelligenceChange > 0)));
      const newCharm = Math.max(0, Math.min(100, state.stats.charm + applyDiff(charmChange, charmChange > 0)));
      const newCreativity = Math.max(0, Math.min(150, state.stats.creativity + applyDiff(creativityChange, creativityChange > 0)));
      const newLuck = Math.max(0, Math.min(100, state.stats.luck + applyDiff(luckChange, luckChange > 0)));
      const newKarma = Math.max(0, Math.min(100, state.stats.karma + applyDiff(karmaChange, karmaChange > 0)));

      // Update consecutive happy years
      const newConsecutiveHappyYears = newMood >= 90 ? state.consecutiveHappyYears + 1 : 0;

      let updatedAchievements = [...state.achievements];
      const newlyUnlocked: Achievement[] = [];
      const checkAchievement = (id: string) => {
        const achievement = updatedAchievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
          updatedAchievements = updatedAchievements.map(a => 
            a.id === id ? { ...a, unlocked: true } : a
          );
          newlyUnlocked.push({ ...achievement, unlocked: true });
        }
      };
      
      if (newAge === 1) checkAchievement('first_birthday');
      if (newAge === 18) checkAchievement('adult');
      if (newAge === 35) checkAchievement('middle_aged');
      if (newAge === 60) checkAchievement('senior');
      if (newAge === 100) checkAchievement('centenarian');
      if (newTotalMoneyEarned >= 1000000) checkAchievement('rich');
      if (newIntelligence >= 120) checkAchievement('genius');
      if (newCharm >= 90) checkAchievement('charmer');
      if (newCreativity >= 120) checkAchievement('creative');
      if (newLuck >= 90) checkAchievement('lucky');
      if (newConsecutiveHappyYears >= 5) checkAchievement('happy');
      if (newHealth > 0 && newHealth < 10) checkAchievement('survivor');
      if (newEnergy < 10) checkAchievement('hardworker');

      if (newHealth <= 0 || newAge >= 100) {
        const title = getRandomTitle(newAge, { ...state.stats, health: newHealth, age: newAge });
        return {
          ...state,
          phase: 'GAMEOVER',
          stats: {
            ...state.stats,
            age: newAge,
            health: Math.max(0, newHealth),
            energy: newEnergy,
            money: newMoney,
            mood: newMood,
            intelligence: newIntelligence,
            charm: newCharm,
            creativity: newCreativity,
            luck: newLuck,
            karma: newKarma,
            totalMoneyEarned: newTotalMoneyEarned,
            isMarried: isMarriedChange !== undefined ? isMarriedChange : state.stats.isMarried,
          },
          currentYear: state.currentYear + 1,
          logs: [
            {
              year: newAge,
              event: action.payload.event,
              type: action.payload.eventType,
              statChanges: action.payload.statChanges,
              action: action.payload.action,
            },
            ...state.logs.slice(0, 79),
          ],
          achievements: updatedAchievements,
          newlyUnlockedAchievements: newlyUnlocked,
          deathReason: newHealth <= 0 ? '健康值归零' : '寿终正寝',
          finalTitle: title,
          finalComment: getRandomComment(title),
          consecutiveHappyYears: newConsecutiveHappyYears,
        };
      }

      return {
        ...state,
        stats: {
          ...state.stats,
          age: newAge,
          health: Math.max(0, newHealth),
          energy: newEnergy,
          money: newMoney,
          mood: newMood,
          intelligence: newIntelligence,
          charm: newCharm,
          creativity: newCreativity,
          luck: newLuck,
          karma: newKarma,
          totalMoneyEarned: newTotalMoneyEarned,
          isMarried: isMarriedChange !== undefined ? isMarriedChange : state.stats.isMarried,
        },
        currentYear: state.currentYear + 1,
        logs: [
          {
            year: newAge,
            event: action.payload.event,
            type: action.payload.eventType,
            statChanges: action.payload.statChanges,
            action: action.payload.action,
          },
          ...state.logs.slice(0, 79),
        ],
        achievements: updatedAchievements,
        newlyUnlockedAchievements: newlyUnlocked,
        consecutiveHappyYears: newConsecutiveHappyYears,
      };
    }

    case 'REST_AND_RECOVER': {
      const { statChanges } = action.payload;
      return {
        ...state,
        stats: {
          ...state.stats,
          health: Math.max(0, Math.min(state.stats.maxHealth, state.stats.health + (statChanges.health || 0))),
          energy: Math.max(0, Math.min(state.stats.maxEnergy, state.stats.energy + (statChanges.energy || 0))),
          mood: Math.max(0, Math.min(100, state.stats.mood + (statChanges.mood || 0))),
          money: Math.max(0, state.stats.money + (statChanges.money || 0)),
        },
      };
    }
    case 'GAME_OVER':
      return {
        ...state,
        phase: 'GAMEOVER',
        deathReason: action.payload.reason,
        finalTitle: action.payload.title,
        finalComment: action.payload.comment,
      };

    case 'RESET_GAME':
      return {
        ...initialState,
        phase: 'LANDING',
      };

    case 'GO_TO_LANDING':
      return {
        ...state,
        phase: 'LANDING',
      };

    case 'UPDATE_STATS':
      return {
        ...state,
        stats: {
          ...state.stats,
          ...action.payload,
        },
      };

    case 'ADD_LOG':
      return {
        ...state,
        logs: [action.payload, ...state.logs.slice(0, 79)],
      };

    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map((a) =>
          a.id === action.payload ? { ...a, unlocked: true } : a
        ),
      };

    case 'LOAD_GAME':
      return { 
        ...action.payload, 
        newlyUnlockedAchievements: [] 
      };

    case 'CLEAR_ACHIEVEMENT_NOTIFICATIONS':
      return {
        ...state,
        newlyUnlockedAchievements: action.payload || [],
      };

    case 'SET_DIFFICULTY':
      return {
        ...state,
        difficulty: action.payload,
      };

    case 'TRIGGER_EVENT':
      return {
        ...state,
        lastTriggeredEvents: {
          ...state.lastTriggeredEvents,
          [action.payload.eventId]: action.payload.year,
        },
      };

    default:
      return state;
  }
}

export interface GameEvent {
  id: string;
  minAge: number;
  maxAge: number;
  condition?: (stats: PlayerStats, familyTier?: FamilyTier | null) => boolean;
  cooldownYears?: number;
  text: string;
  eventType?: GameLog['type'];
  choices: {
    text: string;
    statChanges: Partial<PlayerStats>;
    followUp?: string;
    eventType?: GameLog['type'];
  }[];
}

export const eventLibrary: GameEvent[] = [
  {
    id: 'infant_1',
    minAge: 0,
    maxAge: 0,
    text: '【出生】你刚来到这个世界，响亮地啼哭！',
    eventType: 'milestone',
    choices: [
      { text: '大声哭闹', statChanges: { mood: -5, health: 2 }, followUp: '你用哭声宣告了自己的存在。' },
      { text: '安静观察', statChanges: { intelligence: 2, mood: 5 }, followUp: '你好奇地观察着这个新世界。' },
    ],
  },
  {
    id: 'infant_2',
    minAge: 1,
    maxAge: 1,
    text: '你一岁了，开始牙牙学语。',
    eventType: 'milestone',
    choices: [
      { text: '先叫"妈妈"', statChanges: { charm: 3, karma: 5 }, followUp: '妈妈很开心，全家都乐了。' },
      { text: '先叫"爸爸"', statChanges: { intelligence: 2, mood: 5 }, followUp: '爸爸激动地抱起了你。' },
    ],
  },
  {
    id: 'infant_3',
    minAge: 2,
    maxAge: 2,
    text: '你学会走路了，但经常摔倒。',
    choices: [
      { text: '爬起来继续', statChanges: { health: 3, karma: 5 }, followUp: '你越挫越勇，很快就走稳了。' },
      { text: '求抱抱', statChanges: { charm: 5, mood: 8 }, followUp: '你学会了撒娇。' },
    ],
  },
  {
    id: 'infant_4',
    minAge: 3,
    maxAge: 3,
    text: '你总是问"为什么"，让大人有些头疼。',
    choices: [
      { text: '继续发问', statChanges: { intelligence: 5, creativity: 3 }, followUp: '你的好奇心得到了满足！' },
      { text: '自己看书', statChanges: { intelligence: 4, creativity: 2 }, followUp: '你在书中寻找答案。' },
    ],
  },
  {
    id: 'infant_5',
    minAge: 4,
    maxAge: 4,
    text: '你开始喜欢画画，到处乱涂。',
    choices: [
      { text: '在墙上创作', statChanges: { creativity: 3, intelligence: 2, karma: -3 }, followUp: '家里被你画得乱七八糟，但你很开心。' },
      { text: '在纸上画画', statChanges: { intelligence: 4, creativity: 2, karma: 3 }, followUp: '你是个乖孩子，画画天赋不错。' },
    ],
  },
  {
    id: 'infant_6',
    minAge: 5,
    maxAge: 5,
    text: '你要上幼儿园了！',
    eventType: 'milestone',
    choices: [
      { text: '开心入园', statChanges: { charm: 5, mood: 8, intelligence: 2 }, followUp: '你很快就适应了幼儿园！' },
      { text: '哭闹不想去', statChanges: { mood: -5, charm: -2, health: 2 }, followUp: '你舍不得家人，但慢慢适应了。' },
    ],
  },
  {
    id: 'school_1',
    minAge: 7,
    maxAge: 12,
    text: '小学期末考试临近，你决定...',
    choices: [
      { text: '爆肝复习', statChanges: { energy: -20, intelligence: 8, health: -3 }, followUp: '你考了好成绩，但累坏了。' },
      { text: '正常发挥', statChanges: { energy: -5, intelligence: 3 }, followUp: '成绩中等，但状态不错。' },
      { text: '彻底摆烂', statChanges: { energy: 10, mood: 5, intelligence: -2, karma: -5 }, followUp: '你玩得很开心，但成绩惨不忍睹。' },
    ],
  },
  {
    id: 'school_2',
    minAge: 6,
    maxAge: 6,
    text: '你第一天上学，有点紧张！',
    eventType: 'milestone',
    choices: [
      { text: '主动认识同学', statChanges: { charm: 5, mood: 8, karma: 3 }, followUp: '你很快就交到了朋友！' },
      { text: '安静坐着', statChanges: { intelligence: 3, charm: -2, mood: -3 }, followUp: '你有点害羞，但慢慢适应了。' },
    ],
  },
  {
    id: 'school_3',
    minAge: 8,
    maxAge: 10,
    text: '你被选入了学校的足球队/舞蹈队！',
    choices: [
      { text: '努力训练', statChanges: { health: 5, charm: 3, energy: -10, mood: 5 }, followUp: '你在社团里表现出色！' },
      { text: '偶尔参加', statChanges: { charm: 1, energy: -3, mood: 3 }, followUp: '你享受社团时光，但没有那么投入。' },
    ],
  },
  {
    id: 'school_4',
    minAge: 9,
    maxAge: 11,
    text: '学校举办了艺术节，你要参加吗？',
    choices: [
      { text: '表演节目', statChanges: { creativity: 8, charm: 5, energy: -15, mood: 10 }, followUp: '你的表演获得了热烈掌声！' },
      { text: '报名绘画比赛', statChanges: { creativity: 5, intelligence: 3, mood: 8 }, followUp: '你的画作获得了优秀奖！' },
      { text: '当观众', statChanges: { mood: 5, creativity: 1 }, followUp: '你看了精彩的表演，很开心。' },
    ],
  },
  {
    id: 'school_5',
    minAge: 7,
    maxAge: 12,
    text: '你考试考了100分，老师表扬了你！',
    choices: [
      { text: '开心炫耀', statChanges: { charm: -2, intelligence: 2, mood: 10, karma: -3 }, followUp: '你很开心，但同学觉得你有点骄傲。' },
      { text: '谦虚感谢', statChanges: { charm: 5, karma: 5, intelligence: 3 }, followUp: '大家都觉得你是个好学生。' },
    ],
  },
  {
    id: 'school_6',
    minAge: 8,
    maxAge: 12,
    text: '你和同学吵架了！',
    choices: [
      { text: '主动道歉', statChanges: { charm: 5, karma: 8, mood: 5 }, followUp: '你们和好了，友谊更坚固了。' },
      { text: '等对方道歉', statChanges: { mood: -8, karma: -3 }, followUp: '你们冷战了好几天。' },
    ],
  },
  {
    id: 'school_7',
    minAge: 10,
    maxAge: 12,
    text: '你开始对电脑/手机游戏感兴趣。',
    choices: [
      { text: '适度游戏', statChanges: { creativity: 3, intelligence: 2, mood: 8, energy: -5 }, followUp: '你学会了平衡，游戏学习两不误。' },
      { text: '沉迷游戏', statChanges: { intelligence: -5, health: -5, mood: 10, energy: -15 }, followUp: '成绩下滑，家长很担心。' },
    ],
  },
  {
    id: 'school_8',
    minAge: 6,
    maxAge: 12,
    text: '你生病了，需要请假在家休息。',
    choices: [
      { text: '好好休息', statChanges: { health: 10, energy: 15, intelligence: -2 }, followUp: '你很快就恢复了！' },
      { text: '坚持上学', statChanges: { health: -8, karma: 3, intelligence: 1 }, followUp: '你很努力，但病情加重了。' },
    ],
  },
  {
    id: 'school_9',
    minAge: 11,
    maxAge: 12,
    text: '你要小学毕业了，有点舍不得。',
    choices: [
      { text: '和同学合影留念', statChanges: { charm: 5, mood: 15, karma: 5 }, followUp: '你留下了美好的回忆！' },
      { text: '期待初中生活', statChanges: { intelligence: 5, mood: 10, creativity: 3 }, followUp: '你对未来充满期待！' },
    ],
  },
  {
    id: 'gaokao',
    minAge: 18,
    maxAge: 18,
    text: '【人生大考】高考来了！这是决定命运的时刻。',
    choices: [
      { text: '全力以赴', statChanges: { energy: -30, intelligence: 10, health: -5, mood: -10 }, followUp: '你超常发挥，考上了理想的大学！' },
      { text: '顺其自然', statChanges: { energy: -15, intelligence: 5, mood: 5 }, followUp: '成绩一般，上了普通学校。' },
      { text: '提前放弃', statChanges: { energy: 20, mood: 10, intelligence: -5, karma: -10 }, followUp: '你选择了另一条路...' },
    ],
  },
  {
    id: 'middle_1',
    minAge: 13,
    maxAge: 15,
    text: '你上初中了，学习压力变大了！',
    choices: [
      { text: '努力适应', statChanges: { intelligence: 5, energy: -10, mood: 3 }, followUp: '你很快就适应了初中生活！' },
      { text: '有点吃力', statChanges: { intelligence: 2, mood: -5, energy: -5 }, followUp: '学习有点困难，但你在坚持。' },
    ],
  },
  {
    id: 'middle_2',
    minAge: 14,
    maxAge: 17,
    condition: (stats) => !stats.isMarried,
    cooldownYears: 5,
    text: '你暗恋上了班上的一个同学。',
    choices: [
      { text: '鼓起勇气表白', statChanges: { charm: 5, mood: 15, karma: 3, energy: -5 }, followUp: '结果如何？无论如何，你很勇敢！' },
      { text: '默默关注', statChanges: { creativity: 3, intelligence: 2, mood: 5 }, followUp: '你把这份感情化作学习的动力。' },
    ],
  },
  {
    id: 'middle_3',
    minAge: 15,
    maxAge: 17,
    text: '中考临近，你感到很紧张。',
    choices: [
      { text: '全力冲刺', statChanges: { intelligence: 8, energy: -20, health: -3, mood: -5 }, followUp: '你考上了理想的高中！' },
      { text: '保持节奏', statChanges: { intelligence: 4, energy: -10, mood: 5 }, followUp: '正常发挥，结果还不错。' },
    ],
  },
  {
    id: 'middle_4',
    minAge: 13,
    maxAge: 18,
    text: '你在网上认识了一些新朋友。',
    choices: [
      { text: '谨慎交往', statChanges: { intelligence: 3, karma: 5, charm: 2 }, followUp: '你交到了真诚的朋友！' },
      { text: '沉迷网络', statChanges: { intelligence: -3, health: -5, mood: 8, energy: -10 }, followUp: '你花了太多时间在网上。' },
    ],
  },
  {
    id: 'middle_5',
    minAge: 14,
    maxAge: 18,
    text: '你有了自己的兴趣爱好！',
    choices: [
      { text: '深入学习', statChanges: { creativity: 8, intelligence: 5, mood: 10, energy: -8 }, followUp: '你在这个领域小有成就！' },
      { text: '当作消遣', statChanges: { creativity: 3, mood: 8, energy: -3 }, followUp: '爱好让你的生活更丰富。' },
    ],
  },
  {
    id: 'middle_6',
    minAge: 16,
    maxAge: 18,
    text: '你和父母因为某些事吵架了。',
    choices: [
      { text: '主动沟通', statChanges: { charm: 5, karma: 8, mood: 5 }, followUp: '你们解开了误会，关系更好了！' },
      { text: '冷战赌气', statChanges: { mood: -10, karma: -3 }, followUp: '家里的气氛很尴尬。' },
    ],
  },
  {
    id: 'middle_7',
    minAge: 13,
    maxAge: 18,
    text: '学校组织了春游/秋游！',
    choices: [
      { text: '积极参与', statChanges: { charm: 5, health: 3, mood: 15, energy: -5 }, followUp: '你玩得非常开心！' },
      { text: '安静观察', statChanges: { creativity: 3, intelligence: 2, mood: 8 }, followUp: '你享受了大自然的美好。' },
    ],
  },
  {
    id: 'middle_8',
    minAge: 16,
    maxAge: 18,
    text: '你开始考虑未来的职业方向。',
    choices: [
      { text: '认真规划', statChanges: { intelligence: 5, creativity: 3, mood: 5 }, followUp: '你对未来有了清晰的目标！' },
      { text: '走一步看一步', statChanges: { mood: 3, luck: 2 }, followUp: '你相信船到桥头自然直。' },
    ],
  },
  {
    id: 'work_1',
    minAge: 22,
    maxAge: 30,
    text: '你在公司遇到了内卷的工作氛围。',
    choices: [
      { text: '爆肝加班', statChanges: { money: 2000, energy: -25, health: -8, mood: -15 }, followUp: '老板赏识你，但身体被掏空。' },
      { text: '到点下班', statChanges: { money: 500, energy: -5, mood: 10, karma: 5 }, followUp: '你保住了生活，但晋升无望。' },
    ],
  },
  {
    id: 'invest_1',
    minAge: 25,
    maxAge: 35,
    condition: (stats, tier) => tier === 'SSR' || tier === 'SR' || stats.money >= 10000,
    text: '朋友推荐了一个"稳赚不赔"的投资项目。',
    choices: [
      { text: 'All in!', statChanges: { money: -5000, mood: -20, karma: -10 }, followUp: '你被骗了，血本无归。' },
      { text: '谨慎观望', statChanges: { intelligence: 3 }, followUp: '后来听说那个项目暴雷了，你躲过一劫。' },
      { text: '推荐给别人', statChanges: { money: 500, karma: -20 }, followUp: '你赚了佣金，但失去了朋友。' },
    ],
  },
  {
    id: 'young_1',
    minAge: 19,
    maxAge: 22,
    text: '你上大学了！要选择怎么度过这四年？',
    choices: [
      { text: '认真学习', statChanges: { intelligence: 10, energy: -15, karma: 5, mood: 5 }, followUp: '你成绩优异，获得了奖学金！' },
      { text: '参加社团', statChanges: { charm: 8, creativity: 5, mood: 10, energy: -10 }, followUp: '你认识了很多朋友，大学生活很精彩！' },
      { text: '边玩边学', statChanges: { intelligence: 3, mood: 12, energy: 5 }, followUp: '你过得很开心，成绩一般。' },
    ],
  },
  {
    id: 'young_2',
    minAge: 20,
    maxAge: 25,
    condition: (stats) => !stats.isMarried,
    cooldownYears: 5,
    text: '你谈恋爱了！',
    choices: [
      { text: '认真交往', statChanges: { charm: 5, mood: 15, karma: 8, energy: -5 }, followUp: '你们的感情很稳定！' },
      { text: '随便玩玩', statChanges: { mood: 10, karma: -5, charm: 2 }, followUp: '恋爱让你开心，但有点不负责任。' },
    ],
  },
  {
    id: 'young_3',
    minAge: 23,
    maxAge: 28,
    text: '你拿到了第一份工资！',
    choices: [
      { text: '孝敬父母', statChanges: { karma: 10, mood: 12, money: -1000, charm: 3 }, followUp: '父母很开心，你是个孝顺的孩子！' },
      { text: '买喜欢的东西', statChanges: { mood: 15, money: -2000, creativity: 2 }, followUp: '你犒劳了一下自己！' },
      { text: '存起来', statChanges: { intelligence: 5, money: 200, mood: 5 }, followUp: '你学会了理财！' },
    ],
  },
  {
    id: 'young_4',
    minAge: 24,
    maxAge: 30,
    text: '工作上有一个晋升机会，但需要加班。',
    choices: [
      { text: '抓住机会', statChanges: { money: 5000, intelligence: 5, energy: -20, mood: -5 }, followUp: '你成功晋升了！' },
      { text: '保持现状', statChanges: { mood: 8, energy: 10, karma: 3 }, followUp: '你选择了生活和工作的平衡。' },
    ],
  },
  {
    id: 'young_5',
    minAge: 21,
    maxAge: 28,
    text: '你想学习一门新技能。',
    choices: [
      { text: '学编程/设计', statChanges: { intelligence: 8, creativity: 5, energy: -15, money: -2000 }, followUp: '你掌握了一项实用技能！' },
      { text: '学外语', statChanges: { intelligence: 6, charm: 4, energy: -10, money: -1000 }, followUp: '你的外语水平进步很大！' },
      { text: '学乐器/绘画', statChanges: { creativity: 10, mood: 10, energy: -8 }, followUp: '艺术让你的生活更美好！' },
    ],
  },
  {
    id: 'young_6',
    minAge: 26,
    maxAge: 32,
    text: '朋友约你一起创业。',
    choices: [
      { text: '大胆尝试', statChanges: { luck: 5, creativity: 8, energy: -25, money: -10000 }, followUp: '创业路漫漫，但你学到了很多！' },
      { text: '谨慎拒绝', statChanges: { intelligence: 3, karma: 2, mood: 3 }, followUp: '你选择了稳定的生活。' },
    ],
  },
  {
    id: 'young_7',
    minAge: 22,
    maxAge: 30,
    condition: (stats, tier) => tier === 'SSR' || tier === 'SR' || stats.money >= 50000,
    text: '你决定去旅行！',
    choices: [
      { text: '环游世界', statChanges: { creativity: 10, charm: 5, mood: 20, money: -30000, energy: -10 }, followUp: '你见识了世界，收获满满！' },
      { text: '国内旅游', statChanges: { creativity: 5, mood: 12, money: -5000, energy: -5 }, followUp: '你玩得很开心！' },
    ],
  },
  {
    id: 'young_8',
    minAge: 20,
    maxAge: 28,
    text: '你和最好的朋友发生了矛盾。',
    choices: [
      { text: '主动和解', statChanges: { charm: 8, karma: 10, mood: 10 }, followUp: '你们和好了，友谊更坚固！' },
      { text: '保持距离', statChanges: { mood: -10, karma: -3 }, followUp: '你们的关系变淡了。' },
    ],
  },
  {
    id: 'midlife_crisis',
    minAge: 35,
    maxAge: 35,
    text: '【强制剧情】Lv.35 中年危机触发！你开始质疑人生的意义。',
    choices: [
      { text: '疯狂消费', statChanges: { money: -5000, mood: 15, karma: -5 }, followUp: '你买了豪车，但空虚感更强了。' },
      { text: '学习新技能', statChanges: { energy: -15, intelligence: 10, mood: 10 }, followUp: '你报名了编程课，感觉重新找到了方向。' },
      { text: '躺平接受', statChanges: { mood: -15, energy: 10 }, followUp: '你接受了平凡，但内心仍有不甘。' },
    ],
  },
  {
    id: 'house',
    minAge: 28,
    maxAge: 45,
    condition: (stats, tier) => tier === 'SSR' || tier === 'SR' || stats.money >= 100000,
    text: '房价飞涨，你决定...',
    choices: [
      { text: '贷款买房', statChanges: { money: -50000, mood: 5, karma: 5 }, followUp: '你背上了30年房贷，获得了【长线吸血Debuff】。' },
      { text: '继续租房', statChanges: { mood: -10, money: -2000 }, followUp: '你保持了灵活性，但没有归属感。' },
      { text: '回老家', statChanges: { money: -10000, mood: 15, charm: -5 }, followUp: '你逃离了大城市，生活成本降低了。' },
    ],
  },
  {
    id: 'marriage',
    minAge: 25,
    maxAge: 40,
    condition: (stats, tier) => !stats.isMarried && (tier === 'SSR' || tier === 'SR' || tier === 'R' || stats.money >= 80000),
    text: '家里催婚，你遇到了一个还不错的对象。',
    choices: [
      { text: '步入婚姻', statChanges: { money: -50000, mood: 20, energy: -10, karma: 10, isMarried: true }, followUp: '你组建了家庭，开启了新副本。' },
      { text: '保持单身', statChanges: { mood: -5, money: 20000, energy: 10 }, followUp: '你保持了自由，但偶尔感到孤独。' },
    ],
  },
  {
    id: 'health_crises',
    minAge: 40,
    maxAge: 60,
    condition: (stats, tier) => stats.health < 60 && (tier === 'SSR' || tier === 'SR' || tier === 'R' || stats.money >= 50000),
    text: '体检报告出来了，多项指标异常。',
    choices: [
      { text: '积极治疗', statChanges: { money: -30000, health: 20, mood: 5 }, followUp: '你花了很多钱，但身体好转了。' },
      { text: '继续熬夜', statChanges: { health: -15, money: 5000, mood: -10 }, followUp: '你的身体每况愈下...' },
    ],
  },
  {
    id: 'genius_opportunity',
    minAge: 16,
    maxAge: 30,
    condition: (stats, tier) => stats.intelligence >= 120 && (tier === 'SSR' || tier === 'SR' || stats.money >= 30000),
    text: '【天才特供】你的智商引起了一家科技公司的注意！',
    choices: [
      { text: '接受邀请', statChanges: { money: 50000, intelligence: 5, creativity: 3, energy: -15 }, followUp: '你加入了这家公司，成为技术骨干！' },
      { text: '继续深造', statChanges: { intelligence: 10, creativity: 5, money: -20000, energy: -10 }, followUp: '你去读博了，学术造诣更进一步！' },
    ],
  },
  {
    id: 'charmer_love',
    minAge: 16,
    maxAge: 40,
    condition: (stats, familyTier) => stats.charm >= 90 && !stats.isMarried,
    cooldownYears: 5,
    text: '【万人迷】你太有魅力了！同时有好几个人向你表白！',
    choices: [
      { text: '选最喜欢的那个', statChanges: { mood: 20, karma: 5, charm: 3, isMarried: true }, followUp: '你和最爱的人在一起了！' },
      { text: '都不选', statChanges: { mood: -5, karma: 3, intelligence: 2 }, followUp: '你选择专注于事业！' },
    ],
  },
  {
    id: 'lucky_windfall',
    minAge: 18,
    maxAge: 80,
    condition: (stats) => stats.luck >= 90,
    text: '【欧皇附体】你的运气太好了！买彩票中了大奖！',
    choices: [
      { text: '领奖去', statChanges: { money: 100000, mood: 30, luck: 2 }, followUp: '你一夜暴富！解锁了富甲一方成就！' },
      { text: '不敢相信', statChanges: { mood: 10, intelligence: -2 }, followUp: '你以为是诈骗，错过了大奖...' },
    ],
  },
  {
    id: 'retirement',
    minAge: 60,
    maxAge: 60,
    condition: (stats, tier) => tier === 'SSR' || tier === 'SR' || stats.money >= 150000,
    text: '【里程碑】你退休了！',
    choices: [
      { text: '环游世界', statChanges: { money: -100000, mood: 30, health: -5 }, followUp: '你花光了积蓄，但见识了世界。' },
      { text: '帮带孙子', statChanges: { energy: -20, mood: 15, karma: 15 }, followUp: '你享受天伦之乐，但很累。' },
      { text: '继续工作', statChanges: { money: 30000, energy: -15, health: -5 }, followUp: '你发挥余热，但身体吃不消。' },
    ],
  },
  {
    id: 'elder_1',
    minAge: 61,
    maxAge: 75,
    text: '你参加了老年大学，学习新知识！',
    choices: [
      { text: '认真上课', statChanges: { intelligence: 8, creativity: 5, mood: 10, energy: -8 } },
      { text: '结交朋友', statChanges: { charm: 8, mood: 15, karma: 5 } },
    ],
  },
  {
    id: 'elder_2',
    minAge: 65,
    maxAge: 85,
    text: '你的孙子/孙女来看你了！',
    choices: [
      { text: '好好陪伴', statChanges: { mood: 20, karma: 8, energy: -10 } },
      { text: '给零花钱', statChanges: { mood: 10, money: -2000, charm: 5 } },
    ],
  },
  {
    id: 'elder_3',
    minAge: 62,
    maxAge: 80,
    text: '你和老朋友一起去钓鱼/下棋！',
    choices: [
      { text: '享受时光', statChanges: { health: 5, mood: 15, energy: 5 } },
      { text: '切磋技艺', statChanges: { intelligence: 5, creativity: 3, mood: 10 } },
    ],
  },
  {
    id: 'elder_4',
    minAge: 70,
    maxAge: 90,
    text: '体检时医生建议你注意养生。',
    choices: [
      { text: '积极养生', statChanges: { health: 15, energy: 10, money: -3000 } },
      { text: '顺其自然', statChanges: { health: -5, mood: 5 } },
    ],
  },
  {
    id: 'elder_5',
    minAge: 65,
    maxAge: 85,
    text: '你想培养一个新爱好！',
    choices: [
      { text: '学书法/绘画', statChanges: { creativity: 10, mood: 12, energy: -5 } },
      { text: '学园艺', statChanges: { health: 5, creativity: 5, mood: 10, energy: -8 } },
    ],
  },
  {
    id: 'elder_6',
    minAge: 75,
    maxAge: 95,
    text: '你开始写回忆录了！',
    choices: [
      { text: '认真撰写', statChanges: { creativity: 10, intelligence: 5, mood: 15, energy: -10 } },
      { text: '偶尔记录', statChanges: { creativity: 5, mood: 8 } },
    ],
  },
  {
    id: 'elder_7',
    minAge: 68,
    maxAge: 88,
    text: '社区组织老年活动，邀请你参加！',
    choices: [
      { text: '积极参与', statChanges: { charm: 8, mood: 15, karma: 5, energy: -8 } },
      { text: '当志愿者', statChanges: { karma: 12, charm: 5, mood: 10, energy: -10 } },
    ],
  },
  {
    id: 'elder_8',
    minAge: 72,
    maxAge: 92,
    text: '你想出去旅行，但身体有些吃不消。',
    choices: [
      { text: '短途旅行', statChanges: { mood: 12, creativity: 5, energy: -15, money: -5000 } },
      { text: '看旅行节目', statChanges: { mood: 8, creativity: 3, energy: 5 } },
    ],
  },
  {
    id: 'elder_9',
    minAge: 60,
    maxAge: 80,
    condition: (stats, tier) => tier === 'SSR' || tier === 'SR' || stats.money >= 50000,
    text: '你想赞助一个贫困学生！',
    choices: [
      { text: '慷慨资助', statChanges: { karma: 20, mood: 20, money: -30000 } },
      { text: '力所能及', statChanges: { karma: 10, mood: 10, money: -5000 } },
    ],
  },
  {
    id: 'elder_10',
    minAge: 80,
    maxAge: 100,
    text: '你的生日到了，很多人来看你！',
    choices: [
      { text: '开心庆祝', statChanges: { mood: 25, charm: 8, karma: 5, energy: -15 } },
      { text: '简单度过', statChanges: { mood: 10, health: 3, energy: 5 } },
    ],
  },
  {
    id: 'elder_11',
    minAge: 65,
    maxAge: 85,
    text: '你学会了使用智能手机！',
    choices: [
      { text: '和家人视频', statChanges: { charm: 8, mood: 15, intelligence: 3 } },
      { text: '网上冲浪', statChanges: { intelligence: 5, creativity: 3, mood: 10 } },
    ],
  },
  {
    id: 'elder_12',
    minAge: 75,
    maxAge: 95,
    text: '你把年轻时的照片整理成册！',
    choices: [
      { text: '仔细回忆', statChanges: { mood: 18, creativity: 6, karma: 5, energy: -8 } },
      { text: '和家人分享', statChanges: { charm: 10, mood: 15, karma: 3 } },
    ],
  },
  {
    id: 'teen_1',
    minAge: 13,
    maxAge: 15,
    text: '你开始追星了！',
    choices: [
      { text: '理性追星', statChanges: { mood: 10, creativity: 3, intelligence: 2 } },
      { text: '疯狂追星', statChanges: { mood: 15, money: -1000, intelligence: -3, karma: -2 } },
    ],
  },
  {
    id: 'teen_2',
    minAge: 15,
    maxAge: 18,
    text: '你第一次打暑假工！',
    choices: [
      { text: '认真工作', statChanges: { money: 3000, charm: 5, intelligence: 3, energy: -15 } },
      { text: '体验生活', statChanges: { money: 1500, mood: 10, charm: 3 } },
    ],
  },
  {
    id: 'adult_1',
    minAge: 22,
    maxAge: 30,
    condition: (stats) => !stats.isMarried,
    text: '朋友给你介绍对象！',
    choices: [
      { text: '去相亲', statChanges: { charm: 5, mood: 8, energy: -5 } },
      { text: '婉言谢绝', statChanges: { mood: 3, intelligence: 2 } },
    ],
  },
  {
    id: 'adult_2',
    minAge: 25,
    maxAge: 40,
    text: '你想养个宠物！',
    choices: [
      { text: '养宠物', statChanges: { mood: 15, karma: 8, health: 3, money: -2000, energy: -10 } },
      { text: '云吸宠', statChanges: { mood: 8, creativity: 2 } },
    ],
  },
  // 家庭等级专属事件
  {
    id: 'ssr_family_inheritance',
    minAge: 18,
    maxAge: 25,
    condition: (_, familyTier) => familyTier === 'SSR',
    text: '【SSR专属】你年满18岁，家族企业交给你打理了！',
    choices: [
      { text: '接受重任', statChanges: { money: 500000, intelligence: 10, charm: 10, energy: -20 }, followUp: '你成为了家族企业的继承人，人生巅峰！' },
      { text: '另起炉灶', statChanges: { money: 200000, creativity: 15, karma: 10 }, followUp: '你拿着启动资金自己创业了！' },
    ],
  },
  {
    id: 'ssr_school_choice',
    minAge: 6,
    maxAge: 12,
    condition: (_, familyTier) => familyTier === 'SSR',
    text: '【SSR专属】父母要送你去贵族学校！',
    choices: [
      { text: '开心上学', statChanges: { intelligence: 10, charm: 8, mood: 10 }, followUp: '你在贵族学校接受了最好的教育！' },
      { text: '想去普通学校', statChanges: { intelligence: 5, karma: 5, charm: -2 }, followUp: '你选择体验普通人的生活。' },
    ],
  },
  {
    id: 'sr_family_support',
    minAge: 18,
    maxAge: 25,
    condition: (_, familyTier) => familyTier === 'SR',
    text: '【SR专属】父母给你买了一套房子！',
    choices: [
      { text: '感谢父母', statChanges: { money: 0, mood: 20, karma: 10, charm: 5 }, followUp: '你有了自己的房子，生活更稳定了！' },
      { text: '自己奋斗', statChanges: { money: 50000, intelligence: 5, karma: 5 }, followUp: '你想靠自己，父母还是给了你一笔钱。' },
    ],
  },
  {
    id: 'sr_study_abroad',
    minAge: 18,
    maxAge: 22,
    condition: (_, familyTier) => familyTier === 'SR',
    text: '【SR专属】父母支持你出国留学！',
    choices: [
      { text: '出国留学', statChanges: { intelligence: 15, charm: 10, creativity: 8, money: -100000 }, followUp: '你在国外开阔了眼界！' },
      { text: '国内发展', statChanges: { intelligence: 5, karma: 5, money: 50000 }, followUp: '你选择在国内发展。' },
    ],
  },
  {
    id: 'r_work_hard',
    minAge: 22,
    maxAge: 30,
    condition: (_, familyTier) => familyTier === 'R',
    text: '【R专属】你找到了一份不错的工作，需要努力奋斗！',
    choices: [
      { text: '努力工作', statChanges: { money: 30000, intelligence: 5, energy: -15, charm: 3 }, followUp: '你在职场上稳步前进！' },
      { text: '追求梦想', statChanges: { money: -10000, creativity: 10, mood: 10, luck: 3 }, followUp: '你一边工作一边追求梦想。' },
    ],
  },
  {
    id: 'r_start_small_business',
    minAge: 25,
    maxAge: 40,
    condition: (_, familyTier) => familyTier === 'R',
    text: '【R专属】你想做点小生意！',
    choices: [
      { text: '开个小店', statChanges: { money: -20000, intelligence: 5, charm: 5, luck: 5 }, followUp: '你的小店生意还不错！' },
      { text: '稳健工作', statChanges: { money: 10000, intelligence: 3, karma: 3 }, followUp: '你选择继续稳定工作。' },
    ],
  },
  {
    id: 'iron_survival_challenge',
    minAge: 6,
    maxAge: 18,
    condition: (_, familyTier) => familyTier === 'IRON',
    text: '【N专属】家里条件不好，你需要帮忙补贴家用！',
    choices: [
      { text: '努力帮忙', statChanges: { karma: 10, health: -5, intelligence: 3, charm: 2 }, followUp: '你是个懂事的孩子，家人很欣慰。' },
      { text: '专注学习', statChanges: { intelligence: 8, karma: 5, mood: -5 }, followUp: '你想通过学习改变命运。' },
    ],
  },
  {
    id: 'iron_lucky_break',
    minAge: 18,
    maxAge: 35,
    condition: (_, familyTier) => familyTier === 'IRON',
    text: '【N专属】你遇到了一个难得的机会！',
    choices: [
      { text: '抓住机会', statChanges: { money: 30000, intelligence: 5, luck: 10, karma: 5 }, followUp: '你抓住了这个机会，人生开始改变！' },
      { text: '不敢冒险', statChanges: { money: 5000, mood: -5, intelligence: 2 }, followUp: '你错过了这次机会。' },
    ],
  },
  {
    id: 'iron_first_job',
    minAge: 16,
    maxAge: 22,
    condition: (_, familyTier) => familyTier === 'IRON',
    text: '【N专属】你需要早点工作补贴家用！',
    choices: [
      { text: '去打工', statChanges: { money: 15000, charm: 5, health: -3, intelligence: 2 }, followUp: '你开始了自己的第一份工作。' },
      { text: '先读书', statChanges: { intelligence: 8, mood: -5, money: -5000 }, followUp: '你想先完成学业。' },
    ],
  },
];

export const randomEvents: GameEvent[] = [
  {
    id: 'random_1',
    minAge: 6,
    maxAge: 100,
    text: '你在路上捡到了100块钱。',
    choices: [
      { text: '据为己有', statChanges: { money: 100, karma: -2 }, followUp: '小赚一笔，但良心有点不安。' },
      { text: '交给警察', statChanges: { karma: 5 }, followUp: '好人有好报！' },
    ],
  },
  {
    id: 'random_2',
    minAge: 22,
    maxAge: 60,
    text: '公司突然裁员，你失业了。',
    choices: [
      { text: '立即找工作', statChanges: { money: -5000, energy: -15, mood: -10 }, followUp: '你很快找到了新工作。' },
      { text: '休息一段时间', statChanges: { money: -15000, energy: 20, mood: 10 }, followUp: '你充电完毕，但钱包瘪了。' },
    ],
  },
  {
    id: 'random_3',
    minAge: 25,
    maxAge: 60,
    text: '老同学聚会，大家攀比收入。',
    choices: [
      { text: '吹牛装逼', statChanges: { mood: 10, karma: -5 }, followUp: '你获得了短暂的虚荣。' },
      { text: '默默吃饭', statChanges: { mood: -5, intelligence: 2 }, followUp: '你认清了现实，决定更加努力。' },
    ],
  },
  {
    id: 'random_4',
    minAge: 20,
    maxAge: 80,
    text: '股市大涨，你的股票翻倍了！',
    choices: [
      { text: '见好就收', statChanges: { money: 50000, mood: 20 }, followUp: '你落袋为安，心情大好。' },
      { text: '继续加仓', statChanges: { money: -30000, mood: -20 }, followUp: '股市暴跌，你被割了韭菜。' },
    ],
  },
  {
    id: 'random_5',
    minAge: 16,
    maxAge: 50,
    text: '你遇到了初恋。',
    choices: [
      { text: '旧情复燃', statChanges: { mood: 15, karma: -15, money: -10000 }, followUp: '你出轨了，家庭陷入危机。' },
      { text: '礼貌告别', statChanges: { karma: 5, mood: 5 }, followUp: '你守住了底线。' },
    ],
  },
  {
    id: 'random_6',
    minAge: 10,
    maxAge: 40,
    text: '熬夜打游戏，第二天起不来。',
    choices: [
      { text: '请假继续睡', statChanges: { energy: 10, health: -3, money: -500 }, followUp: '你恢复了精力，但扣了工资。' },
      { text: '强撑上班', statChanges: { energy: -20, health: -5, mood: -10 }, followUp: '你度过了痛苦的一天。' },
    ],
  },
  {
    id: 'random_7',
    minAge: 16,
    maxAge: 100,
    text: '你买彩票中了小奖！',
    choices: [
      { text: '开心消费', statChanges: { money: 2000, mood: 15, luck: 3 }, followUp: '你用奖金好好犒劳了自己！' },
      { text: '存起来', statChanges: { money: 2000, intelligence: 2 }, followUp: '你把奖金存了起来。' },
    ],
  },
  {
    id: 'random_8',
    minAge: 6,
    maxAge: 100,
    text: '下雨了，你没带伞。',
    choices: [
      { text: '冒雨跑回家', statChanges: { health: -5, mood: -5, energy: -8 }, followUp: '你淋湿了，可能会感冒。' },
      { text: '等雨停', statChanges: { mood: -3, money: -30 }, followUp: '你买了杯咖啡，慢慢等雨停。' },
    ],
  },
  {
    id: 'random_9',
    minAge: 8,
    maxAge: 100,
    text: '你在书店发现了一本好书。',
    choices: [
      { text: '买下来阅读', statChanges: { intelligence: 5, creativity: 3, money: -100, mood: 8 }, followUp: '这本书让你收获良多！' },
      { text: '网上找电子版', statChanges: { intelligence: 3, money: 0, karma: -2 }, followUp: '你省了钱，但有点不好意思。' },
    ],
  },
  {
    id: 'random_10',
    minAge: 18,
    maxAge: 80,
    text: '朋友找你借钱。',
    choices: [
      { text: '爽快借给他', statChanges: { money: -5000, karma: 8, charm: 5 }, followUp: '朋友很感激你！' },
      { text: '委婉拒绝', statChanges: { money: 0, karma: -2, mood: -3 }, followUp: '你保住了钱，但有点愧疚。' },
    ],
  },
  {
    id: 'random_11',
    minAge: 5,
    maxAge: 80,
    text: '你意外发现了一个新爱好！',
    choices: [
      { text: '深入学习', statChanges: { creativity: 8, mood: 12, energy: -5 }, followUp: '这个爱好让你的生活更丰富了！' },
      { text: '浅尝辄止', statChanges: { creativity: 2, mood: 5 }, followUp: '你尝试了一下，觉得还不错。' },
    ],
  },
  {
    id: 'random_12',
    minAge: 0,
    maxAge: 100,
    text: '今天运气特别好，做什么都顺利！',
    choices: [
      { text: '趁好运做事', statChanges: { luck: 5, mood: 15, intelligence: 3 }, followUp: '你趁着好运完成了很多事！' },
      { text: '平常心对待', statChanges: { karma: 3, mood: 8 }, followUp: '你保持了平常心，心情不错。' },
    ],
  },
  {
    id: 'random_13',
    minAge: 3,
    maxAge: 100,
    text: '你吃到了一顿超好吃的美食！',
    choices: [
      { text: '大快朵颐', statChanges: { mood: 20, health: 3, money: -200 }, followUp: '这顿饭太满足了！' },
      { text: '适量品尝', statChanges: { mood: 10, health: 1, money: -100 }, followUp: '美味又健康！' },
    ],
  },
  {
    id: 'random_14',
    minAge: 5,
    maxAge: 100,
    text: '你收到了一份意外的礼物！',
    choices: [
      { text: '开心收下', statChanges: { mood: 15, charm: 3, karma: 2 }, followUp: '你很喜欢这份礼物！' },
      { text: '回赠礼物', statChanges: { mood: 10, karma: 8, money: -300, charm: 5 }, followUp: '你们的关系更好了！' },
    ],
  },
  {
    id: 'random_15',
    minAge: 1,
    maxAge: 100,
    text: '你走路时不小心摔了一跤。',
    choices: [
      { text: '自己爬起来', statChanges: { health: -3, karma: 3, mood: -5 }, followUp: '你没事，就是有点疼。' },
      { text: '寻求帮助', statChanges: { charm: 2, mood: 3, health: -1 }, followUp: '好心人帮了你！' },
    ],
  },
  {
    id: 'random_16',
    minAge: 5,
    maxAge: 100,
    text: '你看到了一场美丽的日落/日出。',
    choices: [
      { text: '停下欣赏', statChanges: { mood: 15, creativity: 5, energy: 5 }, followUp: '大自然太美了！' },
      { text: '拍照记录', statChanges: { creativity: 3, mood: 10 }, followUp: '你拍下了美丽的一刻！' },
    ],
  },
  {
    id: 'random_17',
    minAge: 12,
    maxAge: 100,
    text: '你的手机/电脑坏了。',
    choices: [
      { text: '买新的', statChanges: { money: -8000, mood: 10, creativity: 2 }, followUp: '新设备用着真爽！' },
      { text: '拿去修', statChanges: { money: -1000, intelligence: 2, mood: -5 }, followUp: '修好了，又能用了。' },
    ],
  },
  {
    id: 'random_18',
    minAge: 3,
    maxAge: 100,
    text: '你做了一个好梦！',
    choices: [
      { text: '回味梦境', statChanges: { creativity: 5, mood: 12, intelligence: 2 }, followUp: '这个梦给了你很多灵感！' },
      { text: '忘记它', statChanges: { mood: 5 }, followUp: '好心情保持了一整天。' },
    ],
  },
  {
    id: 'random_19',
    minAge: 16,
    maxAge: 100,
    text: '超市打折，很多商品半价！',
    choices: [
      { text: '囤货', statChanges: { money: -2000, mood: 8, intelligence: 3 }, followUp: '你囤了很多有用的东西！' },
      { text: '只买需要的', statChanges: { money: -500, intelligence: 5, karma: 2 }, followUp: '理性消费，值得表扬！' },
    ],
  },
  {
    id: 'random_20',
    minAge: 8,
    maxAge: 100,
    text: '你帮助了一个陌生人。',
    choices: [
      { text: '热心帮助', statChanges: { karma: 10, charm: 5, mood: 15, energy: -5 }, followUp: '帮助别人让你很快乐！' },
      { text: '力所能及', statChanges: { karma: 5, mood: 8 }, followUp: '你做了力所能及的事。' },
    ],
  },
];

export function getAvailableEvents(age: number, stats: PlayerStats, familyTier?: FamilyTier | null, lastTriggeredEvents?: Record<string, number>): GameEvent[] {
  // 检查事件是否在冷却期
  const isEventOnCooldown = (event: GameEvent): boolean => {
    if (!lastTriggeredEvents || !event.cooldownYears) return false;
    const lastTriggeredYear = lastTriggeredEvents[event.id];
    if (lastTriggeredYear === undefined) return false;
    return age - lastTriggeredYear < event.cooldownYears;
  };

  // 1. 优先选择条件事件（包括家庭等级相关）
  const conditionalEvents = eventLibrary.filter(
    (e) => age >= e.minAge && age <= e.maxAge && e.condition && e.condition(stats, familyTier) && !isEventOnCooldown(e)
  );
  
  if (conditionalEvents.length > 0) {
    return conditionalEvents;
  }
  
  // 2. 选择专属年龄事件
  const ageEvents = eventLibrary.filter(
    (e) => age >= e.minAge && age <= e.maxAge && !e.condition && !isEventOnCooldown(e)
  );
  
  // 3. 30% 概率添加随机事件
  const resultEvents = [...ageEvents];
  if (Math.random() < 0.3 && randomEvents.length > 0) {
    const availableRandomEvents = randomEvents.filter(
      (e) => age >= e.minAge && age <= e.maxAge && !isEventOnCooldown(e)
    );
    if (availableRandomEvents.length > 0) {
      const randomEvent = availableRandomEvents[Math.floor(Math.random() * availableRandomEvents.length)];
      resultEvents.push(randomEvent);
    }
  }
  
  // 4. 兜底默认事件
  if (resultEvents.length === 0) {
    resultEvents.push({
      id: `default_${age}`,
      minAge: age,
      maxAge: age,
      text: '平平淡淡的一年过去了，生活还在继续。',
      choices: [
        { text: '继续努力', statChanges: { mood: 2, intelligence: 1, energy: -3 }, followUp: '你又度过了充实的一年。' },
        { text: '享受生活', statChanges: { mood: 5, energy: 5, money: -1000 }, followUp: '你好好休息了一下，心情不错。' },
      ],
    });
  }
  
  return resultEvents;
}
