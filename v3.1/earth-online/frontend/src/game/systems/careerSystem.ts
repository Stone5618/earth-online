import type { PlayerStats, CareerType, CareerInfo, EducationLevel, SkillTree } from '../core/types';
import { CAREERS } from '../../config/gameConfig';

export function getCareerInfo(career: CareerType | string): CareerInfo {
  return CAREERS[career as CareerType];
}

export function getAvailableCareers(age: number, stats: PlayerStats): CareerType[] {
  const careers: CareerType[] = [];
  for (const [careerId, careerInfo] of Object.entries(CAREERS)) {
    if (age >= careerInfo.startingAge) {
      const firstLevel = careerInfo.levels[0];
      if (checkCareerRequirements(stats, firstLevel)) {
        careers.push(careerId as CareerType);
      }
    }
  }
  return careers;
}

function checkCareerRequirements(
  stats: PlayerStats,
  level: {
    requiredSkills?: Partial<SkillTree>;
    requiredYears?: number;
    requiredEducation?: EducationLevel;
  }
): boolean {
  if (level.requiredEducation) {
    const educationOrder: EducationLevel[] = ['none', 'primary', 'secondary', 'bachelor', 'master', 'doctor'];
    const currentIndex = educationOrder.indexOf(stats.educationLevel);
    const requiredIndex = educationOrder.indexOf(level.requiredEducation);
    if (currentIndex < requiredIndex) return false;
  }

  if (level.requiredSkills) {
    for (const [skill, requiredLevel] of Object.entries(level.requiredSkills)) {
      if (stats.skills[skill as keyof SkillTree] < (requiredLevel as number)) {
        return false;
      }
    }
  }

  return true;
}

export function startCareer(
  stats: PlayerStats,
  career: CareerType
): {
  newStats: PlayerStats;
  success: boolean;
  message: string;
} {
  const careerInfo = getCareerInfo(career);
  const firstLevel = careerInfo.levels[0];

  if (!checkCareerRequirements(stats, firstLevel)) {
    return {
      newStats: stats,
      success: false,
      message: `不满足${careerInfo.name}的入职条件`
    };
  }

  const newStats: PlayerStats = {
    ...stats,
    career: {
      currentCareer: career,
      currentLevel: 1,
      totalExperience: 0,
      yearsInCurrentCareer: 0,
      previousCareers: stats.career?.previousCareers || []
    },
    jobLevel: 1 as 0 | 1 | 2 | 3 | 4 | 5,
    isUnemployed: false
  };

  return {
    newStats,
    success: true,
    message: `成功入职${careerInfo.name}，成为${firstLevel.title}`
  };
}

export function canPromote(stats: PlayerStats): boolean {
  if (!stats.career || !stats.career.currentCareer) return false;

  const careerInfo = getCareerInfo(stats.career.currentCareer);
  if (stats.career.currentLevel >= careerInfo.levels.length) return false;

  const nextLevel = careerInfo.levels[stats.career.currentLevel];
  if (!checkCareerRequirements(stats, nextLevel)) return false;

  if (nextLevel.requiredYears && stats.career.yearsInCurrentCareer < nextLevel.requiredYears) {
    return false;
  }

  return true;
}

export function promote(stats: PlayerStats): {
  newStats: PlayerStats;
  success: boolean;
  message: string;
} {
  if (!canPromote(stats)) {
    return {
      newStats: stats,
      success: false,
      message: '不满足晋升条件'
    };
  }

  const careerInfo = getCareerInfo(stats.career!.currentCareer!);
  const nextLevel = careerInfo.levels[stats.career!.currentLevel];

  const nextCareerLevel = stats.career!.currentLevel + 1;
  
  // 映射 career.currentLevel (1-10) 到 jobLevel (0-5)
  let newJobLevel: 0 | 1 | 2 | 3 | 4 | 5 = 1;
  if (nextCareerLevel >= 9) newJobLevel = 5;
  else if (nextCareerLevel >= 6) newJobLevel = 4;
  else if (nextCareerLevel >= 4) newJobLevel = 3;
  else if (nextCareerLevel >= 2) newJobLevel = 2;
  else newJobLevel = 1;

  const newStats: PlayerStats = {
    ...stats,
    career: {
      ...stats.career!,
      currentLevel: nextCareerLevel,
      yearsInCurrentCareer: 0
    },
    jobLevel: newJobLevel
  };

  return {
    newStats,
    success: true,
    message: `恭喜晋升为${nextLevel.title}！`
  };
}

export function getCareerIncome(stats: PlayerStats): number {
  if (!stats.career || !stats.career.currentCareer) return 0;

  const careerInfo = getCareerInfo(stats.career.currentCareer);
  const currentLevel = careerInfo.levels[stats.career.currentLevel - 1];
  return currentLevel.income;
}

export function getCurrentCareerTitle(stats: PlayerStats): string {
  if (!stats.career || !stats.career.currentCareer) return '无职业';

  const careerInfo = getCareerInfo(stats.career.currentCareer);
  const currentLevel = careerInfo.levels[stats.career.currentLevel - 1];
  return currentLevel.title;
}

export function processCareerYear(stats: PlayerStats): {
  newStats: PlayerStats;
  extraIncome: number;
  extraSkillPoints: number;
  healthBonus: number;
  promotionOpportunity: boolean;
} {
  let newStats = { ...stats };
  let extraIncome = 0;
  let extraSkillPoints = 0;
  let healthBonus = 0;
  let promotionOpportunity = false;

  if (newStats.career && newStats.career.currentCareer) {
    newStats.career.yearsInCurrentCareer++;
    newStats.career.totalExperience++;

    const careerInfo = getCareerInfo(newStats.career.currentCareer);

    if (careerInfo.specialEffect) {
      if (careerInfo.specialEffect.includes('额外收入') || careerInfo.specialEffect.includes('额外收入') || careerInfo.specialEffect.includes('有机会获得') || careerInfo.specialEffect.includes('业绩好') || careerInfo.specialEffect.includes('版税')) {
        extraIncome = Math.floor(Math.random() * 50000) + 10000;
      }

      if (careerInfo.specialEffect.includes('额外技能点')) {
        extraSkillPoints = 2;
      }

      if (careerInfo.specialEffect.includes('健康恢复') || careerInfo.specialEffect.includes('医疗费用')) {
        healthBonus = 5;
      }
    }

    if (canPromote(newStats)) {
      promotionOpportunity = true;
    }
  }

  return {
    newStats,
    extraIncome,
    extraSkillPoints,
    healthBonus,
    promotionOpportunity
  };
}

export function changeCareer(
  stats: PlayerStats,
  newCareer: CareerType
): {
  newStats: PlayerStats;
  success: boolean;
  message: string;
} {
  const careerInfo = getCareerInfo(newCareer);
  const firstLevel = careerInfo.levels[0];

  if (!checkCareerRequirements(stats, firstLevel)) {
    return {
      newStats: stats,
      success: false,
      message: `不满足${careerInfo.name}的入职条件`
    };
  }

  const previousCareers = stats.career?.currentCareer ? [
    ...(stats.career?.previousCareers || []),
    stats.career.currentCareer
  ] : [];

  const newStats: PlayerStats = {
    ...stats,
    career: {
      currentCareer: newCareer,
      currentLevel: 1,
      totalExperience: 0,
      yearsInCurrentCareer: 0,
      previousCareers
    },
    jobLevel: 1 as 0 | 1 | 2 | 3 | 4 | 5,
    isUnemployed: false
  };

  return {
    newStats,
    success: true,
    message: `成功转行成为${careerInfo.name}的${firstLevel.title}`
  };
}

export function retireFromCareer(stats: PlayerStats): PlayerStats {
  return {
    ...stats,
    career: {
      currentCareer: null,
      currentLevel: 0,
      totalExperience: stats.career?.totalExperience || 0,
      yearsInCurrentCareer: 0,
      previousCareers: stats.career?.currentCareer ? [
        ...(stats.career?.previousCareers || []),
        stats.career.currentCareer
      ] : []
    },
    retired: true
  };
}

export function loseJob(stats: PlayerStats): {
  newStats: PlayerStats;
  message: string;
} {
  const previousCareer = stats.career?.currentCareer;
  const previousCareerName = previousCareer ? getCareerInfo(previousCareer).name : '工作';
  
  const newStats: PlayerStats = {
    ...stats,
    career: {
      currentCareer: null,
      currentLevel: 0,
      totalExperience: stats.career?.totalExperience || 0,
      yearsInCurrentCareer: 0,
      previousCareers: previousCareer ? [
        ...(stats.career?.previousCareers || []),
        previousCareer
      ] : stats.career?.previousCareers || []
    },
    isUnemployed: true,
    jobLevel: 0 as 0 | 1 | 2 | 3 | 4 | 5
  };
  
  return {
    newStats,
    message: `你失去了${previousCareerName}的工作，现在处于失业状态。`
  };
}

export function reEmploy(stats: PlayerStats, newCareer: CareerType): {
  newStats: PlayerStats;
  success: boolean;
  message: string;
} {
  const careerInfo = getCareerInfo(newCareer);
  const firstLevel = careerInfo.levels[0];
  
  if (!checkCareerRequirements(stats, firstLevel)) {
    return {
      newStats: stats,
      success: false,
      message: `不满足${careerInfo.name}的入职条件`
    };
  }
  
  const newStats: PlayerStats = {
    ...stats,
    career: {
      currentCareer: newCareer,
      currentLevel: 1,
      totalExperience: stats.career?.totalExperience || 0,
      yearsInCurrentCareer: 0,
      previousCareers: stats.career?.previousCareers || []
    },
    isUnemployed: false,
    jobLevel: 1 as 0 | 1 | 2 | 3 | 4 | 5
  };
  
  return {
    newStats,
    success: true,
    message: `恭喜你重新就业，成为${careerInfo.name}的${firstLevel.title}！`
  };
}

export function getRecommendedCareersByFamily(familyOccupation: string | null): CareerType[] {
  const recommendations: CareerType[] = [];

  if (!familyOccupation) return recommendations;

  const recommendationsMap: Record<string, CareerType[]> = {
    civil_servant: ['civil_servant', 'teacher_career'],
    police: ['police_career', 'civil_servant'],
    teacher_family: ['teacher_career', 'scientist_career'],
    doctor_family: ['doctor_career', 'scientist_career'],
    lawyer: ['lawyer_career', 'civil_servant'],
    engineer: ['engineer_career', 'programmer'],
    programmer_family: ['programmer', 'engineer_career'],
    scientist: ['scientist_career', 'doctor_career'],
    business: ['sales', 'entrepreneur_career'],
    finance: ['finance_career', 'sales'],
    entrepreneur: ['entrepreneur_career', 'sales'],
    artist: ['celebrity', 'designer_career'],
    athlete: ['athlete_career', 'celebrity'],
    writer: ['author', 'celebrity'],
    designer: ['designer_career', 'author'],
    scholar: ['scientist_career', 'teacher_career'],
    military: ['police_career', 'athlete_career'],
    farmer: ['chef', 'entrepreneur_career'],
    worker: ['engineer_career', 'chef'],
    craftsman: ['designer_career', 'chef'],
    hermit: ['author', 'scientist_career'],
    adventurer: ['athlete_career', 'entrepreneur_career']
  };

  return recommendationsMap[familyOccupation] || ['sales', 'programmer', 'doctor_career'];
}

export default {
  getCareerInfo,
  getAvailableCareers,
  startCareer,
  canPromote,
  promote,
  getCareerIncome,
  getCurrentCareerTitle,
  processCareerYear,
  changeCareer,
  retireFromCareer,
  getRecommendedCareersByFamily,
  loseJob,
  reEmploy
};
