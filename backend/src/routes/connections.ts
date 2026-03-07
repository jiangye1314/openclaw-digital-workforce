// ============================================
// OpenClaw 连接管理路由 - 支持本地和云端 Gateway
// ============================================

import { Router } from 'express';
import { openclawService } from '../services/openclaw.js';

const router = Router();

// 获取所有连接
router.get('/', async (req, res) => {
  const { type, status } = req.query;
  let connections;

  if (type) {
    connections = await openclawService.getConnectionsByType(type as any);
  } else {
    connections = await openclawService.getAllConnections();
  }

  // 按状态过滤
  if (status) {
    connections = connections.filter(c => c.status === status);
  }

  res.json({ success: true, data: connections });
});

// 获取连接统计
router.get('/stats/overview', async (req, res) => {
  const stats = await openclawService.getConnectionStats();
  res.json({ success: true, data: stats });
});

// 获取本地连接
router.get('/type/local', async (req, res) => {
  const connections = await openclawService.getLocalConnections();
  res.json({ success: true, data: connections });
});

// 获取云端连接
router.get('/type/cloud', async (req, res) => {
  const connections = await openclawService.getCloudConnections();
  res.json({ success: true, data: connections });
});

// 获取默认连接
router.get('/default/active', async (req, res) => {
  const connection = await openclawService.getDefaultConnection();
  if (!connection) {
    return res.status(404).json({
      success: false,
      error: { code: 'NO_DEFAULT', message: '没有设置默认连接' }
    });
  }
  res.json({ success: true, data: connection });
});

// 创建新连接
router.post('/', async (req, res) => {
  const { name, type, url, description, apiKey, tags, isDefault, customConfig } = req.body;

  if (!name || !type || !url) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: '缺少必要参数: name, type, url' }
    });
  }

  const result = await openclawService.createConnection({
    name,
    type,
    url,
    description,
    apiKey,
    tags,
    isDefault,
    customConfig
  });

  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
});

// 测试连接
router.post('/test', async (req, res) => {
  const { url, apiKey } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_URL', message: '缺少必要参数: url' }
    });
  }

  const result = await openclawService.testConnection(url, apiKey);
  res.json(result);
});

// 获取单个连接
router.get('/:id', async (req, res) => {
  const connection = await openclawService.getConnection(req.params.id);

  if (!connection) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: '连接不存在' }
    });
  }

  res.json({ success: true, data: connection });
});

// 更新连接
router.patch('/:id', async (req, res) => {
  const result = await openclawService.updateConnection(req.params.id, req.body);

  if (result.success) {
    res.json(result);
  } else if (result.error?.code === 'NOT_FOUND') {
    res.status(404).json(result);
  } else {
    res.status(400).json(result);
  }
});

// 手动触发健康检查
router.post('/:id/health-check', async (req, res) => {
  const result = await openclawService.runHealthCheck(req.params.id);

  if (result.success) {
    res.json(result);
  } else if (result.error?.code === 'NOT_FOUND') {
    res.status(404).json(result);
  } else {
    res.status(400).json(result);
  }
});

// 删除连接
router.delete('/:id', async (req, res) => {
  const result = await openclawService.deleteConnection(req.params.id);

  if (result.success) {
    res.status(204).send();
  } else {
    res.status(404).json(result);
  }
});

// 获取连接的技能列表
router.get('/:id/skills', async (req, res) => {
  const result = await openclawService.getAvailableSkills(req.params.id);

  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

// 发送消息
router.post('/:id/message', async (req, res) => {
  const { message, channel, threadId } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_MESSAGE', message: '缺少必要参数: message' }
    });
  }

  const result = await openclawService.sendMessage(req.params.id, message, {
    channel,
    threadId
  });

  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

export default router;
