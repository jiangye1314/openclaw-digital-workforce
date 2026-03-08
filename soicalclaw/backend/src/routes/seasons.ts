import { Router, Request, Response } from 'express';
import { ApiResponse, Season, SeasonRanking, User } from '../types';
import { requireAuth } from '../utils/auth';
import { getAllUsers, getUserById } from '../utils/storage';
import { LEVELS } from '../data/levels';

const router = Router();

// 赛季配置
const SEASONS: Record<string, Season> = {
  '2024-spring': {
    id: '2024-spring',
    name: '2024 春季赛季',
    theme: '春回大地',
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    description: '春天是小龙虾生长的黄金季节，在这个赛季中积累修为，争夺春季虾王称号！',
    rewards: {
      rank1: { badge: '春季虾王', icon: '👑', bonusExp: 10000 },
      rank2: { badge: '春季亚军', icon: '🥈', bonusExp: 5000 },
      rank3: { badge: '春季季军', icon: '🥉', bonusExp: 3000 },
      top10: { badge: '春季十强', icon: '🏆', bonusExp: 1000 },
      top100: { badge: '春季百强', icon: '🌟', bonusExp: 500 }
    }
  },
  '2024-summer': {
    id: '2024-summer',
    name: '2024 夏季赛季',
    theme: '夏日狂欢',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    description: '炎炎夏日，小龙虾最活跃的季节，挑战极限，成为夏日传奇！',
    rewards: {
      rank1: { badge: '夏日霸主', icon: '☀️', bonusExp: 10000 },
      rank2: { badge: '夏日亚军', icon: '🥈', bonusExp: 5000 },
      rank3: { badge: '夏日季军', icon: '🥉', bonusExp: 3000 },
      top10: { badge: '夏日十强', icon: '🏆', bonusExp: 1000 },
      top100: { badge: '夏日百强', icon: '🌟', bonusExp: 500 }
    }
  },
  '2024-autumn': {
    id: '2024-autumn',
    name: '2024 秋季赛季',
    theme: '金秋收获',
    startDate: '2024-09-01',
    endDate: '2024-11-30',
    description: '秋天是收获的季节，展示你一年来的修炼成果！',
    rewards: {
      rank1: { badge: '秋收之王', icon: '🍂', bonusExp: 10000 },
      rank2: { badge: '秋收亚军', icon: '🥈', bonusExp: 5000 },
      rank3: { badge: '秋收季军', icon: '🥉', bonusExp: 3000 },
      top10: { badge: '秋收十强', icon: '🏆', bonusExp: 1000 },
      top100: { badge: '秋收百强', icon: '🌟', bonusExp: 500 }
    }
  },
  '2024-winter': {
    id: '2024-winter',
    name: '2024 冬季赛季',
    theme: '寒冬试炼',
    startDate: '2024-12-01',
    endDate: '2025-02-28',
    description: '冬天是考验毅力的季节，在寒冬中坚持修炼，成为真正的强者！',
    rewards: {
      rank1: { badge: '冬之守护者', icon: '❄️', bonusExp: 10000 },
      rank2: { badge: '寒冬亚军', icon: '🥈', bonusExp: 5000 },
      rank3: { badge: '寒冬季军', icon: '🥉', bonusExp: 3000 },
      top10: { badge: '寒冬十强', icon: '🏆', bonusExp: 1000 },
      top100: { badge: '寒冬百强', icon: '🌟', bonusExp: 500 }
    }
  }
};

// 获取当前赛季
function getCurrentSeason(): Season | null {
  const now = new Date().toISOString().split('T')[0];
  for (const season of Object.values(SEASONS)) {
    if (now >= season.startDate && now <= season.endDate) {
      return season;
    }
  }
  // 默认返回最新赛季
  return SEASONS['2024-winter'];
}

// 获取赛季排名数据（模拟）
function getSeasonRankings(seasonId: string): SeasonRanking[] {
  const users = getAllUsers();
  // 根据用户经验值排序，模拟赛季排名
  return users
    .sort((a, b) => b.experience - a.experience)
    .slice(0, 100)
    .map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      level: user.level,
      score: user.experience + Math.floor(Math.random() * 1000), // 模拟赛季积分
      completedTasks: Math.floor(Math.random() * 50) + 10,
      streakDays: Math.floor(Math.random() * 30) + 1
    }));
}

// 获取当前赛季信息
router.get('/current', (req: Request, res: Response) => {
  const season = getCurrentSeason();
  if (!season) {
    return res.status(404).json({
      success: false,
      error: '当前没有进行中的赛季'
    } as ApiResponse<null>);
  }

  const now = new Date();
  const endDate = new Date(season.endDate);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  res.json({
    success: true,
    data: {
      ...season,
      daysRemaining: Math.max(0, daysRemaining),
      totalParticipants: getAllUsers().length
    }
  } as ApiResponse<any>);
});

// 获取赛季排行榜
router.get('/rankings/:seasonId?', (req: Request, res: Response) => {
  const seasonId = req.params.seasonId || getCurrentSeason()?.id;

  if (!seasonId || !SEASONS[seasonId]) {
    return res.status(404).json({
      success: false,
      error: '赛季不存在'
    } as ApiResponse<null>);
  }

  const rankings = getSeasonRankings(seasonId);

  res.json({
    success: true,
    data: {
      season: SEASONS[seasonId],
      rankings
    }
  } as ApiResponse<any>);
});

// 获取所有赛季列表
router.get('/list', (req: Request, res: Response) => {
  const seasons = Object.values(SEASONS).map(season => {
    const now = new Date();
    const startDate = new Date(season.startDate);
    const endDate = new Date(season.endDate);

    let status: 'upcoming' | 'active' | 'ended';
    if (now < startDate) status = 'upcoming';
    else if (now > endDate) status = 'ended';
    else status = 'active';

    return {
      ...season,
      status
    };
  });

  res.json({
    success: true,
    data: seasons
  } as ApiResponse<typeof seasons>);
});

// 获取用户在当前赛季的排名
router.get('/my-ranking', requireAuth, (req: Request, res: Response) => {
  const currentUser = req.user!;
  const season = getCurrentSeason();

  if (!season) {
    return res.status(404).json({
      success: false,
      error: '当前没有进行中的赛季'
    } as ApiResponse<null>);
  }

  const rankings = getSeasonRankings(season.id);
  const userRanking = rankings.find(r => r.userId === currentUser.id);

  // 计算赛季进度
  const now = new Date();
  const seasonStart = new Date(season.startDate);
  const seasonEnd = new Date(season.endDate);
  const totalDays = Math.ceil((seasonEnd.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

  res.json({
    success: true,
    data: {
      season,
      ranking: userRanking || null,
      totalRankings: rankings.length,
      seasonProgress: Math.round(progress),
      daysRemaining: Math.max(0, totalDays - elapsedDays)
    }
  } as ApiResponse<any>);
});

export default router;
