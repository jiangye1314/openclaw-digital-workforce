// ============================================
// 数字员工管理路由
// ============================================

import { Router } from 'express';
import { employeeService } from '../services/employees.js';
import { chatService } from '../services/chat.js';
import { ROLE_PRESETS, STATUS_COLORS, STATUS_LABELS } from '@openclaw-digital-workforce/shared';

const router = Router();

// 获取所有员工
router.get('/', (req, res) => {
  const { page = '1', pageSize = '10', role, status, search } = req.query;

  if (search) {
    const results = employeeService.searchEmployees(search as string);
    return res.json({ success: true, data: results });
  }

  if (role) {
    const results = employeeService.getEmployeesByRole(role as any);
    return res.json({ success: true, data: results });
  }

  if (status) {
    const results = employeeService.getEmployeesByStatus(status as any);
    return res.json({ success: true, data: results });
  }

  const results = employeeService.getEmployeesPaginated(
    parseInt(page as string),
    parseInt(pageSize as string)
  );

  res.json({ success: true, data: results });
});

// 创建员工
router.post('/', async (req, res) => {
  const result = await employeeService.createEmployee(req.body);

  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
});

// 批量创建员工
router.post('/batch', async (req, res) => {
  const { employees } = req.body;

  if (!Array.isArray(employees)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'employees 必须是数组' }
    });
  }

  const result = await employeeService.batchCreateEmployees(employees);

  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
});

// 获取角色预设
router.get('/roles/presets', (req, res) => {
  res.json({
    success: true,
    data: ROLE_PRESETS
  });
});

// 获取状态选项
router.get('/status/options', (req, res) => {
  res.json({
    success: true,
    data: {
      colors: STATUS_COLORS,
      labels: STATUS_LABELS
    }
  });
});

// 获取统计信息
router.get('/statistics/overview', (req, res) => {
  const roleStats = employeeService.getRoleStatistics();
  const statusStats = employeeService.getStatusStatistics();

  res.json({
    success: true,
    data: {
      byRole: roleStats,
      byStatus: statusStats,
      total: Object.values(roleStats).reduce((a, b) => a + b, 0)
    }
  });
});

// 获取单个员工
router.get('/:id', (req, res) => {
  const employee = employeeService.getEmployee(req.params.id);

  if (!employee) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: '员工不存在' }
    });
  }

  res.json({ success: true, data: employee });
});

// 更新员工
router.patch('/:id', async (req, res) => {
  const result = await employeeService.updateEmployee(req.params.id, req.body);

  if (result.success) {
    res.json(result);
  } else if (result.error?.code === 'NOT_FOUND') {
    res.status(404).json(result);
  } else {
    res.status(400).json(result);
  }
});

// 更新员工状态
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_STATUS', message: '缺少状态参数' }
    });
  }

  const result = await employeeService.updateStatus(req.params.id, status);

  if (result.success) {
    res.json(result);
  } else if (result.error?.code === 'NOT_FOUND') {
    res.status(404).json(result);
  } else {
    res.status(400).json(result);
  }
});

// 更新员工统计
router.patch('/:id/stats', async (req, res) => {
  const result = await employeeService.updateStats(req.params.id, req.body);

  if (result.success) {
    res.json(result);
  } else if (result.error?.code === 'NOT_FOUND') {
    res.status(404).json(result);
  } else {
    res.status(400).json(result);
  }
});

// 删除员工
router.delete('/:id', async (req, res) => {
  const result = await employeeService.deleteEmployee(req.params.id);

  if (result.success) {
    res.status(204).send();
  } else {
    res.status(404).json(result);
  }
});

// 获取员工聊天记录
router.get('/:id/chat', async (req, res) => {
  try {
    const history = await chatService.getChatHistory(req.params.id);
    res.json({ success: true, data: { messages: history } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CHAT_FAILED',
        message: error instanceof Error ? error.message : '获取聊天记录失败'
      }
    });
  }
});

// 发送消息给员工
router.post('/:id/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_MESSAGE', message: '消息内容不能为空' }
      });
    }

    // 获取员工信息
    const employee = employeeService.getEmployee(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '员工不存在' }
      });
    }

    // 发送消息并获取AI回复
    const result = await chatService.sendMessage(req.params.id, message, employee);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_ERROR',
        message: error instanceof Error ? error.message : '对话失败'
      }
    });
  }
});

// 清空聊天记录
router.delete('/:id/chat', async (req, res) => {
  try {
    await chatService.clearHistory(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CLEAR_CHAT_FAILED',
        message: error instanceof Error ? error.message : '清空聊天记录失败'
      }
    });
  }
});

export default router;
