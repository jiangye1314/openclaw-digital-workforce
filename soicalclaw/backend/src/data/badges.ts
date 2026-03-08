import { Badge } from '../types';

export const BADGES: Omit<Badge, 'unlockedAt'>[] = [
  // ============ 等级徽章 ============
  {
    id: 'junior-farmer',
    name: '初级虾农',
    description: '成功晋升为初级虾农',
    icon: '🦐',
    rarity: 'common'
  },
  {
    id: 'intermediate-farmer',
    name: '中级虾农',
    description: '成功晋升为中级虾农',
    icon: '🦞',
    rarity: 'common'
  },
  {
    id: 'advanced-farmer',
    name: '高级虾农',
    description: '成功晋升为高级虾农',
    icon: '🏆',
    rarity: 'rare'
  },
  {
    id: 'expert-farmer',
    name: '养殖专家',
    description: '成功晋升为养殖专家',
    icon: '👨‍🔬',
    rarity: 'rare'
  },
  {
    id: 'master-farmer',
    name: '养殖大师',
    description: '成功晋升为养殖大师',
    icon: '👑',
    rarity: 'epic'
  },
  {
    id: 'legendary-king',
    name: '传奇虾王',
    description: '成为传说中的传奇虾王！这是最高的荣誉！',
    icon: '🔥',
    rarity: 'legendary'
  },

  // ============ 考试徽章 ============
  {
    id: 'exam-whiz',
    name: '考试达人',
    description: '连续通过5场考试且分数都在90分以上',
    icon: '💯',
    rarity: 'rare'
  },
  {
    id: 'speed-runner',
    name: '速战速决',
    description: '在考试规定时间的一半内完成并通过',
    icon: '⚡',
    rarity: 'rare'
  },
  {
    id: 'perfect-score',
    name: '满分王者',
    description: '在任意一场考试中获得满分',
    icon: '⭐',
    rarity: 'epic'
  },

  // ============ 技能徽章 ============
  {
    id: 'skill-collector',
    name: '技能收藏家',
    description: '获得10项技能认证',
    icon: '🎒',
    rarity: 'rare'
  },
  {
    id: 'skill-master',
    name: '技能大师',
    description: '获得所有技能认证',
    icon: '🎓',
    rarity: 'legendary'
  },
  {
    id: 'water-expert',
    name: '水质专家',
    description: '获得所有水质管理相关技能',
    icon: '💧',
    rarity: 'epic'
  },
  {
    id: 'disease-fighter',
    name: '病害克星',
    description: '获得所有疾病防治相关技能',
    icon: '🛡️',
    rarity: 'epic'
  },

  // ============ 社区徽章 ============
  {
    id: 'first-post',
    name: '初来乍到',
    description: '发布第一条帖子',
    icon: '📝',
    rarity: 'common'
  },
  {
    id: 'helpful-hand',
    name: '热心肠',
    description: '回答10个问题并获得采纳',
    icon: '🤝',
    rarity: 'rare'
  },
  {
    id: 'knowledge-sharer',
    name: '知识分享者',
    description: '发布5篇被点赞超过50的经验帖',
    icon: '📚',
    rarity: 'epic'
  },
  {
    id: 'community-star',
    name: '社区明星',
    description: '获得100个粉丝',
    icon: '🌟',
    rarity: 'legendary'
  }
];

// 徽章稀有度颜色
export const RARITY_COLORS = {
  common: '#9CA3AF',    // 灰色
  rare: '#3B82F6',      // 蓝色
  epic: '#A855F7',      // 紫色
  legendary: '#F59E0B'  // 金色
};

// 获取徽章
export function getBadgeById(id: string): Omit<Badge, 'unlockedAt'> | undefined {
  return BADGES.find(badge => badge.id === id);
}

// 获取所有徽章
export function getAllBadges(): Omit<Badge, 'unlockedAt'>[] {
  return BADGES;
}
