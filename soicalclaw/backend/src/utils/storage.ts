import fs from 'fs';
import path from 'path';
import { User, ExamResult, Post, Message } from '../types';

const DATA_DIR = path.join(__dirname, '../../data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FILES = {
  users: path.join(DATA_DIR, 'users.json'),
  examResults: path.join(DATA_DIR, 'exam-results.json'),
  posts: path.join(DATA_DIR, 'posts.json'),
  currentUser: path.join(DATA_DIR, 'current-user.json'),
  checkIns: path.join(DATA_DIR, 'checkins.json'),
  messages: path.join(DATA_DIR, 'messages.json')
};

// 初始化数据文件
function initFile(filePath: string, defaultData: unknown = []): void {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

// 初始化所有数据文件
Object.values(FILES).forEach(file => initFile(file));
initFile(FILES.currentUser, null);

// 读取数据
function readData<T>(filePath: string): T {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    return (filePath === FILES.currentUser ? null : []) as T;
  }
}

// 写入数据
function writeData<T>(filePath: string, data: T): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ============ 用户数据操作 ============
export function getAllUsers(): User[] {
  return readData<User[]>(FILES.users);
}

export function getUserById(id: string): User | undefined {
  const users = getAllUsers();
  return users.find(u => u.id === id);
}

export function createUser(user: User): User {
  const users = getAllUsers();
  users.push(user);
  writeData(FILES.users, users);
  return user;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;

  users[index] = { ...users[index], ...updates };
  writeData(FILES.users, users);
  return users[index];
}

// ============ 当前用户操作 ============
export function getCurrentUser(): User | null {
  const userId = readData<string | null>(FILES.currentUser);
  if (!userId) return null;
  return getUserById(userId) || null;
}

export function setCurrentUser(userId: string | null): void {
  writeData(FILES.currentUser, userId);
}

// ============ 考试结果操作 ============
export function getAllExamResults(): ExamResult[] {
  return readData<ExamResult[]>(FILES.examResults);
}

export function getExamResultsByUser(userId: string): ExamResult[] {
  const results = getAllExamResults();
  return results.filter(r => r.userId === userId);
}

export function getExamResultById(id: string): ExamResult | undefined {
  const results = getAllExamResults();
  return results.find(r => r.id === id);
}

export function createExamResult(result: ExamResult): ExamResult {
  const results = getAllExamResults();
  results.push(result);
  writeData(FILES.examResults, results);
  return result;
}

export function updateExamResult(id: string, updates: Partial<ExamResult>): ExamResult | null {
  const results = getAllExamResults();
  const index = results.findIndex(r => r.id === id);
  if (index === -1) return null;

  results[index] = { ...results[index], ...updates };
  writeData(FILES.examResults, results);
  return results[index];
}

// ============ 帖子操作 ============
export function getAllPosts(): Post[] {
  return readData<Post[]>(FILES.posts);
}

export function getPostById(id: string): Post | undefined {
  const posts = getAllPosts();
  return posts.find(p => p.id === id);
}

export function getPostsByCategory(category: string): Post[] {
  const posts = getAllPosts();
  return posts.filter(p => p.category === category);
}

export function createPost(post: Post): Post {
  const posts = getAllPosts();
  posts.unshift(post);
  writeData(FILES.posts, posts);
  return post;
}

export function updatePost(id: string, updates: Partial<Post>): Post | null {
  const posts = getAllPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return null;

  posts[index] = { ...posts[index], ...updates };
  writeData(FILES.posts, posts);
  return posts[index];
}

// ============ 统计数据 ============
export function getStats() {
  const users = getAllUsers();
  const examResults = getAllExamResults();
  const posts = getAllPosts();

  return {
    totalUsers: users.length,
    totalExamsTaken: examResults.length,
    totalPosts: posts.length,
    passRate: examResults.length > 0
      ? Math.round((examResults.filter(r => r.passed).length / examResults.length) * 100)
      : 0
  };
}

// ============ 签到数据操作 ============
interface CheckInData {
  userId: string;
  lastCheckIn: string;
  streak: number;
  totalCheckIns: number;
  checkInHistory: string[];
}

export function getAllCheckIns(): CheckInData[] {
  return readData<CheckInData[]>(FILES.checkIns);
}

export function getCheckInData(userId: string): CheckInData {
  const allCheckIns = getAllCheckIns();
  const checkIn = allCheckIns.find(c => c.userId === userId);

  if (!checkIn) {
    // 创建默认签到数据
    const newCheckIn: CheckInData = {
      userId,
      lastCheckIn: '',
      streak: 0,
      totalCheckIns: 0,
      checkInHistory: []
    };
    allCheckIns.push(newCheckIn);
    writeData(FILES.checkIns, allCheckIns);
    return newCheckIn;
  }

  return checkIn;
}

export function updateCheckIn(userId: string, date: string, streak: number): CheckInData {
  const allCheckIns = getAllCheckIns();
  const index = allCheckIns.findIndex(c => c.userId === userId);

  if (index === -1) {
    const newCheckIn: CheckInData = {
      userId,
      lastCheckIn: date,
      streak,
      totalCheckIns: 1,
      checkInHistory: [date]
    };
    allCheckIns.push(newCheckIn);
    writeData(FILES.checkIns, allCheckIns);
    return newCheckIn;
  }

  allCheckIns[index] = {
    ...allCheckIns[index],
    lastCheckIn: date,
    streak,
    totalCheckIns: (allCheckIns[index].totalCheckIns || 0) + 1
  };

  writeData(FILES.checkIns, allCheckIns);
  return allCheckIns[index];
}

export function updateCheckInData(userId: string, updates: Partial<CheckInData>): CheckInData | null {
  const allCheckIns = getAllCheckIns();
  const index = allCheckIns.findIndex(c => c.userId === userId);

  if (index === -1) return null;

  allCheckIns[index] = { ...allCheckIns[index], ...updates };
  writeData(FILES.checkIns, allCheckIns);
  return allCheckIns[index];
}

// ============ 私信数据操作 ============
export function getAllMessages(): Message[] {
  return readData<Message[]>(FILES.messages);
}

export function getMessagesBetweenUsers(userId1: string, userId2: string): Message[] {
  const messages = getAllMessages();
  return messages
    .filter(m =>
      (m.fromUserId === userId1 && m.toUserId === userId2) ||
      (m.fromUserId === userId2 && m.toUserId === userId1)
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function getConversationsForUser(userId: string): Array<{
  userId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}> {
  const messages = getAllMessages();
  const conversations = new Map<string, { lastMessage: string; lastMessageTime: string; unreadCount: number }>();

  messages.forEach(m => {
    const otherUserId = m.fromUserId === userId ? m.toUserId : m.fromUserId;
    if (m.fromUserId !== userId && m.toUserId !== userId) return;

    const existing = conversations.get(otherUserId);
    const messageTime = new Date(m.createdAt).getTime();
    const existingTime = existing ? new Date(existing.lastMessageTime).getTime() : 0;

    if (!existing || messageTime > existingTime) {
      conversations.set(otherUserId, {
        lastMessage: m.content,
        lastMessageTime: m.createdAt,
        unreadCount: (existing?.unreadCount || 0) + (m.toUserId === userId && !m.read ? 1 : 0)
      });
    } else if (m.toUserId === userId && !m.read) {
      conversations.set(otherUserId, {
        ...existing,
        unreadCount: existing.unreadCount + 1
      });
    }
  });

  return Array.from(conversations.entries())
    .map(([uid, data]) => ({ userId: uid, ...data }))
    .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
}

export function createMessage(message: Message): Message {
  const messages = getAllMessages();
  messages.push(message);
  writeData(FILES.messages, messages);
  return message;
}

export function markMessagesAsRead(fromUserId: string, toUserId: string): void {
  const messages = getAllMessages();
  let updated = false;

  messages.forEach(m => {
    if (m.fromUserId === fromUserId && m.toUserId === toUserId && !m.read) {
      m.read = true;
      updated = true;
    }
  });

  if (updated) {
    writeData(FILES.messages, messages);
  }
}
