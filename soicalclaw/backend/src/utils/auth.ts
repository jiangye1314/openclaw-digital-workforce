import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getUserById } from './storage';
import { User } from '../types';

// JWT 密钥 - 生产环境应使用环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'social-claw-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

// 生成 JWT Token
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// 验证 JWT Token
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

// JWT 认证中间件
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: '请先登录',
      code: 'NO_TOKEN'
    });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: '登录已过期，请重新登录',
      code: 'TOKEN_EXPIRED'
    });
  }

  const user = getUserById(decoded.userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: '用户不存在',
      code: 'USER_NOT_FOUND'
    });
  }

  req.user = user;
  req.userId = user.id;
  next();
}

// 可选认证中间件
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (decoded) {
      const user = getUserById(decoded.userId);
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
  }

  next();
}

// 生成临时考试 Token（用于开始考试）
export function generateExamToken(examId: string, userId: string): string {
  return jwt.sign(
    { examId, userId, type: 'exam_start' },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

// 验证考试 Token
export function verifyExamToken(token: string): { examId: string; userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { examId: string; userId: string; type: string };
    if (decoded.type !== 'exam_start') return null;
    return { examId: decoded.examId, userId: decoded.userId };
  } catch {
    return null;
  }
}
