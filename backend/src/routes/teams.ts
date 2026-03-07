// ============================================
// 数字团队管理路由
// ============================================

import { Router } from 'express';
import { teamService } from '../services/teams.js';
import { openclawService } from '../services/openclaw.js';

const router = Router();

// 获取所有团队
router.get('/', (req, res) => {
  const { page = '1', pageSize = '10', search } = req.query;

  if (search) {
    const results = teamService.searchTeams(search as string);
    return res.json({ success: true, data: results });
  }

  const results = teamService.getTeamsPaginated(
    parseInt(page as string),
    parseInt(pageSize as string)
  );

  res.json({ success: true, data: results });
});

// 创建团队
router.post('/', async (req, res) => {
  try {
    const { connectionId, templateId, ...teamData } = req.body;

    // 查找连接信息
    let connection;
    if (connectionId) {
      connection = await openclawService.getConnection(connectionId);
    } else {
      const connections = await openclawService.getAllConnections();
      connection = connections[0]; // 使用第一个可用连接
    }

    if (!connection) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_CONNECTION', message: '未找到可用的 OpenClaw 连接' }
      });
    }

    const result = await teamService.createTeam({
      ...teamData,
      template: templateId,
      gatewayConnection: connection
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_TEAM_FAILED',
        message: error instanceof Error ? error.message : '创建团队失败'
      }
    });
  }
});

// 创建自定义团队
router.post('/custom', async (req, res) => {
  try {
    const { connectionId, ...teamData } = req.body;

    // 查找连接信息
    let connection;
    if (connectionId) {
      connection = await openclawService.getConnection(connectionId);
    } else {
      const connections = await openclawService.getAllConnections();
      connection = connections[0];
    }

    if (!connection) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_CONNECTION', message: '未找到可用的 OpenClaw 连接' }
      });
    }

    const result = await teamService.createCustomTeam({
      ...teamData,
      gatewayConnection: connection
    });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_CUSTOM_TEAM_FAILED',
        message: error instanceof Error ? error.message : '创建自定义团队失败'
      }
    });
  }
});

// 获取模板列表
router.get('/templates/list', (req, res) => {
  const templates = teamService.getTemplates();
  res.json({ success: true, data: templates });
});

// 获取单个团队
router.get('/:id', (req, res) => {
  const team = teamService.getTeam(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: '团队不存在' }
    });
  }

  res.json({ success: true, data: team });
});

// 更新团队
router.patch('/:id', async (req, res) => {
  const result = await teamService.updateTeam(req.params.id, req.body);

  if (result.success) {
    res.json(result);
  } else if (result.error?.code === 'NOT_FOUND') {
    res.status(404).json(result);
  } else {
    res.status(400).json(result);
  }
});

// 添加员工到团队
router.post('/:id/employees', async (req, res) => {
  const result = await teamService.addEmployeeToTeam(req.params.id, req.body);

  if (result.success) {
    res.status(201).json(result);
  } else if (result.error?.code === 'NOT_FOUND') {
    res.status(404).json(result);
  } else {
    res.status(400).json(result);
  }
});

// 从团队移除员工
router.delete('/:teamId/employees/:employeeId', async (req, res) => {
  const result = await teamService.removeEmployeeFromTeam(
    req.params.teamId,
    req.params.employeeId
  );

  if (result.success) {
    res.json(result);
  } else if (result.error?.code === 'NOT_FOUND') {
    res.status(404).json(result);
  } else {
    res.status(400).json(result);
  }
});

// 删除团队
router.delete('/:id', async (req, res) => {
  const result = await teamService.deleteTeam(req.params.id);

  if (result.success) {
    res.status(204).send();
  } else {
    res.status(404).json(result);
  }
});

// 团队协调 - 主代理驱动任务执行
router.post('/:id/orchestrate', async (req, res) => {
  try {
    const { requirement } = req.body;

    if (!requirement || typeof requirement !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUIREMENT', message: '需求描述不能为空' }
      });
    }

    // 获取团队信息
    const team = teamService.getTeam(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '团队不存在' }
      });
    }

    // 使用 orchestration 服务处理任务
    const result = await teamService.orchestrateTeamTask(team, requirement);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'ORCHESTRATION_FAILED',
        message: error instanceof Error ? error.message : '任务协调失败'
      }
    });
  }
});

export default router;
