// ============================================
// 今天我是虾老板 - 后端服务
// ============================================

import 'dotenv/config'; // 加载 .env 文件
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import chalk from 'chalk';

import connectionsRouter from './routes/connections.js';
import employeesRouter from './routes/employees.js';
import teamsRouter from './routes/teams.js';
import tasksRouter from './routes/tasks.js';
import modelsRouter from './routes/models.js';
import { openclawService } from './services/openclaw.js';
import { employeeService } from './services/employees.js';
import { teamService } from './services/teams.js';
import { taskService } from './services/tasks.js';
import { chatService } from './services/chat.js';
import { modelService } from './services/models.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 3456;

// 中间件
app.use(cors());
app.use(express.json());

// 日志中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(chalk.gray(`[${timestamp}]`), chalk.blue(req.method), req.path);
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// API 路由
app.use('/api/connections', connectionsRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/models', modelsRouter);

// WebSocket 连接处理
wss.on('connection', (ws) => {
  console.log(chalk.green('WebSocket 客户端已连接'));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('收到消息:', data);

      // 广播消息给所有客户端
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({
            type: 'broadcast',
            timestamp: new Date().toISOString(),
            payload: data
          }));
        }
      });
    } catch (error) {
      console.error(chalk.red('解析消息失败:'), error);
    }
  });

  ws.on('close', () => {
    console.log(chalk.yellow('WebSocket 客户端已断开'));
  });

  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'connected',
    timestamp: new Date().toISOString(),
    payload: { message: '已连接到今天我是虾老板系统' }
  }));
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: '接口不存在' }
  });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(chalk.red('错误:'), err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' }
  });
});

// 自动创建本地 OpenClaw 连接 (使用 Kimi Coding Plan)
async function setupLocalOpenClaw() {
  const localOpenClawUrl = process.env.OPENCLAW_URL || 'http://localhost:3457';

  // 检查 Kimi 配置
  const kimiConfigured = process.env.KIMI_API_KEY;
  if (kimiConfigured) {
    console.log(chalk.cyan('\n🤖 检测到 Kimi Coding Plan 配置'));
  }

  // 检查是否已有本地连接
  const existingConnections = await openclawService.getAllConnections();
  const hasLocalConnection = existingConnections.some(
    c => c.url === localOpenClawUrl
  );

  if (!hasLocalConnection) {
    console.log(chalk.yellow('\n正在连接本地 OpenClaw...'));

    // 等待本地 OpenClaw 启动
    let retries = 0;
    const maxRetries = 30;

    while (retries < maxRetries) {
      const result = await openclawService.createConnection({
        name: '本地 OpenClaw',
        type: 'local',
        url: localOpenClawUrl,
        description: '本地 OpenClaw 实例',
        isDefault: true
      });

      if (result.success) {
        console.log(chalk.green(`✓ 已连接到本地 OpenClaw (${localOpenClawUrl})`));
        console.log(chalk.gray(`  连接 ID: ${result.data?.id}`));
        break;
      }

      retries++;
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (retries >= maxRetries) {
      console.log(chalk.yellow('\n⚠ 本地 OpenClaw 未启动，跳过自动连接'));
      console.log(chalk.gray('  如需使用本地 OpenClaw，请运行: pnpm dev:openclaw'));
    }
  }
}

// 初始化所有服务
async function initializeServices() {
  console.log(chalk.yellow('\n正在初始化服务...'));
  await openclawService.init();
  await employeeService.init();
  await teamService.init();
  await taskService.init();
  await chatService.init();
  await modelService.init();
  console.log(chalk.green('✓ 服务初始化完成'));
}

// 显示连接统计
async function showConnectionStats() {
  const stats = await openclawService.getConnectionStats();
  if (stats.total > 0) {
    console.log(chalk.cyan('\n📊 OpenClaw 连接统计:'));
    console.log(chalk.gray(`  总计: ${stats.total} | 正常: ${stats.connected} | 异常: ${stats.error}`));
    console.log(chalk.gray(`  本地: ${stats.local} | 云端: ${stats.cloud} | 混合: ${stats.hybrid}`));
  }
}

// 启动服务器
server.listen(PORT, async () => {
  console.log(chalk.green.bold('\n🦞 今天我是虾老板 (OpenClaw Digital Workforce)'));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.white(`API 服务: http://localhost:${PORT}`));
  console.log(chalk.white(`WebSocket: ws://localhost:${PORT}/ws`));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  // 初始化服务
  await initializeServices();

  // 设置本地 OpenClaw 连接
  await setupLocalOpenClaw();

  // 显示连接统计
  await showConnectionStats();
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n正在关闭服务器...'));
  server.close(() => {
    console.log(chalk.green('服务器已关闭'));
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n正在关闭服务器...'));
  server.close(() => {
    console.log(chalk.green('服务器已关闭'));
    process.exit(0);
  });
});
