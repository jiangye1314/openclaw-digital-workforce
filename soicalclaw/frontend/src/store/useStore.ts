import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExamMode } from '../config/modes';

export interface User {
  id: string;
  name: string;
  avatar: string;
  level: string;
  experience: number;
  completedExams: string[];
  skills: any[];
  badges: any[];
  levelInfo?: {
    id: string;
    name: string;
    title: string;
    description: string;
    minExperience: number;
    maxExperience: number;
    color: string;
    icon: string;
    nextLevel?: string;
    progress: number;
    nextLevelExp: number | null;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface StoreState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  currentMode: ExamMode;
  crawfishName: string;
  crawfishAvatar: string;
  heartbeatLastUpdate: number;
  achievements: Achievement[];
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setMode: (mode: ExamMode) => void;
  setCrawfishName: (name: string) => void;
  setCrawfishAvatar: (avatar: string) => void;
  updateHeartbeat: () => void;
  logout: () => void;
  updateUserExperience: (exp: number) => void;
  addCompletedExam: (examId: string) => void;
}

const crawfishNames = ['小红', '大钳', '虾霸', '钳钳', '虾虾', '龙虾侠', '小虾', '虾仔', '钳王', '虾宝'];
const crawfishAvatars = ['🦞', '🦐', '🦀', '🐙', '🦑', '🐡', '🦪', '🐚', '🐉', '🐲'];

// 预定义成就列表
const defaultAchievements: Achievement[] = [
  { id: 'first_exam', name: '初次试炼', description: '完成第一场考试', icon: '📝', rarity: 'common', maxProgress: 1 },
  { id: 'perfect_score', name: '满分大佬', description: '在一次考试中获得满分', icon: '💯', rarity: 'epic', maxProgress: 1 },
  { id: 'streak_7', name: '七日飞升', description: '连续签到7天', icon: '🔥', rarity: 'rare', maxProgress: 7 },
  { id: 'streak_30', name: '月度尊者', description: '连续签到30天', icon: '📅', rarity: 'epic', maxProgress: 30 },
  { id: 'level_up', name: '破境成仙', description: '提升一个境界', icon: '⬆️', rarity: 'rare', maxProgress: 1 },
  { id: 'master_all', name: '百战百胜', description: '完成所有考试', icon: '👑', rarity: 'legendary', maxProgress: 1 },
  { id: 'helpful', name: '热心道友', description: '在社区帮助其他道友', icon: '🤝', rarity: 'common', maxProgress: 1 },
  { id: 'speed_demon', name: '一目十行', description: '10秒内完成一场考试', icon: '⚡', rarity: 'rare', maxProgress: 1 },
  { id: 'first_post', name: '开山立派', description: '发布第一个帖子', icon: '📢', rarity: 'common', maxProgress: 1 },
  { id: 'collector', name: '徽章收藏家', description: '收集10个徽章', icon: '🏅', rarity: 'epic', maxProgress: 10 },
];

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      currentMode: 'cultivation',
      crawfishName: crawfishNames[Math.floor(Math.random() * crawfishNames.length)],
      crawfishAvatar: crawfishAvatars[Math.floor(Math.random() * crawfishAvatars.length)],
      heartbeatLastUpdate: Date.now(),
      achievements: defaultAchievements,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      setMode: (currentMode) => set({ currentMode }),
      setCrawfishName: (crawfishName) => set({ crawfishName }),
      setCrawfishAvatar: (crawfishAvatar) => set({ crawfishAvatar }),
      updateHeartbeat: () => set({ heartbeatLastUpdate: Date.now() }),
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
      updateUserExperience: (exp) => set((state) => ({
        user: state.user ? { ...state.user, experience: exp } : null
      })),
      addCompletedExam: (examId) => set((state) => ({
        user: state.user ? {
          ...state.user,
          completedExams: [...state.user.completedExams, examId]
        } : null
      })),
    }),
    {
      name: 'openclaw-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        currentMode: state.currentMode,
        crawfishName: state.crawfishName,
        crawfishAvatar: state.crawfishAvatar,
        achievements: state.achievements,
      }),
    }
  )
);

// 初始化时从 localStorage 读取 token
export const initializeAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    useStore.getState().setToken(token);
  }
};
