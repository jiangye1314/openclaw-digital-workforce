/**
 * OpenClaw Exam Center - Multi-Mode Configuration
 * Inspired by Moltbook's Agent-Native Architecture
 *
 * 四种考试模式：
 * - cultivation: 修仙模式 - Wuxia RPG风格，境界突破
 * - study: 学习模式 - 专注教育，循序渐进
 * - parenting: 带娃模式 - 亲子友好，趣味互动
 * - hell: 地狱模式 - 极限挑战，高难度
 */

export type ExamMode = 'cultivation' | 'study' | 'parenting' | 'hell';

export interface ModeConfig {
  id: ExamMode;
  name: string;
  icon: string;
  description: string;
  slogan: string;
  color: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    title: string;
    body: string;
  };
  terminology: {
    exam: string;
    score: string;
    level: string;
    experience: string;
    pass: string;
    fail: string;
    rank: string;
  };
  features: {
    hasCheckIn: boolean;
    hasStreak: boolean;
    hasPowerUps: boolean;
    hasCompanions: boolean;
    timeLimit: boolean;
    lives: boolean;
  };
  levels: LevelInfo[];
  heartbeat: {
    interval: number; // 心跳间隔（分钟）
    rewards: string[];
  };
}

export interface LevelInfo {
  id: string;
  name: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  minScore: number;
  rewards: string[];
}

// ============ 修仙模式配置 ============
const cultivationConfig: ModeConfig = {
  id: 'cultivation',
  name: '修仙模式',
  icon: '🗡️',
  description: '踏入修真之路，从外门弟子修炼到武林至尊',
  slogan: '修炼钳工心法，成就虾王传说',
  color: {
    primary: '#8B4513',
    secondary: '#D2691E',
    accent: '#FFD700',
    background: '#1a0f0a',
    text: '#f5e6d3',
  },
  fonts: {
    title: "'Ma Shan Zheng', 'ZCOOL XiaoWei', cursive",
    body: "'Noto Serif SC', serif",
  },
  terminology: {
    exam: '试炼',
    score: '修为',
    level: '境界',
    experience: '内力',
    pass: '突破成功',
    fail: '突破失败',
    rank: '江湖排名',
  },
  features: {
    hasCheckIn: true,
    hasStreak: true,
    hasPowerUps: true,
    hasCompanions: true,
    timeLimit: true,
    lives: false,
  },
  levels: [
    { id: 'apprentice', name: '外门弟子', title: '初入江湖', icon: '🦐', color: '#8B4513', description: '刚入门的小龙虾，需要勤加修炼', minScore: 0, rewards: ['基础钳工心法'] },
    { id: 'junior', name: '内门弟子', title: '小有名气', icon: '🦀', color: '#4169E1', description: '已掌握基础心法，可以挑战更高难度', minScore: 100, rewards: ['进阶心法', '每日签到特权'] },
    { id: 'intermediate', name: '核心弟子', title: '江湖新秀', icon: '🐙', color: '#9932CC', description: '在江湖中崭露头角', minScore: 300, rewards: ['核心心法', '秘境试炼资格'] },
    { id: 'advanced', name: '堂主', title: '一方霸主', icon: '🦑', color: '#FF6347', description: '统领一方的强者', minScore: 600, rewards: ['堂主专属心法', '收徒资格'] },
    { id: 'expert', name: '长老', title: '德高望重', icon: '🐡', color: '#20B2AA', description: '受人尊敬的前辈', minScore: 1000, rewards: ['长老心法', '参与制定规则'] },
    { id: 'master', name: '掌门', title: '一派宗师', icon: '🦈', color: '#DC143C', description: '一派之掌门，威震四方', minScore: 1500, rewards: ['掌门心法', '开创门派'] },
    { id: 'legendary', name: '武林至尊', title: '传说中的虾王', icon: '🐉', color: '#FFD700', description: '达到武学巅峰的传奇', minScore: 2500, rewards: ['至尊心法', '永久传说称号'] },
  ],
  heartbeat: {
    interval: 240, // 4小时
    rewards: ['修为增长', '随机心法碎片', '奇遇事件'],
  },
};

// ============ 学习模式配置 ============
const studyConfig: ModeConfig = {
  id: 'study',
  name: '学习模式',
  icon: '📚',
  description: '系统化学习路径，循序渐进掌握钳工技能',
  slogan: '科学学习，稳步提升',
  color: {
    primary: '#2563EB',
    secondary: '#3B82F6',
    accent: '#10B981',
    background: '#f8fafc',
    text: '#1e293b',
  },
  fonts: {
    title: "'Inter', 'Noto Sans SC', sans-serif",
    body: "'Inter', 'Noto Sans SC', sans-serif",
  },
  terminology: {
    exam: '测验',
    score: '分数',
    level: '阶段',
    experience: '知识点',
    pass: '通过',
    fail: '未通过',
    rank: '学习排名',
  },
  features: {
    hasCheckIn: true,
    hasStreak: true,
    hasPowerUps: false,
    hasCompanions: false,
    timeLimit: false,
    lives: false,
  },
  levels: [
    { id: 'beginner', name: '入门阶段', title: '新手学员', icon: '🌱', color: '#22C55E', description: '了解钳工基础知识', minScore: 0, rewards: ['入门证书', '学习指南'] },
    { id: 'elementary', name: '基础阶段', title: '初级学员', icon: '📝', color: '#3B82F6', description: '掌握基本操作技能', minScore: 100, rewards: ['基础证书', '进阶课程解锁'] },
    { id: 'intermediate', name: '进阶阶段', title: '中级学员', icon: '📐', color: '#8B5CF6', description: '能够独立完成常见任务', minScore: 300, rewards: ['进阶证书', '实战项目'] },
    { id: 'advanced', name: '高级阶段', title: '高级学员', icon: '🔧', color: '#F59E0B', description: '精通各项技能', minScore: 600, rewards: ['高级证书', '导师资格'] },
    { id: 'expert', name: '专家阶段', title: '专家学员', icon: '🎓', color: '#EF4444', description: '具备专业水平', minScore: 1000, rewards: ['专家证书', '认证讲师'] },
    { id: 'master', name: '大师阶段', title: '大师学员', icon: '👨‍🏫', color: '#1F2937', description: '技艺精湛，可指导他人', minScore: 1500, rewards: ['大师证书', '课程开发权'] },
    { id: 'grandmaster', name: '宗师阶段', title: '宗师学员', icon: '⭐', color: '#F59E0B', description: '达到行业顶尖水平', minScore: 2500, rewards: ['宗师证书', '终身荣誉'] },
  ],
  heartbeat: {
    interval: 60, // 1小时
    rewards: ['知识点回顾', '学习建议', '错题整理'],
  },
};

// ============ 带娃模式配置 ============
const parentingConfig: ModeConfig = {
  id: 'parenting',
  name: '带娃模式',
  icon: '🦞',
  description: '亲子互动学习，寓教于乐，和孩子一起成长',
  slogan: '亲子同修，快乐成长',
  color: {
    primary: '#FF6B9D',
    secondary: '#FFA07A',
    accent: '#FFD93D',
    background: '#FFF5F7',
    text: '#4A4A4A',
  },
  fonts: {
    title: "'Fredoka One', 'ZCOOL KuaiLe', cursive",
    body: "'Nunito', 'Noto Sans SC', sans-serif",
  },
  terminology: {
    exam: '挑战',
    score: '星星',
    level: '等级',
    experience: '成长值',
    pass: '完成',
    fail: '再试一次',
    rank: '小伙伴排名',
  },
  features: {
    hasCheckIn: true,
    hasStreak: true,
    hasPowerUps: true,
    hasCompanions: true,
    timeLimit: false,
    lives: true,
  },
  levels: [
    { id: 'egg', name: '虾蛋蛋', title: '刚出生的小可爱', icon: '🥚', color: '#FFB6C1', description: '刚开始探索世界', minScore: 0, rewards: ['虾宝宝贴纸', '颜色绘本'] },
    { id: 'larva', name: '虾苗苗', title: '好奇宝宝', icon: '🐣', color: '#98FB98', description: '充满好奇心', minScore: 50, rewards: ['苗苗徽章', '形状游戏'] },
    { id: 'baby', name: '虾宝宝', title: '学习小能手', icon: '🍼', color: '#87CEEB', description: '开始学本领', minScore: 150, rewards: ['宝宝勋章', '数字冒险'] },
    { id: 'child', name: '虾孩童', title: '小小探险家', icon: '🎈', color: '#DDA0DD', description: '爱探索爱发现', minScore: 300, rewards: ['探险家帽子', '迷宫挑战'] },
    { id: 'teen', name: '虾少年', title: '勇敢小战士', icon: '🦸', color: '#F0E68C', description: '勇敢接受挑战', minScore: 500, rewards: ['战士披风', '团队任务'] },
    { id: 'youth', name: '虾青年', title: '智慧小达人', icon: '💡', color: '#FFA500', description: '越来越聪明', minScore: 800, rewards: ['智慧眼镜', '创造工坊'] },
    { id: 'adult', name: '大虾侠', title: '超级小英雄', icon: '🦞', color: '#FF6B6B', description: '成为超级英雄', minScore: 1200, rewards: ['大虾侠战衣', '专属故事'] },
  ],
  heartbeat: {
    interval: 120, // 2小时
    rewards: ['爱心值', '惊喜礼物', '亲子任务'],
  },
};

// ============ 地狱模式配置 ============
const hellConfig: ModeConfig = {
  id: 'hell',
  name: '地狱模式',
  icon: '🔥',
  description: '极限挑战，只有最强者才能生存',
  slogan: '弱者止步，强者生存',
  color: {
    primary: '#DC2626',
    secondary: '#991B1B',
    accent: '#F59E0B',
    background: '#0a0a0a',
    text: '#e5e5e5',
  },
  fonts: {
    title: "'Creepster', 'Noto Serif SC', fantasy",
    body: "'Roboto Mono', monospace",
  },
  terminology: {
    exam: '炼狱',
    score: '生存分',
    level: '地狱层',
    experience: '痛苦值',
    pass: '存活',
    fail: '消亡',
    rank: '生存榜',
  },
  features: {
    hasCheckIn: false,
    hasStreak: false,
    hasPowerUps: false,
    hasCompanions: false,
    timeLimit: true,
    lives: true,
  },
  levels: [
    { id: 'limbo', name: '边缘地狱', title: '迷失者', icon: '🌫️', color: '#6B7280', description: '地狱的入口，失败者聚集之地', minScore: 0, rewards: ['生存资格'] },
    { id: 'lust', name: '欲望之狱', title: '诱惑者', icon: '💋', color: '#EC4899', description: '面对内心的欲望', minScore: 100, rewards: ['意志之火'] },
    { id: 'gluttony', name: '暴食之狱', title: '贪婪者', icon: '🍖', color: '#F97316', description: '克制无尽的贪婪', minScore: 300, rewards: ['节制之力'] },
    { id: 'greed', name: '贪婪之狱', title: '掠夺者', icon: '💰', color: '#EAB308', description: '超越物质的束缚', minScore: 600, rewards: ['觉醒之光'] },
    { id: 'wrath', name: '暴怒之狱', title: '狂怒者', icon: '😡', color: '#DC2626', description: '平息内心的怒火', minScore: 1000, rewards: ['宁静之核'] },
    { id: 'heresy', name: '异端之狱', title: '叛逆者', icon: '☠️', color: '#7C3AED', description: '坚守真正的信仰', minScore: 1500, rewards: ['真理之剑'] },
    { id: 'violence', name: '暴力之狱', title: '毁灭者', icon: '🔪', color: '#991B1B', description: '在暴力中保持理智', minScore: 2000, rewards: ['混沌之心'] },
    { id: 'fraud', name: '欺诈之狱', title: '阴谋者', icon: '🎭', color: '#1F2937', description: '识破一切谎言', minScore: 3000, rewards: ['真实之眼'] },
    { id: 'treachery', name: '背叛之狱', title: '终极背叛者', icon: '💀', color: '#000000', description: '地狱最深处，背叛者的终焉', minScore: 5000, rewards: ['地狱主宰'] },
  ],
  heartbeat: {
    interval: 30, // 30分钟
    rewards: ['痛苦积累', '生存挑战', '随机惩罚'],
  },
};

// 模式配置映射
export const modeConfigs: Record<ExamMode, ModeConfig> = {
  cultivation: cultivationConfig,
  study: studyConfig,
  parenting: parentingConfig,
  hell: hellConfig,
};

// 获取默认模式
export const defaultMode: ExamMode = 'cultivation';

// 模式列表
export const modeList: ExamMode[] = ['cultivation', 'study', 'parenting', 'hell'];

// 小龙虾参与提示（每种模式）
export const crawfishTips: Record<ExamMode, string[]> = {
  cultivation: [
    '小龙虾正在修炼它的钳子...',
    '你的小龙虾领悟了新的心法！',
    '小龙虾的境界突破了！',
    '小龙虾在秘境中发现了宝藏！',
    '你的小龙虾正在闭关修炼...',
  ],
  study: [
    '小龙虾正在认真学习...',
    '你的小龙虾做对了这道题！',
    '小龙虾记住了新的知识点！',
    '小龙虾完成了今日学习目标！',
    '你的小龙虾在复习错题...',
  ],
  parenting: [
    '小龙虾宝宝想要和你一起学习！',
    '你的小龙虾孩子完成了挑战！',
    '小龙虾宝宝获得了一颗星星！',
    '你的小龙虾孩子很开心！',
    '小龙虾宝宝在等待你的陪伴...',
  ],
  hell: [
    '小龙虾在地狱中挣扎求生...',
    '你的小龙虾承受了巨大的痛苦！',
    '小龙虾在炼狱中变得更加强大！',
    '你的小龙虾战胜了内心的恶魔！',
    '小龙虾正在挑战地狱领主...',
  ],
};
