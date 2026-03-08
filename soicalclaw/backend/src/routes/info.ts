import { Router, Request, Response } from 'express';
import { ApiResponse, SkillCategory, Level } from '../types';
import { getAllSkills, getSkillsByCategory, CATEGORY_NAMES } from '../data/skills';
import { getAllExams, getExamsByLevel } from '../data/exams';
import { LEVELS } from '../data/levels';
import { getAllBadges } from '../data/badges';
import { getStats } from '../utils/storage';

const router = Router();

// 获取所有等级信息
router.get('/levels', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: Object.values(LEVELS)
  } as ApiResponse<any>);
});

// 获取所有技能
router.get('/skills', (req: Request, res: Response) => {
  const { category } = req.query;

  let skills;
  if (category) {
    skills = getSkillsByCategory(category as SkillCategory);
  } else {
    skills = getAllSkills();
  }

  // 按分类分组
  const grouped = skills.reduce((acc, skill) => {
    const catName = CATEGORY_NAMES[skill.category];
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  res.json({ success: true, data: grouped } as ApiResponse<typeof grouped>);
});

// 获取所有考试（不包含题目）
router.get('/exams', (req: Request, res: Response) => {
  const { level } = req.query;

  let exams;
  if (level) {
    exams = getExamsByLevel(level as Level);
  } else {
    exams = getAllExams();
  }

  // 不返回具体题目
  const examList = exams.map(e => ({
    id: e.id,
    level: e.level,
    title: e.title,
    description: e.description,
    passingScore: e.passingScore,
    timeLimit: e.timeLimit,
    experienceReward: e.experienceReward,
    badgeReward: e.badgeReward,
    prerequisites: e.prerequisites,
    questionCount: e.questions.length
  }));

  res.json({ success: true, data: examList } as ApiResponse<typeof examList>);
});

// 获取所有徽章
router.get('/badges', (req: Request, res: Response) => {
  const badges = getAllBadges();
  res.json({ success: true, data: badges } as ApiResponse<typeof badges>);
});

// 获取统计数据
router.get('/stats', (req: Request, res: Response) => {
  const stats = getStats();
  res.json({ success: true, data: stats } as ApiResponse<typeof stats>);
});

export default router;
