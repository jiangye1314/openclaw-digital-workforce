import { LevelInfo, Level } from '../types';

// ===== OpenClaw 小龙虾江湖 - 门派等级系统 =====
export const LEVELS: Record<Level, LevelInfo> = {
  apprentice: {
    id: 'apprentice',
    name: '外门弟子',
    title: '初入江湖的小龙虾',
    description: '初入OpenClaw江湖，开始修炼钳工基础心法',
    minExperience: 0,
    maxExperience: 99,
    color: '#4169E1',
    icon: '🦐',
    nextLevel: 'junior'
  },
  junior: {
    id: 'junior',
    name: '内门弟子',
    title: '小有名气的小龙虾',
    description: '已入师门，掌握基础钳工技法，可独立行走江湖',
    minExperience: 100,
    maxExperience: 499,
    color: '#9370DB',
    icon: '🦞',
    nextLevel: 'intermediate'
  },
  intermediate: {
    id: 'intermediate',
    name: '核心弟子',
    title: '江湖新秀小龙虾',
    description: '修为精进，钳工技法纯熟，开始挑战各路妖兽',
    minExperience: 500,
    maxExperience: 1499,
    color: '#228B22',
    icon: '⚔️',
    nextLevel: 'advanced'
  },
  advanced: {
    id: 'advanced',
    name: '堂主',
    title: '一方霸主小龙虾',
    description: '威震一方，可带领小弟闯荡江湖',
    minExperience: 1500,
    maxExperience: 3999,
    color: '#DC143C',
    icon: '🛡️',
    nextLevel: 'expert'
  },
  expert: {
    id: 'expert',
    name: '长老',
    title: '德高望重的小龙虾',
    description: '功力深厚，在江湖上颇有威望，可指点后辈',
    minExperience: 4000,
    maxExperience: 7999,
    color: '#FF8C00',
    icon: '👨‍🏫',
    nextLevel: 'master'
  },
  master: {
    id: 'master',
    name: '掌门',
    title: '一派掌门小龙虾',
    description: '开宗立派，培养弟子无数，名震OpenClaw江湖',
    minExperience: 8000,
    maxExperience: 14999,
    color: '#FFD700',
    icon: '👑',
    nextLevel: 'legendary'
  },
  legendary: {
    id: 'legendary',
    name: '武林至尊',
    title: '传说中的虾王',
    description: '登临绝巅，万虾敬仰，OpenClaw江湖永恒的传说',
    minExperience: 15000,
    maxExperience: 99999,
    color: '#FF1493',
    icon: '🔥',
    nextLevel: 'hell'
  },
  hell: {
    id: 'hell',
    name: '地狱判官',
    title: '来自地狱的修罗',
    description: '超越凡俗，历经炼狱考验，成为OpenClaw江湖的终极传说',
    minExperience: 100000,
    maxExperience: 9999999,
    color: '#8B0000',
    icon: '💀'
  }
};

// 获取等级信息
export function getLevelInfo(level: Level): LevelInfo {
  return LEVELS[level];
}

// 根据经验值获取等级
export function getLevelByExperience(exp: number): Level {
  const levels = Object.values(LEVELS);
  for (let i = levels.length - 1; i >= 0; i--) {
    if (exp >= levels[i].minExperience) {
      return levels[i].id;
    }
  }
  return 'apprentice';
}

// 获取下一级所需经验
export function getNextLevelExp(currentLevel: Level): number | null {
  const level = LEVELS[currentLevel];
  return level.nextLevel ? LEVELS[level.nextLevel].minExperience : null;
}

// 获取当前等级进度（百分比）
export function getLevelProgress(exp: number, level: Level): number {
  const levelInfo = LEVELS[level];
  if (!levelInfo.nextLevel) return 100;

  const currentLevelExp = exp - levelInfo.minExperience;
  const levelRange = levelInfo.maxExperience - levelInfo.minExperience + 1;
  return Math.min(100, Math.round((currentLevelExp / levelRange) * 100));
}

// 获取升级所需的经验值（当前等级的进度）
export function getExpToNextLevel(exp: number, level: Level): number {
  const nextLevelExp = getNextLevelExp(level);
  if (!nextLevelExp) return 0;
  return nextLevelExp - exp;
}
