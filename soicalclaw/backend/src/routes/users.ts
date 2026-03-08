import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User, ApiResponse, Level } from '../types';
import { getAllUsers, getUserById, createUser, updateUser, getCurrentUser } from '../utils/storage';
import { getAllBadges } from '../data/badges';
import { LEVELS, getLevelProgress } from '../data/levels';
import { parseSkillFile, generateExampleSkillFile } from '../utils/skillParser';
import { requireAuth, generateToken } from '../utils/auth';

const router = Router();

// 获取当前登录用户
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;

  const levelInfo = LEVELS[user.level];
  const progress = getLevelProgress(user.experience, user.level);

  res.json({
    success: true,
    data: {
      ...user,
      levelInfo: {
        ...levelInfo,
        progress,
        nextLevelExp: levelInfo.nextLevel ? LEVELS[levelInfo.nextLevel].minExperience : null
      }
    }
  } as ApiResponse<any>);
});

// 创建/登录用户
router.post('/login', (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, error: '用户名至少需要2个字符' } as ApiResponse<null>);
  }

  // 查找或创建用户
  let user = getAllUsers().find(u => u.name === name.trim());

  if (!user) {
    user = createUser({
      id: uuidv4(),
      name: name.trim(),
      avatar: ['🦐', '🦞', '🦀', '🐙', '🦑', '🐡'][Math.floor(Math.random() * 6)],
      level: 'apprentice' as Level,
      experience: 0,
      completedExams: [],
      skills: [],
      badges: [],
      createdAt: new Date().toISOString()
    });
  }

  // 生成 JWT Token
  const token = generateToken(user.id);

  const levelInfo = LEVELS[user.level];
  const progress = getLevelProgress(user.experience, user.level);

  res.json({
    success: true,
    data: {
      user: {
        ...user,
        levelInfo: {
          ...levelInfo,
          progress,
          nextLevelExp: levelInfo.nextLevel ? LEVELS[levelInfo.nextLevel].minExperience : null
        }
      },
      token
    },
    message: '登录成功'
  } as ApiResponse<any>);
});

// 退出登录（客户端删除 Token 即可，服务器无需操作）
router.post('/logout', (req: Request, res: Response) => {
  // JWT 是无状态的，客户端删除 Token 即退出
  res.json({ success: true, message: '已退出登录' } as ApiResponse<null>);
});

// 获取所有用户（排行榜）
router.get('/leaderboard', (req: Request, res: Response) => {
  const users = getAllUsers()
    .sort((a, b) => b.experience - a.experience)
    .slice(0, 50)
    .map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      level: user.level,
      experience: user.experience,
      badges: user.badges.length
    }));

  res.json({ success: true, data: users } as ApiResponse<typeof users>);
});

// 获取单个用户信息
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = getUserById(id);

  if (!user) {
    return res.status(404).json({ success: false, error: '用户不存在' } as ApiResponse<null>);
  }

  const levelInfo = LEVELS[user.level];

  // 只返回公开信息
  res.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      level: user.level,
      levelName: levelInfo.name,
      levelTitle: levelInfo.title,
      experience: user.experience,
      badges: user.badges,
      skills: user.skills,
      completedExams: user.completedExams.length,
      createdAt: user.createdAt
    }
  } as ApiResponse<any>);
});

// 更新用户信息
router.patch('/me', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;

  const { avatar, bio } = req.body;
  const updates: Partial<User> = {};

  if (avatar) updates.avatar = avatar;

  const updated = updateUser(user.id, updates);
  res.json({ success: true, data: updated } as ApiResponse<typeof updated>);
});

// 通过 skill.md 加入社区
router.post('/join-by-skill', (req: Request, res: Response) => {
  const { skillContent } = req.body;

  if (!skillContent || skillContent.trim().length < 10) {
    return res.status(400).json({ success: false, error: '请提供有效的 skill.md 内容' } as ApiResponse<null>);
  }

  try {
    const skillFile = parseSkillFile(skillContent);

    // 检查用户是否已存在
    let user = getAllUsers().find(u => u.name === skillFile.name);

    if (user) {
      // 更新现有用户
      const updatedSkills = skillFile.skills.map(s => ({
        skillId: s.name,
        acquiredAt: new Date().toISOString(),
        verified: false
      }));

      updateUser(user.id, {
        level: skillFile.level,
        skills: updatedSkills
      });

      // 生成新的 Token
      const token = generateToken(user.id);

      return res.json({
        success: true,
        data: { user, skillFile, token },
        message: '欢迎回来！您的技能档案已更新。'
      } as ApiResponse<any>);
    }

    // 创建新用户
    const newUser: User = {
      id: uuidv4(),
      name: skillFile.name,
      avatar: skillFile.avatar,
      level: skillFile.level,
      experience: LEVELS[skillFile.level].minExperience,
      completedExams: [],
      skills: skillFile.skills.map(s => ({
        skillId: s.name,
        acquiredAt: new Date().toISOString(),
        verified: false
      })),
      badges: [],
      createdAt: new Date().toISOString()
    };

    createUser(newUser);

    // 生成 Token
    const token = generateToken(newUser.id);

    res.json({
      success: true,
      data: { user: newUser, skillFile, token },
      message: '欢迎加入 ClawSocial！您的技能档案已导入。'
    } as ApiResponse<any>);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: '解析 skill.md 失败: ' + (error as Error).message
    } as ApiResponse<null>);
  }
});

// 获取 skill.md 示例
router.get('/skill/example', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      content: generateExampleSkillFile(),
      description: '将以下内容保存为 skill.md 文件，修改后上传到社区即可导入您的技能档案。'
    }
  } as ApiResponse<any>);
});

export default router;
