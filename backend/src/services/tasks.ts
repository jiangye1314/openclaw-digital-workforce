// ============================================
// 任务执行服务 - 数字员工通过 Kimi API 执行任务
// OpenClaw 用于状态监控
// ============================================

import type { DigitalEmployee, DigitalTeam, ApiResponse } from '@openclaw-digital-workforce/shared';
import { employeeService } from './employees.js';
import { teamService } from './teams.js';
import { feishuService } from './feishu.js';
import { storageService } from './storage.js';

const STORAGE_KEY = 'tasks';
const COUNTER_KEY = 'task-counter';

export interface TaskRequest {
  teamId: string;
  task: string;
  context?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigneeRole?: string;
  notifyChannels?: string[];
}

export interface TaskResult {
  taskId: string;
  teamId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  assignees: string[];
  result?: {
    summary: string;
    details: string;
    outputs?: Record<string, unknown>;
  };
  startedAt: string;
  completedAt?: string;
}

// Kimi API 配置
const KIMI_API_KEY = 'sk-kimi-xMy2WMz9zlPAfX4rqhEnUAxbKFuqm4nFB7J9kYE2DYZ8ylLFhh5NDo4sB6vroIMd';
const KIMI_BASE_URL = 'https://api.kimi.com/coding/';

export class TaskService {
  private tasks: Map<string, TaskResult> = new Map();
  private taskCounter = 0;
  private initialized = false;

  // 初始化 - 从文件加载数据
  async init(): Promise<void> {
    if (this.initialized) return;

    const data = await storageService.loadMap<TaskResult>(STORAGE_KEY);
    this.tasks = data;

    const counter = await storageService.load<{ counter: number }>(COUNTER_KEY, { counter: 0 });
    this.taskCounter = counter.counter;

    this.initialized = true;
    console.log(`[TaskService] 已加载 ${data.size} 个任务数据`);
  }

  // 保存数据到文件
  private async save(): Promise<void> {
    await storageService.saveMap(STORAGE_KEY, this.tasks, { pretty: true });
    await storageService.save(COUNTER_KEY, { counter: this.taskCounter });
  }

  // 确保已初始化
  private async ensureInit(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  // 生成任务ID
  private async generateTaskId(): Promise<string> {
    this.taskCounter++;
    await this.saveCounter();
    return `TASK-${Date.now()}-${String(this.taskCounter).padStart(4, '0')}`;
  }

  // 保存计数器
  private async saveCounter(): Promise<void> {
    await storageService.save(COUNTER_KEY, { counter: this.taskCounter });
  }

  // 执行团队任务
  async executeTeamTask(request: TaskRequest): Promise<ApiResponse<TaskResult>> {
    await this.ensureInit();
    try {
      const team = teamService.getTeam(request.teamId);
      if (!team) {
        return {
          success: false,
          error: { code: 'TEAM_NOT_FOUND', message: '团队不存在' }
        };
      }

      const taskId = await this.generateTaskId();
      const now = new Date().toISOString();

      // 确定执行人
      let assignees: DigitalEmployee[] = [];
      if (request.assigneeRole) {
        assignees = team.employees.filter(e => e.role === request.assigneeRole);
      }
      if (assignees.length === 0) {
        const coordinator = team.config.coordinatorId
          ? team.employees.find(e => e.id === team.config.coordinatorId)
          : null;
        assignees = coordinator ? [coordinator] : team.employees.slice(0, 1);
      }

      // 创建任务记录
      const taskResult: TaskResult = {
        taskId,
        teamId: request.teamId,
        status: 'processing',
        assignees: assignees.map(e => e.id),
        startedAt: now
      };
      this.tasks.set(taskId, taskResult);
      await this.save();

      // 更新员工状态为忙碌
      for (const emp of assignees) {
        await employeeService.updateStatus(emp.id, 'busy');
      }

      // 发送飞书通知
      if (request.notifyChannels?.includes('feishu')) {
        await feishuService.sendTaskNotification({
          taskId,
          teamName: team.name,
          task: request.task,
          assignees: assignees.map(e => e.name),
          priority: request.priority || 'medium'
        });
      }

      // 异步执行任务
      this.processTask(taskId, request, team, assignees);

      return { success: true, data: taskResult };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EXECUTE_TASK_FAILED',
          message: error instanceof Error ? error.message : '执行任务失败'
        }
      };
    }
  }

  // 处理任务（通过 Kimi API）
  private async processTask(
    taskId: string,
    request: TaskRequest,
    team: DigitalTeam,
    assignees: DigitalEmployee[]
  ): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    try {
      console.log(`[TaskService] 执行任务: ${taskId}`);

      const assignee = assignees[0];

      // 构建系统提示词
      const systemPrompt = `你是数字员工团队「${team.name}」的成员。
角色：${assignee.roleName} (${assignee.name})
工牌号：${assignee.badgeNumber}
职责：${assignee.responsibilities?.join('、') || '完成团队分配的任务'}

请使用 ${assignee.openclawConfig.skills?.join('、') || 'coding-agent'} 等技能来完成任务。

你是由 Kimi Coding 驱动的 AI 助手，请提供高质量的代码和详细的解释。`;

      const userMessage = `【任务】${request.task}
${request.context ? `【背景】${request.context}` : ''}
【优先级】${request.priority || 'medium'}
【团队】${team.name}
【执行人】${assignees.map(e => `${e.name}(${e.roleName})`).join(', ')}`;

      // 调用 Kimi API
      const result = await this.callKimiAPI({
        systemPrompt,
        userMessage,
        model: 'kimi-coding'
      });

      // 更新任务结果
      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date().toISOString();

      // 更新员工状态
      for (const emp of assignees) {
        await employeeService.updateStatus(emp.id, 'idle');
        await employeeService.updateStats(emp.id, {
          tasksCompleted: (emp.stats.tasksCompleted || 0) + 1,
          lastActive: new Date().toISOString()
        });
      }

      // 发送完成通知
      if (request.notifyChannels?.includes('feishu')) {
        await feishuService.sendTaskCompletedNotification({
          taskId,
          teamName: team.name,
          task: request.task,
          result: result.summary
        });
      }

      console.log(`[TaskService] 任务完成: ${taskId}`);
    } catch (error) {
      task.status = 'failed';
      task.completedAt = new Date().toISOString();

      // 恢复员工状态
      for (const emp of assignees) {
        await employeeService.updateStatus(emp.id, 'idle');
      }

      console.error(`[TaskService] 任务执行失败: ${taskId}`, error);
    }

    this.tasks.set(taskId, task);
    await this.save();
  }

  // 调用 Kimi API
  private async callKimiAPI(params: {
    systemPrompt: string;
    userMessage: string;
    model: string;
  }): Promise<{ summary: string; details: string; outputs?: Record<string, unknown> }> {
    console.log('[TaskService] 调用 Kimi API');

    const response = await fetch(`${KIMI_BASE_URL}v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`,
        'x-api-key': KIMI_API_KEY,
      },
      body: JSON.stringify({
        model: params.model,
        messages: [
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: params.userMessage }
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      throw new Error(`Kimi API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '无返回内容';

    return {
      summary: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
      details: content,
      outputs: {
        tokensUsed: data.usage?.total_tokens,
        model: data.model,
        via: 'kimi-coding'
      }
    };
  }

  // 获取任务状态
  getTask(taskId: string): TaskResult | undefined {
    return this.tasks.get(taskId);
  }

  // 获取团队的所有任务
  getTeamTasks(teamId: string): TaskResult[] {
    return Array.from(this.tasks.values()).filter(t => t.teamId === teamId);
  }

  // 获取所有任务
  getAllTasks(): TaskResult[] {
    return Array.from(this.tasks.values());
  }
}

export const taskService = new TaskService();
