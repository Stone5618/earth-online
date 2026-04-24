import type { GameEvent, FamilyTier, PlayerStats } from '../core/types';
import { EDUCATION_EVENTS, RETIREMENT_EVENTS } from '../systems';
import { CAREERS } from '../../config/gameConfig';

/**
 * 职业系统相关事件
 */
export const CAREER_EVENTS: GameEvent[] = [
  // 失业事件
  {
    id: 'career_unemployment',
    minAge: 22,
    maxAge: 60,
    cooldownYears: 8,
    maxOccurrences: 2,
    condition: (stats: PlayerStats) => stats.career?.currentCareer !== null && !stats.retired && !stats.isUnemployed,
    text: '【失业危机】公司经营困难，你被裁员了...',
    eventType: 'negative',
    weight: 5, // 降低失业概率
    choices: [
      { 
        text: '接受现实，调整心态', 
        statChanges: { 
          mood: -15, 
          karma: 5, 
          intelligence: 3 
        }, 
        followUp: '虽然很难过，但你决定积极面对，为未来做准备。' 
      },
      { 
        text: '立即开始找工作', 
        statChanges: { 
          mood: -10, 
          intelligence: 5, 
          charm: 3 
        }, 
        followUp: '你化悲痛为力量，马上开始准备简历找工作！' 
      },
    ],
  },
  // 再就业事件 - 积极投递简历
  {
    id: 'career_reemployment_apply',
    minAge: 22,
    maxAge: 60,
    cooldownYears: 3,
    condition: (stats: PlayerStats) => stats.career?.currentCareer === null && !stats.retired && (stats.isUnemployed === true),
    text: '【求职中】你投递了很多简历，有公司愿意面试你！',
    eventType: 'positive',
    weight: 10,
    choices: [
      { 
        text: '认真准备面试', 
        statChanges: { 
          intelligence: 8, 
          charm: 5, 
          skillPoints: 2 
        }, 
        followUp: '你认真准备，面试表现不错！' 
      },
      { 
        text: '先了解公司情况', 
        statChanges: { 
          intelligence: 6, 
          karma: 3 
        }, 
        followUp: '你先了解了公司，选择更适合自己的机会。' 
      },
    ],
  },
  // 再就业事件 - 学习新技能
  {
    id: 'career_reemployment_learn',
    minAge: 22,
    maxAge: 55,
    cooldownYears: 4,
    condition: (stats: PlayerStats) => stats.career?.currentCareer === null && !stats.retired && (stats.isUnemployed === true),
    text: '【技能提升】失业期间，你想学习新技能提升竞争力！',
    eventType: 'positive',
    weight: 8,
    choices: [
      { 
        text: '学习编程技术', 
        statChanges: { 
          money: -20000, 
          intelligence: 15, 
          skillPoints: 5, 
          skills: { programming: 1 } as any 
        }, 
        followUp: '你学习了编程，就业竞争力大幅提升！' 
      },
      { 
        text: '提升沟通能力', 
        statChanges: { 
          money: -10000, 
          charm: 15, 
          skillPoints: 3 
        }, 
        followUp: '沟通能力提升，让你在面试中更有优势！' 
      },
      { 
        text: '先休息一段时间', 
        statChanges: { 
          mood: 10, 
          health: 5 
        }, 
        followUp: '休息让你恢复了精力，准备重新出发！' 
      },
    ],
  },
  // 再就业成功事件
  {
    id: 'career_reemployment_success',
    minAge: 22,
    maxAge: 60,
    cooldownYears: 5,
    condition: (stats: PlayerStats) => stats.career?.currentCareer === null && !stats.retired && (stats.isUnemployed === true),
    text: '【再就业成功！】经过努力，你找到了新工作！',
    eventType: 'milestone',
    weight: 9,
    choices: [
      { 
        text: '珍惜新机会，努力工作', 
        statChanges: { 
          mood: 25, 
          karma: 10, 
          intelligence: 8, 
          charm: 5 
        }, 
        followUp: '你珍惜这个机会，在新岗位上努力工作！' 
      },
      { 
        text: '总结经验，规划未来', 
        statChanges: { 
          mood: 20, 
          intelligence: 10, 
          karma: 5 
        }, 
        followUp: '你从这次经历中学到了很多，对未来有了更清晰的规划！' 
      },
    ],
  },
  // 找工作事件
  {
    id: 'career_looking_for_job',
    minAge: 18,
    maxAge: 60,
    cooldownYears: 2,
    condition: (stats: PlayerStats) => !stats.career?.currentCareer && !stats.isUnemployed && !stats.retired,
    text: '【求职】你到了找工作的年龄，是否开始寻找职业？',
    eventType: 'milestone',
    weight: 12,
    choices: [
      { text: '积极投递简历，寻找机会', statChanges: { intelligence: 3, charm: 2 }, followUp: '你开始积极寻找工作！' },
      { text: '先学习技能，提升自己', statChanges: { intelligence: 8, skillPoints: 4 }, followUp: '你决定先学习提升，为职业做准备！' },
      { text: '先玩玩再说', statChanges: { mood: 10 }, followUp: '你决定先享受生活，工作的事以后再说！' },
    ],
  },
  
  // 入职事件
  {
    id: 'career_get_job',
    minAge: 18,
    maxAge: 60,
    cooldownYears: 2,
    condition: (stats: PlayerStats) => !stats.career?.currentCareer && !stats.retired,
    text: '【入职成功】你找到了一份工作！',
    eventType: 'milestone',
    weight: 10,
    choices: [
      { text: '努力工作，积极表现', statChanges: { intelligence: 4, karma: 3, mood: 5 }, followUp: '你开始认真工作，为职业发展打下基础！' },
      { text: '先观察，不急于表现', statChanges: { intelligence: 2 }, followUp: '你决定先观察环境，再制定职业策略！' },
    ],
  },
  
  {
    id: 'career_choice_18',
    minAge: 18,
    maxAge: 18,
    maxOccurrences: 1,
    text: '【职业选择】你成年了，要选择职业了！',
    eventType: 'milestone',
    weight: 15,
    choices: [
      { text: '考公务员', statChanges: { intelligence: 5, karma: 3, skillPoints: 2 }, followUp: '你决定考公务员，稳定生活！' },
      { text: '做程序员', statChanges: { intelligence: 8, creativity: 3, skills: { programming: 1 } as any }, followUp: '你选择了技术方向，成为程序员！' },
      { text: '从商创业', statChanges: { charm: 5, karma: 2, skillPoints: 3, skills: { entrepreneurship: 1 } as any }, followUp: '你决定创业，充满挑战的人生开始了！' },
      { text: '先找份普通工作', statChanges: { intelligence: 3, mood: 5 }, followUp: '你决定先工作，积累经验！' },
    ],
  },
  {
    id: 'career_promote_1',
    minAge: 22,
    maxAge: 60,
    cooldownYears: 4,
    condition: (stats: PlayerStats) => {
      if (!stats.career?.currentCareer || stats.career.currentLevel === 0 || stats.retired) return false;
      // 检查是否已经到达最高等级
      const careerInfo = CAREERS[stats.career.currentCareer];
      return careerInfo && stats.career.currentLevel < careerInfo.levels.length;
    },
    text: '【晋升机会】你在工作中表现不错，有机会晋升！',
    eventType: 'positive',
    weight: 8,
    choices: [
      { text: '积极争取', statChanges: { intelligence: 3, charm: 5, skillPoints: 1 }, followUp: '你积极表现，成功晋升！' },
      { text: '继续积累', statChanges: { intelligence: 2, karma: 3, mood: 3 }, followUp: '你决定再积累经验，不急于求成。' },
    ],
  },
  {
    id: 'career_bonus_1',
    minAge: 20,
    maxAge: 65,
    cooldownYears: 3,
    condition: (stats: PlayerStats) => stats.career?.currentCareer !== null && !stats.retired,
    text: '【意外收入】你在工作中有了额外收入！',
    eventType: 'positive',
    weight: 6,
    choices: [
      { text: '存起来', statChanges: { money: 30000, totalMoneyEarned: 30000, karma: 5 }, followUp: '你把奖金存了起来，理财观念不错！' },
      { text: '买东西犒劳自己', statChanges: { money: 20000, totalMoneyEarned: 20000, mood: 15 }, followUp: '你买了心仪已久的东西，很开心！' },
    ],
  },
  {
    id: 'career_challenge_1',
    minAge: 25,
    maxAge: 55,
    cooldownYears: 2,
    condition: (stats: PlayerStats) => stats.career?.currentCareer !== null && !stats.retired,
    text: '【工作挑战】你在工作中遇到了难题，需要解决！',
    choices: [
      { text: '努力攻克', statChanges: { intelligence: 8, skillPoints: 2, mood: -5 }, followUp: '你努力攻克了难题，能力提升了！' },
      { text: '求助同事', statChanges: { charm: 5, karma: 3, intelligence: 3 }, followUp: '你学会了团队合作，问题解决了！' },
    ],
  },
  // 升职事件 - 正式晋升
  {
    id: 'career_promotion',
    minAge: 20,
    maxAge: 60,
    cooldownYears: 3,
    condition: (stats: PlayerStats) => {
      if (!stats.career?.currentCareer || stats.career.currentLevel === 0 || stats.retired) return false;
      // 检查是否已经到达最高等级
      const careerInfo = CAREERS[stats.career.currentCareer];
      return careerInfo && stats.career.currentLevel < careerInfo.levels.length;
    },
    text: '【升职加薪】恭喜！你获得了升职的机会！',
    eventType: 'milestone',
    weight: 10,
    choices: [
      { text: '接受晋升，承担更大责任', statChanges: { intelligence: 5, karma: 5, charm: 3, mood: 20 }, followUp: '你成功晋升，职位和待遇都提升了！' },
      { text: '先考虑，准备好了再决定', statChanges: { intelligence: 3, mood: 10 }, followUp: '你谨慎考虑，准备充分后再行动。' },
    ],
  },
  // 工作稳定 - 公务员等
  {
    id: 'career_stable_job',
    minAge: 20,
    maxAge: 65,
    cooldownYears: 5,
    condition: (stats: PlayerStats) => (
      stats.career?.currentCareer === 'civil_servant' || 
      stats.career?.currentCareer === 'police_career' ||
      stats.career?.currentCareer === 'teacher_career' ||
      stats.career?.currentCareer === 'doctor_career'
    ),
    text: '【稳定工作】你的工作很稳定，有保障！',
    eventType: 'positive',
    weight: 8,
    choices: [
      { text: '继续稳步发展', statChanges: { mood: 15, karma: 8, intelligence: 5 }, followUp: '你在稳定的岗位上继续发展！' },
      { text: '寻找新的突破', statChanges: { intelligence: 10, creativity: 8, karma: 5 }, followUp: '你在稳定的同时也在寻找新的突破！' },
    ],
  },
  // 职业信息展示
  {
    id: 'career_info_update',
    minAge: 18,
    maxAge: 100,
    cooldownYears: 1,
    condition: (stats: PlayerStats) => stats.career?.currentCareer !== null,
    text: '【职业状态】查看一下你的职业信息吧！',
    weight: 5,
    choices: [
      { text: '了解职业详情', statChanges: { mood: 5 }, followUp: '你对自己的职业有了更清晰的认识！' },
    ],
  },
  {
    id: 'career_job_change_1',
    minAge: 28,
    maxAge: 45,
    cooldownYears: 5,
    condition: (stats: PlayerStats) => stats.career?.currentCareer !== null && !stats.retired,
    text: '【跳槽机会】有其他公司向你发出邀请！',
    choices: [
      { text: '接受新机会', statChanges: { money: 50000, totalMoneyEarned: 50000, intelligence: 5, mood: 10 }, followUp: '你换了新工作，挑战与机遇并存！' },
      { text: '留在原公司', statChanges: { karma: 5, mood: 5 }, followUp: '你决定留在熟悉的公司，稳定发展。' },
    ],
  },
  {
    id: 'career_artist_breakout',
    minAge: 20,
    maxAge: 40,
    cooldownYears: 8,
    maxOccurrences: 2,
    condition: (stats: PlayerStats) => (stats.career?.currentCareer === 'celebrity' || stats.career?.currentCareer === 'author') && !stats.retired,
    text: '【走红！】你创作的作品突然火了！',
    eventType: 'milestone',
    weight: 5,
    choices: [
      { text: '乘胜追击', statChanges: { money: 200000, totalMoneyEarned: 200000, charm: 10, luck: 5 }, followUp: '你抓住了机会，事业更上一层楼！' },
      { text: '沉淀积累', statChanges: { intelligence: 10, creativity: 15, karma: 5 }, followUp: '你选择沉淀，为长远发展做准备。' },
    ],
  },
  {
    id: 'career_programmer_project_success',
    minAge: 22,
    maxAge: 50,
    cooldownYears: 6,
    maxOccurrences: 3,
    condition: (stats: PlayerStats) => stats.career?.currentCareer === 'programmer' && !stats.retired,
    text: '【项目成功！】你负责的项目上线后大受欢迎！',
    eventType: 'milestone',
    weight: 7,
    choices: [
      { text: '申请奖金', statChanges: { money: 100000, totalMoneyEarned: 100000, mood: 10 }, followUp: '你的贡献得到了认可！' },
      { text: '技术总结分享', statChanges: { intelligence: 10, skillPoints: 3, skills: { programming: 1 } as any }, followUp: '你分享了技术经验，影响力提升！' },
    ],
  },
  {
    id: 'career_doctor_saved_life',
    minAge: 28,
    maxAge: 60,
    cooldownYears: 7,
    maxOccurrences: 3,
    condition: (stats: PlayerStats) => stats.career?.currentCareer === 'doctor_career' && !stats.retired,
    text: '【救命恩人】你成功拯救了危重病人！',
    eventType: 'milestone',
    weight: 8,
    choices: [
      { text: '继续深造', statChanges: { intelligence: 15, karma: 20, skillPoints: 5 }, followUp: '你决定继续提升医术，拯救更多人！' },
      { text: '开设专科', statChanges: { karma: 15, money: 50000, totalMoneyEarned: 50000 }, followUp: '你开设了专科门诊，帮助更多患者！' },
    ],
  },
  {
    id: 'career_entrepreneur_startup_success',
    minAge: 25,
    maxAge: 50,
    cooldownYears: 10,
    maxOccurrences: 2,
    condition: (stats: PlayerStats) => stats.career?.currentCareer === 'entrepreneur_career' && !stats.retired,
    text: '【创业成功！】你的公司融资成功！',
    eventType: 'milestone',
    weight: 6,
    choices: [
      { text: '扩大规模', statChanges: { money: 500000, totalMoneyEarned: 500000, skills: { management: 2 } as any }, followUp: '你决定扩大公司规模！' },
      { text: '稳扎稳打', statChanges: { intelligence: 8, karma: 10, skillPoints: 3 }, followUp: '你选择稳扎稳打，扎实发展。' },
    ],
  },
];

/**
 * 健康相关事件
 */
export const HEALTH_EVENTS: GameEvent[] = [
  {
    id: 'health_warning',
    minAge: 18,
    maxAge: 120,
    cooldownYears: 2,
    maxOccurrences: 8,
    condition: (stats: PlayerStats) => stats.health < 30,
    text: '【健康警告】你的健康状况不太好，医生建议你注意身体！',
    eventType: 'negative',
    weight: 20,
    choices: [
      { text: '立即就医治疗', statChanges: { money: -15000, health: 25, mood: 12, energy: 18 }, followUp: '你及时就医，身体状况明显好转！' },
      { text: '重视并好好休息', statChanges: { health: 12, mood: 8, energy: 15 }, followUp: '你听从了医生的建议，好好休息，身体有所好转。' },
      { text: '不在意，继续当前生活', statChanges: { health: -18, mood: -10, energy: -8 }, followUp: '你没有重视，健康状况继续恶化。' },
    ],
  },
  {
    id: 'health_boost_sports',
    minAge: 10,
    maxAge: 80,
    cooldownYears: 3,
    maxOccurrences: 5,
    condition: (stats: PlayerStats) => stats.health > 40 && stats.health < 85,
    text: '【运动健身】朋友约你一起去健身，你要不要一起？',
    eventType: 'positive',
    weight: 10,
    choices: [
      { text: '积极参与运动', statChanges: { health: 25, energy: 20, mood: 15, charm: 8 }, followUp: '运动让你感到神清气爽，身体更健康了！' },
      { text: '婉拒但自己多走路', statChanges: { health: 12, mood: 8, energy: 8 }, followUp: '你采取了更温和的方式，也有一些效果。' },
    ],
  },
  {
    id: 'serious_illness_check',
    minAge: 35,
    maxAge: 120,
    cooldownYears: 4,
    maxOccurrences: 6,
    condition: (stats: PlayerStats) => stats.health < 55,
    text: '【体检建议】随着年龄增长，医生建议你做一次全面体检。',
    eventType: 'negative',
    weight: 12,
    choices: [
      { text: '认真做全面检查', statChanges: { money: -25000, health: 30, mood: 15, karma: 8, energy: 12 }, followUp: '早发现早治疗，检查后你更安心了，身体也调理得不错！' },
      { text: '觉得自己没问题', statChanges: { health: -20, mood: -10, energy: -8 }, followUp: '侥幸心理让你错过了最佳调理时机，身体变差了。' },
    ],
  },
  {
    id: 'healthy_habit',
    minAge: 16,
    maxAge: 100,
    cooldownYears: 2,
    maxOccurrences: 8,
    text: '【健康生活】朋友分享了一些健康生活的小窍门。',
    eventType: 'positive',
    weight: 8,
    choices: [
      { text: '尝试健康作息和饮食', statChanges: { health: 18, energy: 15, mood: 12, karma: 5 }, followUp: '坚持健康生活让你的身心状态都更好了！' },
      { text: '听听就算了', statChanges: { mood: 3 }, followUp: '你没有尝试改变，生活照旧。' },
    ],
  },
  {
    id: 'health_midlife_checkup',
    minAge: 40,
    maxAge: 65,
    cooldownYears: 5,
    maxOccurrences: 3,
    text: '【中年体检】单位组织了全面的健康体检，你要参加吗？',
    eventType: 'positive',
    weight: 10,
    choices: [
      { text: '认真参加体检', statChanges: { money: -10000, health: 20, mood: 10, karma: 5 }, followUp: '体检发现了一些小问题，及时处理后身体更健康了！' },
      { text: '选择重点项目检查', statChanges: { money: -5000, health: 10, mood: 5 }, followUp: '做了重点检查，心里踏实多了。' },
    ],
  },
  {
    id: 'health_joint_pain',
    minAge: 45,
    maxAge: 85,
    cooldownYears: 4,
    maxOccurrences: 4,
    text: '【关节不适】最近关节有些酸痛，需要注意保养。',
    weight: 9,
    choices: [
      { text: '去看骨科医生', statChanges: { money: -8000, health: 15, karma: 3 }, followUp: '医生给了你很好的建议，关节不适缓解了。' },
      { text: '做理疗和按摩', statChanges: { money: -3000, health: 10, mood: 8 }, followUp: '理疗让你舒服了很多。' },
      { text: '注意保暖和休息', statChanges: { health: 5, mood: 3 }, followUp: '简单的保养也有帮助。' },
    ],
  },
];

// 通用生活事件（覆盖更广泛的年龄范围
const GENERAL_LIFE_EVENTS: GameEvent[] = [
  {
    id: 'life_general_1',
    minAge: 18,
    maxAge: 100,
    cooldownYears: 1,
    text: '【生活日常】生活在继续，每一天都有新的可能！',
    weight: 15,
    choices: [
      { text: '享受平静的生活', statChanges: { mood: 10 }, followUp: '平静的生活也是一种幸福！' },
      { text: '探索新的爱好', statChanges: { creativity: 8, mood: 12 }, followUp: '新的爱好让生活更有趣！' },
      { text: '联系老朋友', statChanges: { charm: 5, karma: 5, mood: 8 }, followUp: '和老朋友的联系让你感到温暖！' },
    ],
  },
  {
    id: 'life_opportunity',
    minAge: 18,
    maxAge: 100,
    cooldownYears: 2,
    text: '【小确幸】生活中总有一些小惊喜！',
    weight: 12,
    choices: [
      { text: '享受这份小确幸', statChanges: { mood: 20, luck: 5 }, followUp: '小确幸让生活更美好！' },
      { text: '记录下来', statChanges: { creativity: 10, mood: 15 }, followUp: '记录生活让你更懂得珍惜！' },
    ],
  },
  {
    id: 'life_challenge',
    minAge: 18,
    maxAge: 100,
    cooldownYears: 2,
    text: '【生活挑战】遇到了一些小挑战，但你有勇气面对！',
    weight: 10,
    choices: [
      { text: '积极应对挑战', statChanges: { intelligence: 8, karma: 5, mood: 10 }, followUp: '克服挑战让你更强大！' },
      { text: '寻求帮助', statChanges: { charm: 10, karma: 8, mood: 15 }, followUp: '寻求帮助是明智的选择！' },
    ],
  },
  {
    id: 'life_learning',
    minAge: 18,
    maxAge: 100,
    cooldownYears: 2,
    text: '【学习新事物】你对学习新事物总是保持着浓厚的兴趣！',
    weight: 10,
    choices: [
      { text: '报名课程', statChanges: { money: -20000, intelligence: 15, skillPoints: 5, creativity: 10 }, followUp: '学习新技能，提升了！' },
      { text: '自学', statChanges: { intelligence: 10, skillPoints: 3 }, followUp: '自学让你更有成就感！' },
      { text: '向朋友学习', statChanges: { charm: 8, intelligence: 5, karma: 5 }, followUp: '和朋友学习，既学了知识又加深了友谊！' },
    ],
  },
  {
    id: 'life_outdoor',
    minAge: 18,
    maxAge: 100,
    cooldownYears: 2,
    text: '【户外活动】天气不错，你想去户外走走！',
    weight: 10,
    choices: [
      { text: '去公园散步', statChanges: { health: 15, mood: 20, energy: 10 }, followUp: '大自然让你心情舒畅！' },
      { text: '去旅行', statChanges: { money: -30000, mood: 30, health: 20, creativity: 20 }, followUp: '旅行让你开阔眼界！' },
      { text: '在家附近走走', statChanges: { health: 10, mood: 15 }, followUp: '简单的户外活动也能带来好心情！' },
    ],
  },
  {
    id: 'life_family_time',
    minAge: 18,
    maxAge: 100,
    cooldownYears: 2,
    text: '【家庭时光】和家人在一起的时光总是珍贵！',
    weight: 12,
    choices: [
      { text: '好好陪伴家人', statChanges: { mood: 25, karma: 15, health: 10 }, followUp: '家庭时光让你感到温暖！' },
      { text: '给家人惊喜', statChanges: { money: -15000, mood: 30, charm: 10 }, followUp: '家人的笑容是最大的幸福！' },
    ],
  },
];

/**
 * 消费相关事件（购房、购车等）
 */
export const CONSUMPTION_EVENTS: GameEvent[] = [
  {
    id: 'buy_house_opportunity',
    minAge: 18,
    maxAge: 60,
    cooldownYears: 10,
    maxOccurrences: 1,
    condition: (stats) => stats.money >= 20000 && stats.houseLevel < 4,
    text: '【购房机会】你遇到了一个很好的购房机会！',
    eventType: 'positive',
    weight: 8,
    choices: [
      { 
        text: '买房', 
        statChanges: (stats) => {
          if (stats.houseLevel === 0 && stats.money >= 2000) return { money: -2000, houseLevel: 1, mood: 15, karma: 5 };
          if (stats.houseLevel === 1 && stats.money >= 20000) return { money: -20000, houseLevel: 2, mood: 20, karma: 5 };
          if (stats.houseLevel === 2 && stats.money >= 100000) return { money: -100000, houseLevel: 3, mood: 25, karma: 8 };
          if (stats.houseLevel === 3 && stats.money >= 500000) return { money: -500000, houseLevel: 4, mood: 30, karma: 10 };
          return {};
        }, 
        followUp: '你买到了心仪的房子！' 
      },
      { text: '再等等', statChanges: { mood: 5 }, followUp: '你决定再观望一下。' },
    ],
  },
  {
    id: 'buy_car_opportunity',
    minAge: 18,
    maxAge: 60,
    cooldownYears: 8,
    maxOccurrences: 1,
    condition: (stats) => stats.money >= 10000 && stats.carLevel < 3,
    text: '【购车机会】你看到了一款很喜欢的车！',
    eventType: 'positive',
    weight: 7,
    choices: [
      { 
        text: '买车', 
        statChanges: (stats) => {
          if (stats.carLevel === 0 && stats.money >= 10000) return { money: -10000, carLevel: 1, mood: 15, charm: 5 };
          if (stats.carLevel === 1 && stats.money >= 50000) return { money: -50000, carLevel: 2, mood: 20, charm: 8 };
          if (stats.carLevel === 2 && stats.money >= 200000) return { money: -200000, carLevel: 3, mood: 25, charm: 15 };
          return {};
        }, 
        followUp: '你开上了新车！' 
      },
      { text: '不买', statChanges: { mood: 3 }, followUp: '你觉得现在不需要买车。' },
    ],
  },
];

/**
 * 未成年时期专属事件（6-17岁）
 */
export const TEEN_EVENTS: GameEvent[] = [
  {
    id: 'teen_make_friends',
    minAge: 6,
    maxAge: 12,
    cooldownYears: 2,
    maxOccurrences: 3,
    text: '【交朋友】你在学校里遇到了新朋友！',
    eventType: 'positive',
    weight: 12,
    choices: [
      { text: '主动交流', statChanges: { charm: 5, mood: 10, karma: 3 }, followUp: '你和新朋友很快就熟络了！' },
      { text: '观察一下', statChanges: { intelligence: 3, mood: 5 }, followUp: '你先观察，慢慢熟悉。' },
    ],
  },
  {
    id: 'teen_sports_activity',
    minAge: 8,
    maxAge: 18,
    cooldownYears: 2,
    maxOccurrences: 4,
    text: '【体育运动】学校要举办运动会，你想参加吗？',
    eventType: 'positive',
    weight: 10,
    choices: [
      { text: '报名参加', statChanges: { health: 10, energy: 5, charm: 3, skills: { fitness: 1 } as any }, followUp: '你在运动中收获了快乐和健康！' },
      { text: '当观众', statChanges: { mood: 5, karma: 2 }, followUp: '你为同学们加油助威！' },
    ],
  },
  {
    id: 'teen_art_class',
    minAge: 7,
    maxAge: 16,
    cooldownYears: 3,
    maxOccurrences: 2,
    text: '【艺术课】你对艺术很感兴趣，想报兴趣班吗？',
    eventType: 'positive',
    weight: 8,
    choices: [
      { text: '学画画', statChanges: { creativity: 8, skills: { painting: 1 } as any, mood: 10 }, followUp: '你在绘画中展现了天赋！' },
      { text: '学音乐', statChanges: { creativity: 6, skills: { music: 1 } as any, mood: 12 }, followUp: '你爱上了音乐！' },
      { text: '不学', statChanges: { mood: 3 }, followUp: '你对艺术不太感兴趣。' },
    ],
  },
  {
    id: 'teen_homework_challenge',
    minAge: 8,
    maxAge: 18,
    cooldownYears: 1,
    maxOccurrences: 8,
    text: '【作业挑战】作业有点难，你要认真完成吗？',
    weight: 12,
    choices: [
      { text: '认真钻研', statChanges: { intelligence: 8, energy: -5, skillPoints: 1 }, followUp: '你攻克了难题，学到了很多！' },
      { text: '草草了事', statChanges: { intelligence: 2, mood: 5 }, followUp: '作业完成了，但没有学到太多。' },
    ],
  },
  {
    id: 'teen_first_crush',
    minAge: 12,
    maxAge: 17,
    maxOccurrences: 1,
    text: '【懵懂情愫】你对某个同学有了好感...',
    weight: 9,
    choices: [
      { text: '默默关注', statChanges: { creativity: 5, mood: 8, charm: 3 }, followUp: '青涩的感觉很美好。' },
      { text: '专心学习', statChanges: { intelligence: 5, karma: 5 }, followUp: '你把重心放在了学业上。' },
    ],
  },
  {
    id: 'teen_hobby_coding',
    minAge: 12,
    maxAge: 18,
    cooldownYears: 3,
    maxOccurrences: 2,
    text: '【编程兴趣】你对编程产生了兴趣！',
    eventType: 'positive',
    weight: 7,
    choices: [
      { text: '学习编程', statChanges: { intelligence: 10, creativity: 5, skills: { programming: 1 } as any, skillPoints: 2 }, followUp: '你开始学习编程，打开了新世界的大门！' },
      { text: '以后再说', statChanges: { intelligence: 2 }, followUp: '你决定以后再学。' },
    ],
  },
  {
    id: 'teen_reading_club',
    minAge: 9,
    maxAge: 16,
    cooldownYears: 2,
    maxOccurrences: 3,
    text: '【读书俱乐部】朋友邀请你加入读书俱乐部！',
    eventType: 'positive',
    weight: 9,
    choices: [
      { text: '加入', statChanges: { intelligence: 8, creativity: 6, skills: { academics: 1 } as any, mood: 10 }, followUp: '你在书海中遨游！' },
      { text: '不去', statChanges: { mood: 3 }, followUp: '你更喜欢一个人看书。' },
    ],
  },
  {
    id: 'teen_volunteer_work',
    minAge: 14,
    maxAge: 18,
    cooldownYears: 2,
    maxOccurrences: 3,
    text: '【志愿活动】社区招募志愿者，你想参加吗？',
    eventType: 'positive',
    weight: 8,
    choices: [
      { text: '积极参加', statChanges: { karma: 12, charm: 5, mood: 8 }, followUp: '帮助别人让你感到很快乐！' },
      { text: '没有时间', statChanges: { mood: 3 }, followUp: '你专注于学业。' },
    ],
  },
  {
    id: 'teen_pet_request',
    minAge: 8,
    maxAge: 16,
    maxOccurrences: 1,
    text: '【养宠物】你想养一只宠物！',
    weight: 10,
    choices: [
      { text: '向父母请求', statChanges: { charm: 5, mood: 10, karma: 8, health: 5 }, followUp: '父母同意了！有宠物陪伴的生活很开心！' },
      { text: '等长大再说', statChanges: { intelligence: 3, karma: 3 }, followUp: '你决定等自己有能力了再养。' },
    ],
  },
  {
    id: 'teen_skill_competition',
    minAge: 10,
    maxAge: 18,
    cooldownYears: 2,
    maxOccurrences: 2,
    text: '【技能竞赛】有一个技能竞赛，你想参加吗？',
    eventType: 'positive',
    weight: 9,
    choices: [
      { text: '积极准备', statChanges: { intelligence: 12, skillPoints: 2, mood: 15, karma: 5 }, followUp: '你在竞赛中获得了好成绩！' },
      { text: '不参加', statChanges: { mood: 3 }, followUp: '你对比赛不太感兴趣。' },
    ],
  },
];

/**
 * 后期事件（50岁以上）
 */
export const LATE_GAME_EVENTS: GameEvent[] = [
  {
    id: 'late_game_grandchildren',
    minAge: 50,
    maxAge: 75,
    cooldownYears: 5,
    maxOccurrences: 3,
    condition: (stats: PlayerStats) => stats.isMarried && stats.children && stats.children.length > 0,
    text: '【含饴弄孙】你的孩子有了自己的孩子！',
    eventType: 'positive',
    weight: 8,
    choices: [
      { text: '帮忙照顾', statChanges: { mood: 20, karma: 10, health: 5 }, followUp: '你享受着天伦之乐，心情愉悦！' },
      { text: '提供支持即可', statChanges: { mood: 10, money: -20000, karma: 5 }, followUp: '你用自己的方式支持着晚辈。' },
    ],
  },
  {
    id: 'late_game_hobby',
    minAge: 55,
    maxAge: 80,
    cooldownYears: 4,
    maxOccurrences: 2,
    text: '【新爱好】你发现了一项新的爱好！',
    eventType: 'positive',
    weight: 9,
    choices: [
      { text: '学书法/绘画', statChanges: { creativity: 15, mood: 15, health: 8 }, followUp: '艺术让你的晚年生活丰富多彩！' },
      { text: '学习园艺', statChanges: { health: 15, mood: 10, creativity: 5 }, followUp: '种植让你感到身心放松！' },
      { text: '学钓鱼', statChanges: { mood: 12, health: 10, luck: 3 }, followUp: '钓鱼让你学会了耐心和等待！' },
    ],
  },
  {
    id: 'late_game_legacy',
    minAge: 60,
    maxAge: 85,
    maxOccurrences: 1,
    text: '【传承】你想要留下点什么给这个世界？',
    eventType: 'milestone',
    weight: 5,
    choices: [
      { text: '写回忆录', statChanges: { creativity: 20, intelligence: 10, karma: 15 }, followUp: '你的人生经历将激励后人！' },
      { text: '做慈善', statChanges: { money: -100000, karma: 30, mood: 20 }, followUp: '你的善举帮助了很多人！' },
      { text: '培养晚辈', statChanges: { charm: 10, karma: 20, intelligence: 10 }, followUp: '你把自己的经验传授给了年轻人！' },
    ],
  },
  {
    id: 'late_game_reunion',
    minAge: 55,
    maxAge: 80,
    cooldownYears: 6,
    maxOccurrences: 2,
    text: '【老友重逢】你遇到了多年未见的老朋友！',
    eventType: 'positive',
    weight: 6,
    choices: [
      { text: '叙旧畅谈', statChanges: { mood: 25, charm: 10, karma: 5 }, followUp: '你们聊了很多往事，非常开心！' },
      { text: '组织同学会', statChanges: { mood: 20, charm: 15, money: -10000 }, followUp: '大家聚在一起，重温青春岁月！' },
    ],
  },
  {
    id: 'late_game_health_check',
    minAge: 50,
    maxAge: 90,
    cooldownYears: 3,
    maxOccurrences: 5,
    text: '【体检】医生建议你做一次全面体检。',
    choices: [
      { text: '认真检查', statChanges: { money: -15000, health: 15, karma: 5 }, followUp: '早发现早治疗，你更加健康了！' },
      { text: '觉得没问题', statChanges: { health: -10, mood: 5 }, followUp: '侥幸心理让你错过了最佳调理时机。' },
    ],
  },
  {
    id: 'late_game_travel',
    minAge: 55,
    maxAge: 75,
    cooldownYears: 4,
    maxOccurrences: 2,
    condition: (stats: PlayerStats) => stats.money > 50000,
    text: '【环游世界】现在时间自由了，你想去旅行！',
    eventType: 'positive',
    weight: 7,
    choices: [
      { text: '国内游', statChanges: { money: -30000, mood: 20, health: 10, creativity: 10 }, followUp: '祖国的大好河山让你心旷神怡！' },
      { text: '出国游', statChanges: { money: -80000, mood: 25, intelligence: 10, creativity: 15 }, followUp: '异国风情开阔了你的眼界！' },
      { text: '在家附近转转', statChanges: { mood: 10, health: 5, karma: 3 }, followUp: '身边的风景也很美！' },
    ],
  },
  {
    id: 'late_game_volunteer',
    minAge: 55,
    maxAge: 80,
    cooldownYears: 2,
    maxOccurrences: 4,
    text: '【志愿活动】社区在招募志愿者，你想参加吗？',
    eventType: 'positive',
    weight: 6,
    choices: [
      { text: '积极参与', statChanges: { karma: 25, mood: 15, health: 8, charm: 8 }, followUp: '帮助别人让你感到非常充实！' },
      { text: '捐点物资', statChanges: { money: -10000, karma: 15, mood: 8 }, followUp: '你用自己的方式贡献着力量！' },
    ],
  },
  {
    id: 'late_game_grandchildren_birth',
    minAge: 52,
    maxAge: 75,
    cooldownYears: 6,
    maxOccurrences: 3,
    condition: (stats: PlayerStats) => stats.isMarried && stats.children && stats.children.length > 0,
    text: '【孙辈出生】你的孩子有了小宝宝！',
    eventType: 'milestone',
    weight: 9,
    choices: [
      { text: '帮忙照顾', statChanges: { mood: 25, karma: 15, health: 5 }, followUp: '含饴弄孙，享受天伦之乐！' },
      { text: '提供物质支持', statChanges: { money: -30000, mood: 15, karma: 10 }, followUp: '你用自己的方式表达了关爱。' },
    ],
  },
  {
    id: 'late_game_old_friends',
    minAge: 58,
    maxAge: 85,
    cooldownYears: 5,
    maxOccurrences: 2,
    text: '【老友记】你收到了一封老同学聚会的邀请函。',
    eventType: 'positive',
    weight: 8,
    choices: [
      { text: '兴奋参加', statChanges: { mood: 30, charm: 15, creativity: 10 }, followUp: '见到老朋友，回忆了很多美好时光！' },
      { text: '视频连线', statChanges: { mood: 15, charm: 5 }, followUp: '虽然没去现场，但也聊得很开心。' },
    ],
  },
  {
    id: 'late_game_legacy_project',
    minAge: 62,
    maxAge: 80,
    cooldownYears: 8,
    maxOccurrences: 1,
    text: '【留下印记】你想做一件有意义的事，为这个世界留下点什么。',
    eventType: 'milestone',
    weight: 7,
    choices: [
      { text: '写一本回忆录', statChanges: { creativity: 25, intelligence: 15, karma: 20 }, followUp: '你的人生经历将激励后人！' },
      { text: '植树造林', statChanges: { health: 15, karma: 30, mood: 20 }, followUp: '种下的树苗会茁壮成长，造福后代！' },
      { text: '资助贫困学生', statChanges: { money: -80000, karma: 35, mood: 25 }, followUp: '你的善举改变了孩子们的命运！' },
    ],
  },
  {
    id: 'late_game_simplify_life',
    minAge: 55,
    maxAge: 75,
    cooldownYears: 7,
    maxOccurrences: 2,
    text: '【断舍离】你觉得家里东西太多了，想要简化生活。',
    weight: 6,
    choices: [
      { text: '彻底整理捐赠', statChanges: { money: 10000, karma: 20, mood: 15, creativity: 10 }, followUp: '简化后生活更轻松了！' },
      { text: '慢慢整理', statChanges: { karma: 10, mood: 8 }, followUp: '整理过程中回忆了很多往事。' },
    ],
  },
];

/**
 * 中年阶段事件（30-60岁）
 */
export const MID_GAME_EVENTS: GameEvent[] = [
  // 职业转型相关事件（30-50岁）
  {
    id: 'mid_career_tech_transition',
    minAge: 30,
    maxAge: 45,
    cooldownYears: 5,
    maxOccurrences: 1,
    condition: (stats: PlayerStats) => stats.career?.currentCareer !== null && !stats.retired,
    text: '【职业转型】AI技术发展迅速，朋友建议你学习新技能转型！',
    eventType: 'milestone',
    weight: 9,
    choices: [
      { text: '报名学习编程', statChanges: { money: -30000, intelligence: 15, skillPoints: 5, skills: { programming: 1 } as any }, followUp: '你开始学习新技术，为未来做准备！' },
      { text: '学习数据科学', statChanges: { money: -25000, intelligence: 12, creativity: 8, skillPoints: 4 }, followUp: '数据科学让你的职业更有竞争力！' },
      { text: '维持现状', statChanges: { mood: 5, karma: 2 }, followUp: '你决定先观望，不急于改变。' },
    ],
  },
  {
    id: 'mid_career_side_project',
    minAge: 32,
    maxAge: 50,
    cooldownYears: 4,
    maxOccurrences: 2,
    condition: (stats: PlayerStats) => stats.career?.currentCareer !== null && !stats.retired,
    text: '【副业机会】朋友邀请你一起做个副业项目！',
    weight: 8,
    choices: [
      { text: '积极参与', statChanges: { money: 50000, totalMoneyEarned: 50000, creativity: 10, skillPoints: 3 }, followUp: '副业做得不错，增加了收入！' },
      { text: '尝试但不投入太多', statChanges: { money: 10000, totalMoneyEarned: 10000, creativity: 5 }, followUp: '小有收获，也没有影响主业。' },
      { text: '婉拒邀请', statChanges: { mood: 3, karma: 2 }, followUp: '你觉得现在精力不够，婉拒了。' },
    ],
  },
  {
    id: 'mid_career_management_track',
    minAge: 35,
    maxAge: 50,
    cooldownYears: 6,
    maxOccurrences: 2,
    condition: (stats: PlayerStats) => stats.career?.currentCareer !== null && !stats.retired,
    text: '【管理路线】公司问你是否愿意转向管理岗位！',
    eventType: 'milestone',
    weight: 8,
    choices: [
      { text: '接受管理岗位', statChanges: { charm: 15, karma: 10, skillPoints: 4, skills: { management: 1 } as any }, followUp: '你开始学习管理，职业更上一层楼！' },
      { text: '继续做技术专家', statChanges: { intelligence: 12, karma: 8, skillPoints: 3 }, followUp: '你决定深耕技术，成为领域专家。' },
    ],
  },
  {
    id: 'mid_career_startup_offer',
    minAge: 33,
    maxAge: 48,
    cooldownYears: 7,
    maxOccurrences: 2,
    condition: (stats: PlayerStats) => stats.career?.currentCareer !== null && !stats.retired,
    text: '【创业邀请】前同事邀请你加入他的创业公司！',
    weight: 5,
    choices: [
      { text: '加入创业团队', statChanges: { money: -50000, charm: 20, luck: 10, skillPoints: 5 }, followUp: '高风险高回报，你接受了挑战！' },
      { text: '小额投资', statChanges: { money: -30000, karma: 5, luck: 5 }, followUp: '你选择投资支持，不直接参与。' },
      { text: '婉拒', statChanges: { mood: 5, karma: 3 }, followUp: '你觉得现在不太合适，婉拒了。' },
    ],
  },
  
  // 中年危机主题事件（35-55岁）
  {
    id: 'mid_crisis_purpose',
    minAge: 38,
    maxAge: 52,
    cooldownYears: 8,
    maxOccurrences: 1,
    text: '【意义探索】你开始思考人生的意义，感觉有些迷茫...',
    eventType: 'negative',
    weight: 6,
    choices: [
      { text: '探索新的兴趣爱好', statChanges: { creativity: 15, mood: 10, health: 8 }, followUp: '新爱好让你重新找到了生活的热情！' },
      { text: '和朋友家人交流', statChanges: { charm: 12, mood: 12, karma: 8 }, followUp: '倾诉让你感到轻松，获得了支持！' },
      { text: '去旅行散心', statChanges: { money: -40000, mood: 20, creativity: 10, health: 5 }, followUp: '旅行让你开阔了眼界，心情好了很多！' },
    ],
  },
  {
    id: 'mid_crisis_appearance',
    minAge: 35,
    maxAge: 50,
    cooldownYears: 5,
    maxOccurrences: 2,
    text: '【容貌焦虑】你发现自己出现了白发和皱纹，有些焦虑...',
    weight: 7,
    choices: [
      { text: '接受自然变化', statChanges: { mood: 15, karma: 10, intelligence: 5 }, followUp: '你学会了与岁月和解，心态更加成熟！' },
      { text: '注重保养和运动', statChanges: { money: -20000, health: 15, charm: 10, mood: 8 }, followUp: '运动和保养让你状态更好了！' },
      { text: '尝试医美', statChanges: { money: -80000, charm: 15, mood: 5 }, followUp: '外表有所改善，但你意识到内在更重要。' },
    ],
  },
  {
    id: 'mid_crisis_reconnect',
    minAge: 40,
    maxAge: 55,
    cooldownYears: 6,
    maxOccurrences: 1,
    text: '【重新连接】你想重新联系那些失去联系的老朋友！',
    eventType: 'positive',
    weight: 5,
    choices: [
      { text: '主动联系', statChanges: { charm: 15, mood: 20, karma: 10 }, followUp: '重新联系上老朋友，非常开心！' },
      { text: '组织聚会', statChanges: { money: -15000, charm: 20, mood: 25, karma: 8 }, followUp: '大家聚在一起，重温了美好时光！' },
    ],
  },
  
  // 家庭关系事件（30-60岁）
  {
    id: 'mid_family_child_education',
    minAge: 35,
    maxAge: 55,
    cooldownYears: 3,
    maxOccurrences: 3,
    condition: (stats: PlayerStats) => stats.isMarried && stats.children && stats.children.length > 0,
    text: '【子女教育】孩子的教育问题让你有些头疼！',
    weight: 8,
    choices: [
      { text: '报各种培训班', statChanges: { money: -50000, intelligence: 5, mood: -5, karma: 5 }, followUp: '孩子压力很大，但成绩确实有所提升。' },
      { text: '注重全面发展', statChanges: { money: -30000, creativity: 10, mood: 10, karma: 8 }, followUp: '孩子快乐成长，综合素质提升！' },
      { text: '让孩子自由发展', statChanges: { mood: 8, karma: 5, creativity: 8 }, followUp: '孩子有更多自由空间，也很开心。' },
    ],
  },
  {
    id: 'mid_family_parents_health',
    minAge: 40,
    maxAge: 60,
    cooldownYears: 4,
    maxOccurrences: 3,
    text: '【父母健康】父母年纪大了，身体状况需要关注！',
    weight: 9,
    choices: [
      { text: '定期带父母体检', statChanges: { money: -30000, health: 10, karma: 20, mood: 5 }, followUp: '父母健康得到保障，你也更安心！' },
      { text: '接父母一起住', statChanges: { money: -20000, karma: 25, mood: 15, charm: 5 }, followUp: '一家人在一起，互相有个照应！' },
      { text: '请保姆照顾', statChanges: { money: -40000, karma: 15, mood: 10 }, followUp: '父母得到了照顾，你也能安心工作。' },
    ],
  },
  {
    id: 'mid_family_relationship_renewal',
    minAge: 35,
    maxAge: 55,
    cooldownYears: 5,
    maxOccurrences: 2,
    condition: (stats: PlayerStats) => stats.isMarried,
    text: '【婚姻保鲜】你和伴侣的关系有些平淡，需要一些新意！',
    weight: 7,
    choices: [
      { text: '一起去旅行', statChanges: { money: -40000, mood: 25, charm: 15, karma: 10 }, followUp: '旅行让你们找回了热恋的感觉！' },
      { text: '重拾共同爱好', statChanges: { creativity: 10, mood: 20, karma: 12, health: 5 }, followUp: '一起做喜欢的事情，感情升温！' },
      { text: '认真沟通谈心', statChanges: { charm: 18, mood: 15, karma: 15 }, followUp: '深入的沟通让你们更理解彼此！' },
    ],
  },
  {
    id: 'mid_family_sibling_support',
    minAge: 32,
    maxAge: 58,
    cooldownYears: 6,
    maxOccurrences: 2,
    text: '【手足情深】兄弟姐妹遇到了困难，需要帮助！',
    weight: 6,
    choices: [
      { text: '经济支持', statChanges: { money: -50000, karma: 25, mood: 10 }, followUp: '你的帮助让兄弟姐妹渡过了难关！' },
      { text: '出谋划策', statChanges: { intelligence: 10, karma: 20, charm: 8 }, followUp: '你的建议很有帮助！' },
      { text: '精神支持陪伴', statChanges: { charm: 12, karma: 18, mood: 8 }, followUp: '陪伴是最好的支持！' },
    ],
  },
  
  // 财务规划事件（30-60岁）
  {
    id: 'mid_finance_home_purchase',
    minAge: 30,
    maxAge: 45,
    maxOccurrences: 1,
    condition: (stats: PlayerStats) => stats.money > 200000,
    text: '【购房计划】你在考虑是否要买房！',
    eventType: 'milestone',
    weight: 10,
    choices: [
      { text: '贷款买房', statChanges: { money: -300000, mood: 10, karma: 5, luck: 5 }, followUp: '你有了自己的家，虽然有压力但很安心！' },
      { text: '继续租房', statChanges: { mood: 5, money: 50000, totalMoneyEarned: 50000 }, followUp: '你觉得租房更灵活，压力也小。' },
    ],
  },
  {
    id: 'mid_finance_investment',
    minAge: 32,
    maxAge: 55,
    cooldownYears: 3,
    maxOccurrences: 3,
    condition: (stats: PlayerStats) => stats.money > 100000,
    text: '【投资理财】朋友向你推荐了一些投资机会！',
    weight: 8,
    choices: [
      { text: '稳健投资（基金/债券）', statChanges: { money: 30000, totalMoneyEarned: 30000, intelligence: 5, karma: 3 }, followUp: '稳健投资让你的资产稳步增长！' },
      { text: '激进投资（股票）', statChanges: { money: 80000, totalMoneyEarned: 80000, luck: 8, mood: 5 }, followUp: '高风险高回报，你运气不错！' },
      { text: '投资自己学习', statChanges: { money: -40000, intelligence: 15, skillPoints: 5, creativity: 5 }, followUp: '投资自己是最有价值的投资！' },
    ],
  },
  {
    id: 'mid_finance_retirement_plan',
    minAge: 40,
    maxAge: 55,
    cooldownYears: 5,
    maxOccurrences: 2,
    text: '【养老规划】你开始考虑退休后的生活！',
    eventType: 'milestone',
    weight: 7,
    choices: [
      { text: '购买商业养老保险', statChanges: { money: -100000, karma: 10, mood: 8, luck: 5 }, followUp: '提前规划，让退休生活更有保障！' },
      { text: '增加储蓄', statChanges: { money: -50000, intelligence: 8, karma: 5, mood: 5 }, followUp: '多存点钱，心里更踏实！' },
      { text: '学习理财知识', statChanges: { intelligence: 12, skillPoints: 3, karma: 3 }, followUp: '知识就是财富，你学会了更好地理财！' },
    ],
  },
  {
    id: 'mid_finance_debt_management',
    minAge: 35,
    maxAge: 50,
    cooldownYears: 4,
    maxOccurrences: 2,
    text: '【债务管理】你有一些债务需要规划偿还！',
    weight: 6,
    choices: [
      { text: '制定还款计划', statChanges: { intelligence: 10, karma: 10, mood: 5 }, followUp: '有计划地还款，压力慢慢减轻！' },
      { text: '先还高息债务', statChanges: { money: -20000, intelligence: 8, karma: 5 }, followUp: '明智的选择，节省了利息！' },
      { text: '增加收入渠道', statChanges: { money: 30000, totalMoneyEarned: 30000, skillPoints: 2, creativity: 5 }, followUp: '开源节流，债务很快还清了！' },
    ],
  },
  
  // 健康管理事件（30-60岁）
  {
    id: 'mid_health_fitness_routine',
    minAge: 30,
    maxAge: 55,
    cooldownYears: 4,
    maxOccurrences: 2,
    text: '【健身习惯】你发现自己体能下降，需要开始运动！',
    eventType: 'positive',
    weight: 9,
    choices: [
      { text: '办健身卡', statChanges: { money: -15000, health: 25, energy: 20, charm: 10, mood: 10 }, followUp: '坚持健身让你身体状态焕然一新！' },
      { text: '每天跑步/快走', statChanges: { health: 20, energy: 15, mood: 8 }, followUp: '简单的运动也能带来很好的效果！' },
      { text: '学习瑜伽/太极', statChanges: { health: 18, mood: 15, creativity: 8, karma: 5 }, followUp: '身心都得到了放松和锻炼！' },
    ],
  },
  {
    id: 'mid_health_diet_change',
    minAge: 35,
    maxAge: 58,
    cooldownYears: 3,
    maxOccurrences: 2,
    text: '【饮食调整】体检发现一些指标不太好，需要注意饮食！',
    weight: 8,
    choices: [
      { text: '健康饮食', statChanges: { health: 20, energy: 15, mood: 10, karma: 5 }, followUp: '健康饮食让你身体状况明显改善！' },
      { text: '找营养师咨询', statChanges: { money: -10000, health: 25, intelligence: 5, mood: 8 }, followUp: '专业指导让效果更好！' },
      { text: '控制饮食量', statChanges: { health: 15, mood: 5, charm: 8 }, followUp: '适量饮食也有帮助！' },
    ],
  },
  {
    id: 'mid_health_sleep_improvement',
    minAge: 38,
    maxAge: 55,
    cooldownYears: 4,
    maxOccurrences: 2,
    text: '【睡眠改善】你最近睡眠质量不太好！',
    weight: 7,
    choices: [
      { text: '调整作息', statChanges: { health: 15, energy: 20, mood: 12, intelligence: 5 }, followUp: '规律作息让你精神焕发！' },
      { text: '改善睡眠环境', statChanges: { money: -20000, health: 18, mood: 10, energy: 15 }, followUp: '好的环境带来好的睡眠！' },
      { text: '睡前放松冥想', statChanges: { health: 12, mood: 15, creativity: 8, karma: 5 }, followUp: '冥想让你身心放松，睡得更香！' },
    ],
  },
  
  // 社交和兴趣培养事件（30-60岁）
  {
    id: 'mid_social_club_join',
    minAge: 32,
    maxAge: 55,
    cooldownYears: 4,
    maxOccurrences: 2,
    text: '【兴趣社团】你想加入一些兴趣社团认识新朋友！',
    eventType: 'positive',
    weight: 8,
    choices: [
      { text: '读书俱乐部', statChanges: { intelligence: 15, creativity: 10, charm: 8, mood: 12 }, followUp: '读书让你视野开阔，也认识了志同道合的朋友！' },
      { text: '运动俱乐部', statChanges: { health: 20, charm: 12, mood: 15, energy: 10 }, followUp: '运动交友，身体和社交双丰收！' },
      { text: '艺术爱好班', statChanges: { creativity: 20, mood: 15, charm: 10, intelligence: 5 }, followUp: '艺术让生活更加丰富多彩！' },
    ],
  },
  {
    id: 'mid_social_mentor',
    minAge: 35,
    maxAge: 50,
    cooldownYears: 5,
    maxOccurrences: 2,
    text: '【导师角色】有人想拜你为师，学习你的经验！',
    eventType: 'positive',
    weight: 6,
    choices: [
      { text: '认真带徒弟', statChanges: { charm: 20, karma: 25, intelligence: 10, mood: 15 }, followUp: '传承经验，帮助别人让你很有成就感！' },
      { text: '偶尔指导', statChanges: { charm: 10, karma: 15, mood: 8 }, followUp: '你会定期给一些建议和帮助。' },
    ],
  },
  {
    id: 'mid_hobby_new_skill',
    minAge: 30,
    maxAge: 55,
    cooldownYears: 3,
    maxOccurrences: 3,
    text: '【新技能学习】你想学一项新技能丰富生活！',
    eventType: 'positive',
    weight: 9,
    choices: [
      { text: '学一门乐器', statChanges: { creativity: 20, mood: 18, intelligence: 8, charm: 5 }, followUp: '音乐让你的生活充满艺术气息！' },
      { text: '学摄影', statChanges: { creativity: 18, mood: 15, charm: 8, money: -25000 }, followUp: '你学会了用镜头记录美好！' },
      { text: '学烹饪', statChanges: { creativity: 15, mood: 12, health: 5, karma: 8 }, followUp: '美食让生活更有滋味！' },
      { text: '学外语', statChanges: { intelligence: 20, creativity: 10, charm: 8, skillPoints: 4 }, followUp: '新语言打开了新世界的大门！' },
    ],
  },
  {
    id: 'mid_family_reunion',
    minAge: 35,
    maxAge: 60,
    cooldownYears: 5,
    maxOccurrences: 3,
    text: '【家庭聚会】亲戚们提议组织一次大型家庭聚会。',
    weight: 8,
    choices: [
      { text: '积极组织', statChanges: { money: -20000, charm: 15, karma: 10, mood: 20 }, followUp: '聚会非常成功，增进了家人感情！' },
      { text: '参与但不组织', statChanges: { money: -5000, charm: 5, mood: 10 }, followUp: '大家在一起很开心。' },
    ],
  },
  {
    id: 'mid_career_mentor',
    minAge: 40,
    maxAge: 55,
    cooldownYears: 4,
    maxOccurrences: 2,
    condition: (stats: PlayerStats) => stats.career?.currentCareer !== null && !stats.retired,
    text: '【职场导师】有年轻人想向你请教职场经验。',
    eventType: 'positive',
    weight: 7,
    choices: [
      { text: '悉心指导', statChanges: { karma: 20, charm: 12, mood: 15 }, followUp: '帮助他人让你很有成就感！' },
      { text: '偶尔分享经验', statChanges: { karma: 10, charm: 5, mood: 8 }, followUp: '你分享了一些有用的经验。' },
    ],
  },
  {
    id: 'mid_finance_estate_plan',
    minAge: 45,
    maxAge: 60,
    cooldownYears: 6,
    maxOccurrences: 2,
    text: '【财产规划】你开始考虑如何规划和传承自己的财产。',
    weight: 6,
    choices: [
      { text: '咨询专业人士', statChanges: { money: -15000, intelligence: 10, karma: 5 }, followUp: '专业规划让你更安心了。' },
      { text: '和家人商量', statChanges: { charm: 10, karma: 8, mood: 5 }, followUp: '家人沟通后有了初步想法。' },
    ],
  },
];

/**
 * 基础事件库
 */

export const BASE_EVENTS: GameEvent[] = [
  ...HEALTH_EVENTS,
  ...CONSUMPTION_EVENTS,
  ...TEEN_EVENTS,
  ...GENERAL_LIFE_EVENTS,
  {
    id: 'infant_1',
    minAge: 0,
    maxAge: 0,
    maxOccurrences: 1,
    text: '【出生】你刚来到这个世界，响亮地啼哭！',
    eventType: 'milestone',
    weight: 10,
    choices: [
      { text: '大声哭闹', statChanges: { mood: -5, health: 2 }, followUp: '你用哭声宣告了自己的存在。' },
      { text: '安静观察', statChanges: { intelligence: 2, mood: 5 }, followUp: '你好奇地观察着这个新世界。' },
    ],
  },
  {
    id: 'infant_2',
    minAge: 1,
    maxAge: 1,
    maxOccurrences: 1,
    text: '你一岁了，开始牙牙学语。',
    eventType: 'milestone',
    weight: 10,
    choices: [
      { text: '先叫"妈妈"', statChanges: { charm: 5, mood: 8, karma: 5, health: 2 }, followUp: '妈妈很开心，全家都乐了。' },
      { text: '先叫"爸爸"', statChanges: { intelligence: 4, mood: 6, karma: 3 }, followUp: '爸爸激动地抱起了你。' },
    ],
  },
  {
    id: 'infant_3',
    minAge: 2,
    maxAge: 2,
    maxOccurrences: 1,
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
    maxOccurrences: 1,
    text: '你总是问"为什么"，让大人有些头疼。',
    choices: [
      { text: '继续发问', statChanges: { intelligence: 5, creativity: 3 }, followUp: '你的好奇心得到了满足！' },
      { text: '自己看书', statChanges: { intelligence: 4, creativity: 2, karma: 3 }, followUp: '你在书中寻找答案。' },
    ],
  },
  {
    id: 'infant_5',
    minAge: 4,
    maxAge: 4,
    maxOccurrences: 1,
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
    maxOccurrences: 1,
    text: '你要上幼儿园了！',
    eventType: 'milestone',
    choices: [
      { text: '开心入园', statChanges: { charm: 5, mood: 8, intelligence: 2 }, followUp: '你很快就适应了幼儿园！' },
      { text: '哭闹不想去', statChanges: { mood: -5, charm: -2, health: 2 }, followUp: '你舍不得家人，但慢慢适应了。' },
    ],
  },
  
  // 事件链相关事件 - 注意：这些事件不应该在正常剧情中出现
  // 它们只由事件链系统在特定条件下触发
  // ...Object.values(EVENT_CHAIN_EVENTS) as GameEvent[],
  // 教育系统相关事件
  ...EDUCATION_EVENTS as GameEvent[],
  // 退休系统相关事件
  ...RETIREMENT_EVENTS as GameEvent[],
  // 职业系统相关事件
  ...CAREER_EVENTS as GameEvent[],
  // 中年阶段事件
  ...MID_GAME_EVENTS as GameEvent[],
  // 后期事件
  ...LATE_GAME_EVENTS as GameEvent[],
];

export const getEventLibrary = (_familyTier?: FamilyTier | null): GameEvent[] => {
  // 这里可以根据家族背景添加专属事件
  let events = [...BASE_EVENTS];
  
  // 未来扩展：根据家族职业添加特定事件
  return events;
};

export default getEventLibrary;
