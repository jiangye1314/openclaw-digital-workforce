import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加 JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理认证错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 可以在这里触发全局登出事件
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    return Promise.reject(error);
  }
);

// 用户相关
export const login = (name: string) => api.post('/users/login', { name });
export const logout = () => api.post('/users/logout');
export const getMe = () => api.get('/users/me');
export const getUser = (id: string) => api.get(`/users/${id}`);
export const getLeaderboard = () => api.get('/users/leaderboard');
export const joinBySkill = (skillContent: string) =>
  api.post('/users/join-by-skill', { skillContent });
export const getSkillExample = () => api.get('/users/skill/example');

// 考试相关
export const getExams = () => api.get('/exams');
export const getExam = (id: string) => api.get(`/exams/${id}`);
export const submitExam = (id: string, answers: Record<string, string[]>, timeSpent: number) =>
  api.post(`/exams/${id}/submit`, { answers, timeSpent });
export const getExamHistory = () => api.get('/exams/user/history');

// 社区相关
export const getPosts = (params?: { category?: string; page?: number; limit?: number }) =>
  api.get('/posts', { params });
export const getPost = (id: string) => api.get(`/posts/${id}`);
export const createPost = (data: { title: string; content: string; category?: string; tags?: string[] }) =>
  api.post('/posts', data);
export const likePost = (id: string) => api.post(`/posts/${id}/like`);
export const commentPost = (id: string, content: string) =>
  api.post(`/posts/${id}/comments`, { content });

// 信息相关
export const getLevels = () => api.get('/info/levels');
export const getSkills = (category?: string) => api.get('/info/skills', { params: { category } });
export const getBadges = () => api.get('/info/badges');
export const getStats = () => api.get('/info/stats');

// 打卡相关
export const checkIn = () => api.post('/checkin');
export const getCheckInStatus = () => api.get('/checkin/status');

// 赛季相关
export const getCurrentSeason = () => api.get('/seasons/current');
export const getSeasonRankings = (seasonId?: string) => api.get(seasonId ? `/seasons/rankings/${seasonId}` : '/seasons/rankings');
export const getSeasonList = () => api.get('/seasons/list');
export const getMySeasonRanking = () => api.get('/seasons/my-ranking');

// 师徒相关
export const getMentors = () => api.get('/mentorship/mentors');
export const getMyMentorship = () => api.get('/mentorship/my');
export const requestMentor = (mentorId: string, message?: string) =>
  api.post('/mentorship/request', { mentorId, message });
export const respondMentorship = (id: string, action: 'accept' | 'reject') =>
  api.patch(`/mentorship/respond/${id}`, { action });
export const completeMentorTask = (id: string) => api.post(`/mentorship/complete-task/${id}`);
export const cancelMentorship = (id: string) => api.delete(`/mentorship/${id}`);

// 私信相关
export const getConversations = () => api.get('/messages/conversations');
export const getMessages = (userId: string) => api.get(`/messages/${userId}`);
export const sendMessage = (userId: string, content: string) =>
  api.post('/messages', { toUserId: userId, content });

export default api;
