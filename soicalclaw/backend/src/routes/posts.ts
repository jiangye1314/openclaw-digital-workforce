import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Post, Comment, ApiResponse } from '../types';
import { getAllPosts, getPostById, createPost, updatePost } from '../utils/storage';
import { getUserById } from '../utils/storage';
import { requireAuth, optionalAuth } from '../utils/auth';

const router = Router();

// 敏感词列表（简化版）
const SENSITIVE_WORDS = [
  '垃圾', '傻逼', '脑残', '他妈', '草泥马', '滚蛋', '去死', '诈骗', '赌博', '色情', '暴力',
  'fuck', 'shit', 'damn', 'ass', 'bitch', ' idiot', 'stupid'
];

// 发帖频率限制
const postRateLimit = new Map<string, { count: number; lastReset: number }>();

// 内容审核函数
function moderateContent(content: string): { clean: boolean; filtered: string; reason?: string } {
  let filtered = content;
  let hasSensitive = false;

  for (const word of SENSITIVE_WORDS) {
    const regex = new RegExp(word, 'gi');
    if (regex.test(filtered)) {
      hasSensitive = true;
      filtered = filtered.replace(regex, '***');
    }
  }

  // 检查链接（防止垃圾信息）
  const urlPattern = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/gi;
  const urls = filtered.match(urlPattern);
  if (urls && urls.length > 3) {
    return { clean: false, filtered, reason: '内容包含过多链接，疑似垃圾信息' };
  }

  // 检查重复字符（刷屏检测）
  const repeatPattern = /(.)\1{10,}/;
  if (repeatPattern.test(filtered)) {
    return { clean: false, filtered, reason: '内容包含重复字符，请勿刷屏' };
  }

  return { clean: !hasSensitive, filtered };
}

// 检查发帖频率
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1分钟窗口
  const maxPosts = 5; // 每分钟最多5帖

  const record = postRateLimit.get(userId);
  if (!record || now - record.lastReset > windowMs) {
    postRateLimit.set(userId, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= maxPosts) {
    return false;
  }

  record.count++;
  return true;
}

// 清理过期的频率限制记录
setInterval(() => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  for (const [userId, record] of postRateLimit.entries()) {
    if (now - record.lastReset > windowMs) {
      postRateLimit.delete(userId);
    }
  }
}, 5 * 60 * 1000); // 每5分钟清理一次

// 获取所有帖子
router.get('/', optionalAuth, (req: Request, res: Response) => {
  const { category, page = '1', limit = '20' } = req.query;

  let posts = getAllPosts();

  if (category) {
    posts = posts.filter(p => p.category === category);
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;

  const paginatedPosts = posts.slice(start, end).map(post => ({
    id: post.id,
    title: post.title,
    content: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
    category: post.category,
    tags: post.tags,
    likes: post.likes,
    commentCount: post.comments.length,
    createdAt: post.createdAt,
    author: getUserById(post.authorId)?.name || '未知用户',
    authorAvatar: getUserById(post.authorId)?.avatar
  }));

  res.json({
    success: true,
    data: {
      posts: paginatedPosts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: posts.length,
        totalPages: Math.ceil(posts.length / limitNum)
      }
    }
  } as ApiResponse<any>);
});

// 获取单个帖子
router.get('/:id', optionalAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const post = getPostById(id);

  if (!post) {
    return res.status(404).json({ success: false, error: '帖子不存在' } as ApiResponse<null>);
  }

  const author = getUserById(post.authorId);

  // 不返回敏感作者信息
  res.json({
    success: true,
    data: {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      tags: post.tags,
      likes: post.likes,
      createdAt: post.createdAt,
      author: author?.name || '未知用户',
      authorAvatar: author?.avatar,
      comments: post.comments.map(comment => {
        const commentAuthor = getUserById(comment.authorId);
        return {
          id: comment.id,
          content: comment.content,
          likes: comment.likes,
          createdAt: comment.createdAt,
          author: commentAuthor?.name || '未知用户',
          authorAvatar: commentAuthor?.avatar
        };
      })
    }
  } as ApiResponse<any>);
});

// 创建帖子
router.post('/', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;

  // 频率限制检查
  if (!checkRateLimit(user.id)) {
    return res.status(429).json({
      success: false,
      error: '发帖太频繁，请稍后再试',
      code: 'RATE_LIMITED'
    } as ApiResponse<null>);
  }

  const { title, content, category, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, error: '标题和内容不能为空' } as ApiResponse<null>);
  }

  // 内容长度检查
  if (title.trim().length < 2 || title.trim().length > 100) {
    return res.status(400).json({ success: false, error: '标题长度需在 2-100 字符之间' } as ApiResponse<null>);
  }

  if (content.trim().length < 5 || content.trim().length > 5000) {
    return res.status(400).json({ success: false, error: '内容长度需在 5-5000 字符之间' } as ApiResponse<null>);
  }

  // 内容审核
  const titleModeration = moderateContent(title.trim());
  const contentModeration = moderateContent(content.trim());

  if (!titleModeration.clean || !contentModeration.clean) {
    return res.status(400).json({
      success: false,
      error: '内容包含敏感词，请修改后重试',
      code: 'CONTENT_MODERATION_FAILED'
    } as ApiResponse<null>);
  }

  if (contentModeration.reason) {
    return res.status(400).json({
      success: false,
      error: contentModeration.reason,
      code: 'CONTENT_REJECTED'
    } as ApiResponse<null>);
  }

  const post: Post = {
    id: uuidv4(),
    authorId: user.id,
    title: titleModeration.filtered,
    content: contentModeration.filtered,
    category: category || 'discussion',
    tags: tags || [],
    likes: 0,
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  createPost(post);

  res.json({
    success: true,
    data: {
      id: post.id,
      title: post.title,
      content: post.content.substring(0, 200) + '...',
      createdAt: post.createdAt
    },
    message: '发布成功'
  } as ApiResponse<any>);
});

// 点赞帖子
router.post('/:id/like', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;

  const post = getPostById(id);
  if (!post) {
    return res.status(404).json({ success: false, error: '帖子不存在' } as ApiResponse<null>);
  }

  updatePost(id, { likes: post.likes + 1 });

  res.json({ success: true, message: '点赞成功' } as ApiResponse<null>);
});

// 添加评论
router.post('/:id/comments', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  const user = req.user!;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ success: false, error: '评论内容不能为空' } as ApiResponse<null>);
  }

  if (content.trim().length > 1000) {
    return res.status(400).json({ success: false, error: '评论内容不能超过 1000 字符' } as ApiResponse<null>);
  }

  // 内容审核
  const moderation = moderateContent(content.trim());

  if (!moderation.clean) {
    return res.status(400).json({
      success: false,
      error: '评论包含敏感词，请修改后重试',
      code: 'CONTENT_MODERATION_FAILED'
    } as ApiResponse<null>);
  }

  if (moderation.reason) {
    return res.status(400).json({
      success: false,
      error: moderation.reason,
      code: 'CONTENT_REJECTED'
    } as ApiResponse<null>);
  }

  const post = getPostById(id);
  if (!post) {
    return res.status(404).json({ success: false, error: '帖子不存在' } as ApiResponse<null>);
  }

  const comment: Comment = {
    id: uuidv4(),
    authorId: user.id,
    content: moderation.filtered,
    likes: 0,
    createdAt: new Date().toISOString()
  };

  updatePost(id, { comments: [...post.comments, comment] });

  res.json({
    success: true,
    data: {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt
    },
    message: '评论成功'
  } as ApiResponse<any>);
});

export default router;
