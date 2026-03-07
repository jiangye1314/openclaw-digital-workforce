// ============================================
// 任务执行路由
// ============================================

import { Router } from 'express';
import { taskService } from '../services/tasks.js';
import { feishuService } from '../services/feishu.js';

const router = Router();

// 执行团队任务
router.post('/execute', async (req, res) => {
  try {
    const { teamId, task, context, priority, assigneeRole, notifyChannels } = req.body;

    if (!teamId || !task) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'teamId 和 task 为必填项' }
      });
    }

    const result = await taskService.executeTeamTask({
      teamId,
      task,
      context,
      priority: priority || 'medium',
      assigneeRole,
      notifyChannels
    });

    if (result.success) {
      res.status(202).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '执行任务失败'
      }
    });
  }
});

// 获取任务状态
router.get('/:taskId', (req, res) => {
  const task = taskService.getTask(req.params.taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: '任务不存在' }
    });
  }
  res.json({ success: true, data: task });
});

// 获取团队的所有任务
router.get('/team/:teamId', (req, res) => {
  const tasks = taskService.getTeamTasks(req.params.teamId);
  res.json({ success: true, data: tasks });
});

// 获取所有任务
router.get('/', (req, res) => {
  const tasks = taskService.getAllTasks();
  res.json({ success: true, data: tasks });
});

// 测试飞书连接
router.post('/feishu/test', async (req, res) => {
  const result = await feishuService.testConnection();
  res.json({ success: result.success, message: result.message });
});

// 检查飞书配置状态
router.get('/feishu/status', (req, res) => {
  res.json({
    success: true,
    data: {
      configured: feishuService.isConfigured(),
      webhookConfigured: !!process.env.FEISHU_WEBHOOK_URL,
      appConfigured: !!(process.env.FEISHU_APP_ID && process.env.FEISHU_APP_SECRET)
    }
  });
});

export default router;
