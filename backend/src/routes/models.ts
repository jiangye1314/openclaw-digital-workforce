// ============================================
// AI 模型配置管理路由
// ============================================

import { Router } from 'express';
import { modelService } from '../services/models.js';

const router = Router();

// 获取所有模型配置
router.get('/', async (req, res) => {
  const models = await modelService.getAllModels();
  res.json({ success: true, data: models });
});

// 获取模型统计
router.get('/stats/overview', async (req, res) => {
  const stats = await modelService.getModelStats();
  res.json({ success: true, data: stats });
});

// 获取默认模型配置
router.get('/default', async (req, res) => {
  const model = await modelService.getDefaultModel();
  if (!model) {
    return res.status(404).json({
      success: false,
      error: { code: 'NO_DEFAULT', message: '没有设置默认模型' }
    });
  }
  res.json({ success: true, data: model });
});

// 创建新模型配置
router.post('/', async (req, res) => {
  const { name, provider, model, apiKey, baseUrl, description, isDefault } = req.body;

  if (!name || !provider || !model || !apiKey) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: '缺少必要参数: name, provider, model, apiKey' }
    });
  }

  const result = await modelService.createModel({
    name,
    provider,
    model,
    apiKey,
    baseUrl,
    description,
    isDefault
  });

  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
});

// 获取单个模型配置
router.get('/:id', async (req, res) => {
  const model = await modelService.getModel(req.params.id);

  if (!model) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: '模型配置不存在' }
    });
  }

  res.json({ success: true, data: model });
});

// 更新模型配置
router.patch('/:id', async (req, res) => {
  const result = await modelService.updateModel(req.params.id, req.body);

  if (result.success) {
    res.json(result);
  } else if (result.error?.code === 'NOT_FOUND') {
    res.status(404).json(result);
  } else {
    res.status(400).json(result);
  }
});

// 删除模型配置
router.delete('/:id', async (req, res) => {
  const result = await modelService.deleteModel(req.params.id);

  if (result.success) {
    res.status(204).send();
  } else {
    res.status(404).json(result);
  }
});

// 测试模型配置
router.post('/:id/test', async (req, res) => {
  const result = await modelService.testModel(req.params.id);

  if (result.success && result.data) {
    res.json({
      success: result.data.valid,
      message: result.data.message
    });
  } else {
    res.status(400).json(result);
  }
});

export default router;
