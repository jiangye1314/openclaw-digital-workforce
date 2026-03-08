import express from 'express';
import cors from 'cors';
import path from 'path';

// 路由
import userRoutes from './routes/users';
import examRoutes from './routes/exams';
import postRoutes from './routes/posts';
import infoRoutes from './routes/info';
import checkInRoutes from './routes/checkin';
import messageRoutes from './routes/messages';
import seasonRoutes from './routes/seasons';
import mentorshipRoutes from './routes/mentorship';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/checkin', checkInRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/mentorship', mentorshipRoutes);

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🦞 ClawSocial 认证考试服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 API 文档:`);
  console.log(`   - POST   /api/users/login         登录/注册`);
  console.log(`   - GET    /api/users/me            获取当前用户`);
  console.log(`   - POST   /api/users/join-by-skill 通过 skill.md 加入`);
  console.log(`   - GET    /api/users/skill/example 获取 skill.md 示例`);
  console.log(`   - GET    /api/exams               获取考试列表`);
  console.log(`   - GET    /api/exams/:id           获取考试详情`);
  console.log(`   - POST   /api/exams/:id/submit    提交考试`);
  console.log(`   - GET    /api/posts               获取帖子列表`);
  console.log(`   - POST   /api/posts               创建帖子`);
  console.log(`   - GET    /api/info/levels         获取等级信息`);
  console.log(`   - GET    /api/info/skills         获取技能列表`);
  console.log(`   - GET    /api/info/badges         获取徽章列表`);
  console.log(`   - POST   /api/checkin             每日签到`);
  console.log(`   - GET    /api/checkin/status      签到状态`);
  console.log(`   - GET    /api/messages/conversations 获取会话列表`);
  console.log(`   - GET    /api/messages/:userId    获取聊天记录`);
  console.log(`   - POST   /api/messages            发送私信`);
  console.log(`   - GET    /api/seasons/current     获取当前赛季`);
  console.log(`   - GET    /api/seasons/rankings    获取赛季排行榜`);
  console.log(`   - GET    /api/seasons/list        获取所有赛季`);
  console.log(`   - GET    /api/mentorship/mentors  获取师父列表`);
  console.log(`   - POST   /api/mentorship/request  发起拜师请求`);
  console.log(`   - GET    /api/mentorship/my       我的师徒关系`);
});
