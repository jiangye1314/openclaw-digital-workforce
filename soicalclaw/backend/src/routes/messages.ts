import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, Message, Conversation } from '../types';
import { requireAuth } from '../utils/auth';
import {
  getMessagesBetweenUsers,
  getConversationsForUser,
  createMessage,
  markMessagesAsRead,
  getUserById
} from '../utils/storage';

const router = Router();

// 获取当前用户的会话列表 - 必须在 /:userId 之前定义
router.get('/conversations', requireAuth, (req: Request, res: Response) => {
  const currentUser = req.user!;
  const conversations = getConversationsForUser(currentUser.id);

  // 补充用户信息
  const conversationsWithUserInfo: Conversation[] = conversations.map(c => {
    const user = getUserById(c.userId);
    return {
      userId: c.userId,
      userName: user?.name || '未知用户',
      userAvatar: user?.avatar || '👤',
      lastMessage: c.lastMessage,
      lastMessageTime: c.lastMessageTime,
      unreadCount: c.unreadCount
    };
  });

  res.json({
    success: true,
    data: conversationsWithUserInfo
  } as ApiResponse<Conversation[]>);
});

// 获取与指定用户的聊天记录
router.get('/:userId', requireAuth, (req: Request, res: Response) => {
  const currentUser = req.user!;
  const { userId } = req.params;

  // 检查对方用户是否存在
  const otherUser = getUserById(userId);
  if (!otherUser) {
    return res.status(404).json({
      success: false,
      error: '用户不存在'
    } as ApiResponse<null>);
  }

  // 获取聊天记录
  const messages = getMessagesBetweenUsers(currentUser.id, userId);

  // 标记消息为已读
  markMessagesAsRead(userId, currentUser.id);

  res.json({
    success: true,
    data: {
      messages,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
        avatar: otherUser.avatar,
        level: otherUser.level
      }
    }
  } as ApiResponse<any>);
});

// 发送私信
router.post('/', requireAuth, (req: Request, res: Response) => {
  const currentUser = req.user!;
  const { toUserId, content } = req.body;

  if (!toUserId || !content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: '请提供接收者ID和消息内容'
    } as ApiResponse<null>);
  }

  // 检查对方用户是否存在
  const otherUser = getUserById(toUserId);
  if (!otherUser) {
    return res.status(404).json({
      success: false,
      error: '接收者不存在'
    } as ApiResponse<null>);
  }

  // 不能给自己发消息
  if (toUserId === currentUser.id) {
    return res.status(400).json({
      success: false,
      error: '不能给自己发送私信'
    } as ApiResponse<null>);
  }

  // 内容长度限制
  if (content.length > 1000) {
    return res.status(400).json({
      success: false,
      error: '消息内容不能超过1000字'
    } as ApiResponse<null>);
  }

  // 创建消息
  const message: Message = {
    id: uuidv4(),
    fromUserId: currentUser.id,
    toUserId,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    read: false
  };

  createMessage(message);

  res.json({
    success: true,
    data: message,
    message: '发送成功'
  } as ApiResponse<Message>);
});

export default router;
