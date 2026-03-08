import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAllExams, getExamById, canTakeExam } from '../data/exams';
import { LEVELS, getLevelByExperience, getLevelProgress } from '../data/levels';
import { createExamResult, getExamResultsByUser, updateUser, getUserById } from '../utils/storage';
import { ExamResult, ApiResponse } from '../types';
import { requireAuth, optionalAuth } from '../utils/auth';

const router = Router();

// 反作弊：记录考试开始时间和提交次数
const examSessions = new Map<string, { startTime: number; attempts: number }>();

// 清理过期会话（每30分钟清理一次）
setInterval(() => {
  const now = Date.now();
  const maxAge = 2 * 60 * 60 * 1000; // 2小时
  for (const [key, session] of examSessions.entries()) {
    if (now - session.startTime > maxAge) {
      examSessions.delete(key);
    }
  }
}, 30 * 60 * 1000);

// 获取所有考试
router.get('/', optionalAuth, (req: Request, res: Response) => {
  const user = req.user;
  const exams = getAllExams().map(exam => ({
    id: exam.id,
    level: exam.level,
    title: exam.title,
    description: exam.description,
    passingScore: exam.passingScore,
    timeLimit: exam.timeLimit,
    experienceReward: exam.experienceReward,
    prerequisites: exam.prerequisites,
    questionCount: exam.questions.length,
    canTake: user ? canTakeExam(exam.id, user.completedExams) : false,
    isCompleted: user ? user.completedExams.includes(exam.id) : false
  }));

  res.json({ success: true, data: exams } as ApiResponse<typeof exams>);
});

// 获取单个考试详情
router.get('/:id', optionalAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const exam = getExamById(id);

  if (!exam) {
    return res.status(404).json({ success: false, error: '考试不存在' } as ApiResponse<null>);
  }

  // 如果没有登录，返回基本信息
  if (!user) {
    return res.json({
      success: true,
      data: {
        id: exam.id,
        level: exam.level,
        title: exam.title,
        description: exam.description,
        passingScore: exam.passingScore,
        timeLimit: exam.timeLimit,
        experienceReward: exam.experienceReward,
        prerequisites: exam.prerequisites,
        questionCount: exam.questions.length
      }
    } as ApiResponse<any>);
  }

  // 检查是否可以参加
  const canTake = canTakeExam(id, user.completedExams);
  const isCompleted = user.completedExams.includes(id);

  // 如果可以参加，返回完整的题目（但不包含正确答案）
  if (canTake || isCompleted) {
    // 过滤掉正确答案，防止作弊
    const questionsWithoutAnswers = exam.questions.map(q => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options,
      points: q.points
      // 注意：不返回 correctAnswers
    }));

    // 记录考试开始时间（用于反作弊）
    const sessionKey = `${user.id}:${exam.id}`;
    if (!examSessions.has(sessionKey)) {
      examSessions.set(sessionKey, { startTime: Date.now(), attempts: 0 });
    }

    res.json({
      success: true,
      data: {
        id: exam.id,
        level: exam.level,
        title: exam.title,
        description: exam.description,
        passingScore: exam.passingScore,
        timeLimit: exam.timeLimit,
        experienceReward: exam.experienceReward,
        prerequisites: exam.prerequisites,
        questions: questionsWithoutAnswers,
        questionCount: exam.questions.length,
        canTake,
        isCompleted,
        // 如果已完成，显示分数但不显示答案
        lastScore: isCompleted ? getLastScore(user.id, exam.id) : undefined
      }
    } as ApiResponse<any>);
  } else {
    // 不能参加，只返回基本信息
    res.json({
      success: true,
      data: {
        id: exam.id,
        level: exam.level,
        title: exam.title,
        description: exam.description,
        passingScore: exam.passingScore,
        timeLimit: exam.timeLimit,
        experienceReward: exam.experienceReward,
        prerequisites: exam.prerequisites,
        questionCount: exam.questions.length,
        canTake: false,
        isCompleted: false,
        locked: true
      }
    } as ApiResponse<any>);
  }
});

// 辅助函数：获取上次考试分数
function getLastScore(userId: string, examId: string): number | undefined {
  const results = getExamResultsByUser(userId);
  const lastResult = results
    .filter(r => r.examId === examId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
  return lastResult?.score;
}

// 提交考试
router.post('/:id/submit', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { answers, timeSpent } = req.body;
  const user = req.user!;

  const exam = getExamById(id);
  if (!exam) {
    return res.status(404).json({ success: false, error: '考试不存在' } as ApiResponse<null>);
  }

  // 检查前置条件
  if (!canTakeExam(id, user.completedExams)) {
    return res.status(403).json({ success: false, error: '前置考试未完成' } as ApiResponse<null>);
  }

  // 反作弊检查
  const sessionKey = `${user.id}:${exam.id}`;
  const session = examSessions.get(sessionKey);

  // 1. 检查是否查看过考试
  if (!session) {
    return res.status(403).json({
      success: false,
      error: '请先获取考试题目后再提交',
      code: 'EXAM_NOT_STARTED'
    } as ApiResponse<null>);
  }

  // 2. 检查提交次数限制（最多3次）
  const existingResults = getExamResultsByUser(user.id).filter(r => r.examId === id);
  if (existingResults.length >= 3) {
    return res.status(403).json({
      success: false,
      error: '该考试已达到最大尝试次数（3次）',
      code: 'MAX_ATTEMPTS_REACHED'
    } as ApiResponse<null>);
  }

  // 3. 检查最小答题时间（至少10秒）
  const actualTimeSpent = timeSpent || Math.floor((Date.now() - session.startTime) / 1000);
  if (actualTimeSpent < 10) {
    return res.status(403).json({
      success: false,
      error: '答题时间过短，请认真答题后提交',
      code: 'TIME_TOO_SHORT'
    } as ApiResponse<null>);
  }

  // 4. 检查答题时间是否超过限制
  if (actualTimeSpent > exam.timeLimit * 60) {
    return res.status(403).json({
      success: false,
      error: '答题时间已超过限制',
      code: 'TIME_EXCEEDED'
    } as ApiResponse<null>);
  }

  // 增加尝试次数
  session.attempts++;

  // 计算分数
  let totalScore = 0;
  let maxScore = 0;
  const detailedResults = [];

  for (const question of exam.questions) {
    maxScore += question.points;
    const userAnswers = answers[question.id] || [];
    const isCorrect =
      userAnswers.length === question.correctAnswers.length &&
      userAnswers.every((a: string) => question.correctAnswers.includes(a));

    if (isCorrect) {
      totalScore += question.points;
    }

    // 记录详细结果（仅记录用户答案是否正确，不透露正确答案）
    detailedResults.push({
      questionId: question.id,
      isCorrect,
      points: isCorrect ? question.points : 0
    });
  }

  const score = Math.round((totalScore / maxScore) * 100);
  const passed = score >= exam.passingScore;

  // 保存考试结果
  const result: ExamResult = {
    id: uuidv4(),
    userId: user.id,
    examId: id,
    score,
    passed,
    answers,
    completedAt: new Date().toISOString(),
    timeSpent: actualTimeSpent,
    attemptNumber: existingResults.length + 1
  };
  createExamResult(result);

  // 如果通过考试，更新用户信息
  if (passed) {
    const newCompletedExams = [...user.completedExams, id];
    const newExperience = user.experience + exam.experienceReward;
    const newLevel = getLevelByExperience(newExperience);

    const updates: any = {
      completedExams: newCompletedExams,
      experience: newExperience
    };

    // 如果升级了
    if (newLevel !== user.level) {
      updates.level = newLevel;
    }

    updateUser(user.id, updates);

    // 返回详细结果
    const levelInfo = LEVELS[newLevel];
    const progress = getLevelProgress(newExperience, newLevel);

    res.json({
      success: true,
      data: {
        result: {
          score,
          passed,
          timeSpent: actualTimeSpent,
          attemptNumber: existingResults.length + 1
        },
        levelUp: newLevel !== user.level,
        newLevel: newLevel !== user.level ? {
          level: newLevel,
          name: levelInfo.name,
          title: levelInfo.title,
          icon: levelInfo.icon
        } : null,
        experience: {
          gained: exam.experienceReward,
          total: newExperience,
          progress,
          nextLevelExp: levelInfo.nextLevel ? LEVELS[levelInfo.nextLevel].minExperience : null
        }
      },
      message: passed ? `恭喜通过考试！获得${exam.experienceReward}经验值！` : '很遗憾，未通过考试，请再接再厉！'
    } as ApiResponse<any>);
  } else {
    res.json({
      success: true,
      data: {
        result: {
          score,
          passed,
          timeSpent: actualTimeSpent,
          attemptNumber: existingResults.length + 1
        }
      },
      message: '很遗憾，未通过考试，请再接再厉！'
    } as ApiResponse<any>);
  }
});

// 获取用户的考试历史
router.get('/user/history', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const results = getExamResultsByUser(user.id);

  // 不返回具体答案，只返回分数和通过状态
  const sanitizedResults = results.map(r => ({
    id: r.id,
    examId: r.examId,
    score: r.score,
    passed: r.passed,
    completedAt: r.completedAt,
    timeSpent: r.timeSpent,
    attemptNumber: r.attemptNumber || 1
  }));

  res.json({ success: true, data: sanitizedResults } as ApiResponse<typeof sanitizedResults>);
});

export default router;
