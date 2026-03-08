import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, Mentorship, MentorshipWithUsers } from '../types';
import { requireAuth } from '../utils/auth';
import { getUserById, getAllUsers } from '../utils/storage';
import fs from 'fs';
import path from 'path';

const router = Router();

const DATA_DIR = path.join(__dirname, '../../data');
const MENTORSHIP_FILE = path.join(DATA_DIR, 'mentorships.json');

// 确保数据文件存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(MENTORSHIP_FILE)) {
  fs.writeFileSync(MENTORSHIP_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// 读取师徒关系数据
function readMentorships(): Mentorship[] {
  try {
    const data = fs.readFileSync(MENTORSHIP_FILE, 'utf-8');
    return JSON.parse(data) as Mentorship[];
  } catch {
    return [];
  }
}

// 写入师徒关系数据
function writeMentorships(mentorships: Mentorship[]): void {
  fs.writeFileSync(MENTORSHIP_FILE, JSON.stringify(mentorships, null, 2), 'utf-8');
}

// 获取可用的师父列表（等级高于学徒的用户）
router.get('/mentors', requireAuth, (req: Request, res: Response) => {
  const currentUser = req.user!;
  const levelOrder = ['apprentice', 'junior', 'intermediate', 'advanced', 'expert', 'master', 'legendary'];
  const userLevelIndex = levelOrder.indexOf(currentUser.level);

  const mentors = getAllUsers()
    .filter(u => {
      // 排除自己
      if (u.id === currentUser.id) return false;
      // 等级必须高于当前用户
      const mentorLevelIndex = levelOrder.indexOf(u.level);
      return mentorLevelIndex > userLevelIndex;
    })
    .slice(0, 20)
    .map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      level: user.level,
      experience: user.experience,
      menteeCount: readMentorships().filter(m => m.mentorId === user.id && m.status === 'active').length
    }));

  res.json({
    success: true,
    data: mentors
  } as ApiResponse<typeof mentors>);
});

// 发起拜师请求
router.post('/request', requireAuth, (req: Request, res: Response) => {
  const currentUser = req.user!;
  const { mentorId, message } = req.body;

  if (!mentorId) {
    return res.status(400).json({
      success: false,
      error: '请选择一位师父'
    } as ApiResponse<null>);
  }

  // 检查师父是否存在
  const mentor = getUserById(mentorId);
  if (!mentor) {
    return res.status(404).json({
      success: false,
      error: '师父不存在'
    } as ApiResponse<null>);
  }

  // 不能拜自己为师
  if (mentorId === currentUser.id) {
    return res.status(400).json({
      success: false,
      error: '不能拜自己为师'
    } as ApiResponse<null>);
  }

  // 检查是否已有活跃的师徒关系
  const mentorships = readMentorships();
  const existing = mentorships.find(m =>
    (m.mentorId === currentUser.id || m.menteeId === currentUser.id) &&
    (m.status === 'pending' || m.status === 'active')
  );

  if (existing) {
    return res.status(400).json({
      success: false,
      error: '你已有进行中的师徒关系'
    } as ApiResponse<null>);
  }

  // 检查是否已向该师父发送过请求
  const pendingToMentor = mentorships.find(m =>
    m.menteeId === currentUser.id &&
    m.mentorId === mentorId &&
    m.status === 'pending'
  );

  if (pendingToMentor) {
    return res.status(400).json({
      success: false,
      error: '已向该师父发送过拜师请求'
    } as ApiResponse<null>);
  }

  // 创建拜师请求
  const mentorship: Mentorship = {
    id: uuidv4(),
    mentorId,
    menteeId: currentUser.id,
    status: 'pending',
    startDate: new Date().toISOString(),
    tasksCompleted: 0,
    totalTasks: 5,
    message: message || '恳请师父收我为徒！'
  };

  mentorships.push(mentorship);
  writeMentorships(mentorships);

  res.json({
    success: true,
    data: mentorship,
    message: '拜师请求已发送'
  } as ApiResponse<Mentorship>);
});

// 获取我的师徒关系
router.get('/my', requireAuth, (req: Request, res: Response) => {
  const currentUser = req.user!;
  const mentorships = readMentorships();

  // 我作为徒弟的关系
  const myMentor = mentorships.find(m =>
    m.menteeId === currentUser.id &&
    (m.status === 'pending' || m.status === 'active')
  );

  // 我作为师父的关系
  const myMentees = mentorships.filter(m =>
    m.mentorId === currentUser.id &&
    (m.status === 'pending' || m.status === 'active')
  );

  // 补充用户信息
  const enrichMentorship = (m: Mentorship): MentorshipWithUsers | null => {
    const mentor = getUserById(m.mentorId);
    const mentee = getUserById(m.menteeId);
    if (!mentor || !mentee) return null;

    return {
      ...m,
      mentor: {
        id: mentor.id,
        name: mentor.name,
        avatar: mentor.avatar,
        level: mentor.level
      },
      mentee: {
        id: mentee.id,
        name: mentee.name,
        avatar: mentee.avatar,
        level: mentee.level
      }
    };
  };

  res.json({
    success: true,
    data: {
      myMentor: myMentor ? enrichMentorship(myMentor) : null,
      myMentees: myMentees.map(enrichMentorship).filter(Boolean) as MentorshipWithUsers[],
      pendingRequests: mentorships.filter(m =>
        m.mentorId === currentUser.id && m.status === 'pending'
      ).map(enrichMentorship).filter(Boolean) as MentorshipWithUsers[]
    }
  } as ApiResponse<any>);
});

// 接受/拒绝拜师请求
router.patch('/respond/:id', requireAuth, (req: Request, res: Response) => {
  const currentUser = req.user!;
  const { id } = req.params;
  const { action } = req.body; // 'accept' | 'reject'

  const mentorships = readMentorships();
  const mentorship = mentorships.find(m => m.id === id);

  if (!mentorship) {
    return res.status(404).json({
      success: false,
      error: '师徒关系不存在'
    } as ApiResponse<null>);
  }

  // 只有师父可以处理请求
  if (mentorship.mentorId !== currentUser.id) {
    return res.status(403).json({
      success: false,
      error: '无权处理此请求'
    } as ApiResponse<null>);
  }

  if (mentorship.status !== 'pending') {
    return res.status(400).json({
      success: false,
      error: '该请求已处理'
    } as ApiResponse<null>);
  }

  if (action === 'accept') {
    mentorship.status = 'active';
  } else if (action === 'reject') {
    mentorship.status = 'cancelled';
    mentorship.endDate = new Date().toISOString();
  } else {
    return res.status(400).json({
      success: false,
      error: '无效的操作'
    } as ApiResponse<null>);
  }

  writeMentorships(mentorships);

  res.json({
    success: true,
    data: mentorship,
    message: action === 'accept' ? '已收为徒弟' : '已拒绝请求'
  } as ApiResponse<Mentorship>);
});

// 完成任务
router.post('/complete-task/:id', requireAuth, (req: Request, res: Response) => {
  const currentUser = req.user!;
  const { id } = req.params;

  const mentorships = readMentorships();
  const mentorship = mentorships.find(m => m.id === id);

  if (!mentorship) {
    return res.status(404).json({
      success: false,
      error: '师徒关系不存在'
    } as ApiResponse<null>);
  }

  // 师父或徒弟都可以标记任务完成
  if (mentorship.mentorId !== currentUser.id && mentorship.menteeId !== currentUser.id) {
    return res.status(403).json({
      success: false,
      error: '无权操作'
    } as ApiResponse<null>);
  }

  if (mentorship.status !== 'active') {
    return res.status(400).json({
      success: false,
      error: '师徒关系未激活'
    } as ApiResponse<null>);
  }

  if (mentorship.tasksCompleted >= mentorship.totalTasks) {
    return res.status(400).json({
      success: false,
      error: '所有任务已完成'
    } as ApiResponse<null>);
  }

  mentorship.tasksCompleted += 1;

  // 如果完成所有任务，自动结业
  if (mentorship.tasksCompleted >= mentorship.totalTasks) {
    mentorship.status = 'completed';
    mentorship.endDate = new Date().toISOString();
  }

  writeMentorships(mentorships);

  res.json({
    success: true,
    data: mentorship,
    message: mentorship.status === 'completed' ? '恭喜！师徒任务全部完成，顺利结业！' : '任务完成！'
  } as ApiResponse<Mentorship>);
});

// 解除师徒关系
router.delete('/:id', requireAuth, (req: Request, res: Response) => {
  const currentUser = req.user!;
  const { id } = req.params;

  const mentorships = readMentorships();
  const mentorship = mentorships.find(m => m.id === id);

  if (!mentorship) {
    return res.status(404).json({
      success: false,
      error: '师徒关系不存在'
    } as ApiResponse<null>);
  }

  // 师父或徒弟都可以解除关系
  if (mentorship.mentorId !== currentUser.id && mentorship.menteeId !== currentUser.id) {
    return res.status(403).json({
      success: false,
      error: '无权操作'
    } as ApiResponse<null>);
  }

  mentorship.status = 'cancelled';
  mentorship.endDate = new Date().toISOString();

  writeMentorships(mentorships);

  res.json({
    success: true,
    message: '师徒关系已解除'
  } as ApiResponse<null>);
});

export default router;
