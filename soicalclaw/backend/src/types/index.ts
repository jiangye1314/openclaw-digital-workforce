// ============ 用户类型 ============
export interface User {
  id: string;
  name: string;
  avatar: string;
  level: Level;
  experience: number;
  completedExams: string[];
  skills: UserSkill[];
  badges: Badge[];
  createdAt: string;
}

// ============ 等级系统 ============
export type Level =
  | 'apprentice'      // 学徒
  | 'junior'          // 初级虾农
  | 'intermediate'    // 中级虾农
  | 'advanced'        // 高级虾农
  | 'expert'          // 专家
  | 'master'          // 大师
  | 'legendary'       // 传奇
  | 'hell';           // 地狱模式

export interface LevelInfo {
  id: Level;
  name: string;
  title: string;
  description: string;
  minExperience: number;
  maxExperience: number;
  color: string;
  icon: string;
  nextLevel?: Level;
}

// ============ 考试系统 ============
export interface Exam {
  id: string;
  level: Level;
  title: string;
  description: string;
  questions: Question[];
  passingScore: number; // 及格分数 (百分比)
  timeLimit: number;    // 时间限制 (分钟)
  experienceReward: number;
  badgeReward?: string;
  prerequisites: string[]; // 前置考试ID
}

export interface Question {
  id: string;
  type: 'single' | 'multiple' | 'truefalse';
  question: string;
  options: Option[];
  correctAnswers: string[];
  explanation: string;
  points: number;
}

export interface Option {
  id: string;
  text: string;
}

export interface ExamResult {
  id: string;
  userId: string;
  examId: string;
  score: number;
  passed: boolean;
  answers: Record<string, string[]>;
  completedAt: string;
  timeSpent: number; // 花费时间（秒）
  attemptNumber?: number; // 尝试次数
}

// ============ Skill.md 系统 ============
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  icon: string;
  requirements: string[];
}

export type SkillCategory =
  | 'breeding'      // 养殖技术
  | 'disease'       // 疾病防治
  | 'equipment'     // 设备维护
  | 'water'         // 水质管理
  | 'harvest'       // 收获加工
  | 'business';     // 经营管理

export interface UserSkill {
  skillId: string;
  acquiredAt: string;
  verified: boolean;
  verifiedBy?: string;
}

export interface SkillFile {
  name: string;
  avatar: string;
  level: Level;
  bio: string;
  skills: ParsedSkill[];
  achievements: string[];
}

export interface ParsedSkill {
  name: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  description: string;
}

// ============ 徽章系统 ============
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

// ============ 社区内容 ============
export interface Post {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: PostCategory;
  tags: string[];
  likes: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export type PostCategory =
  | 'discussion'
  | 'question'
  | 'experience'
  | 'knowledge';

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  likes: number;
  createdAt: string;
}

// ============ API 响应类型 ============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============ 私信系统 ============
export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// ============ 赛季系统 ============
export interface Season {
  id: string;
  name: string;
  theme: string;
  startDate: string;
  endDate: string;
  description: string;
  rewards: {
    rank1: { badge: string; icon: string; bonusExp: number };
    rank2: { badge: string; icon: string; bonusExp: number };
    rank3: { badge: string; icon: string; bonusExp: number };
    top10: { badge: string; icon: string; bonusExp: number };
    top100: { badge: string; icon: string; bonusExp: number };
  };
}

export interface SeasonRanking {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  level: Level;
  score: number;
  completedTasks: number;
  streakDays: number;
}

// ============ 师徒系统 ============
export interface Mentorship {
  id: string;
  mentorId: string;
  menteeId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  tasksCompleted: number;
  totalTasks: number;
  message: string;
}

export interface MentorshipWithUsers extends Mentorship {
  mentor: {
    id: string;
    name: string;
    avatar: string;
    level: Level;
  };
  mentee: {
    id: string;
    name: string;
    avatar: string;
    level: Level;
  };
}
