// ============================================
// 数字团队管理服务
// ============================================

import type {
  DigitalTeam,
  DigitalEmployee,
  TeamTemplate,
  ApiResponse,
  PaginatedResponse,
  EmployeeRole,
  GatewayType,
  OpenClawConnection
} from '@openclaw-digital-workforce/shared';
import { TEAM_TEMPLATES } from '@openclaw-digital-workforce/shared';
import { employeeService, CreateEmployeeInput } from './employees.js';
import { storageService } from './storage.js';
import { openclawService } from './openclaw.js';

const STORAGE_KEY = 'teams';

export interface CreateTeamInput {
  name: string;
  description?: string;
  template: TeamTemplate;
  gatewayConnection: OpenClawConnection;
  size?: number; // 团队规模，用于自动生成员工
}

export interface CreateCustomTeamInput {
  name: string;
  description?: string;
  employees: Array<{
    name: string;
    role: EmployeeRole;
  }>;
  gatewayConnection: OpenClawConnection;
  config?: {
    autoAssign?: boolean;
    collaborationMode?: 'parallel' | 'sequential' | 'hybrid';
  };
}

export class TeamService {
  private teams: Map<string, DigitalTeam> = new Map();
  private initialized = false;

  // 初始化 - 从文件加载数据
  async init(): Promise<void> {
    if (this.initialized) return;

    // 先初始化员工服务
    await employeeService.init();

    const data = await storageService.loadMap<DigitalTeam>(STORAGE_KEY);
    this.teams = data;

    this.initialized = true;
    console.log(`[TeamService] 已加载 ${data.size} 个团队数据`);
  }

  // 保存数据到文件
  private async save(): Promise<void> {
    await storageService.saveMap(STORAGE_KEY, this.teams, { pretty: true });
  }

  // 确保已初始化
  private async ensureInit(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  // 获取模板配置
  private getTemplateConfig(template: TeamTemplate) {
    return TEAM_TEMPLATES.find(t => t.template === template);
  }

  // 获取默认模型配置（优先使用 Kimi Coding Plan）
  private getDefaultModelConfig(): { model: string; baseUrl?: string; apiKey?: string } {
    // 优先使用 Kimi Coding Plan
    if (process.env.KIMI_API_KEY) {
      return {
        model: 'kimi-coding',
        baseUrl: process.env.KIMI_BASE_URL || 'https://api.kimi.com/coding/',
        apiKey: process.env.KIMI_API_KEY
      };
    }
    // 回退到 Claude
    if (process.env.ANTHROPIC_API_KEY) {
      return {
        model: 'claude-3-opus',
        apiKey: process.env.ANTHROPIC_API_KEY
      };
    }
    // 默认模型
    return { model: 'claude-3-haiku' };
  }

  // 根据模板生成员工配置
  private generateEmployeeConfigsFromTemplate(
    template: TeamTemplate,
    size: number,
    gatewayConnection: OpenClawConnection
  ): CreateEmployeeInput[] {
    const templateConfig = this.getTemplateConfig(template);
    if (!templateConfig) return [];

    const configs: CreateEmployeeInput[] = [];
    const roles = templateConfig.defaultRoles;
    const modelConfig = this.getDefaultModelConfig();

    // 确保有协调员
    if (templateConfig.structure.requiresCoordinator && !roles.includes('manager')) {
      roles.unshift('manager');
    }

    // 根据团队大小分配角色
    const employeesPerRole = Math.floor(size / roles.length);
    const remainder = size % roles.length;

    roles.forEach((role, index) => {
      const count = employeesPerRole + (index < remainder ? 1 : 0);
      for (let i = 0; i < count; i++) {
        const roleName = i === 0 && role === 'manager' ? '团队负责人' : undefined;
        configs.push({
          name: this.generateEmployeeName(role, i),
          role,
          roleName,
          department: templateConfig.name,
          gatewayUrl: gatewayConnection.url,
          gatewayType: gatewayConnection.type as GatewayType,
          apiKey: gatewayConnection.config.apiKey,
          skills: templateConfig.recommendedSkills,
          theme: this.getThemeForTemplate(template),
          model: modelConfig.model,
          modelConfig: {
            baseUrl: modelConfig.baseUrl,
            apiKey: modelConfig.apiKey
          }
        });
      }
    });

    return configs.slice(0, size);
  }

  // 生成员工名称
  private generateEmployeeName(role: EmployeeRole, index: number): string {
    const prefixes: Record<EmployeeRole, string[]> = {
      manager: ['张经理', '李经理', '王经理', '赵经理'],
      developer: ['陈工程师', '刘工程师', '杨工程师', '黄工程师', '周工程师', '吴工程师'],
      designer: ['林设计师', '何设计师', '高设计师', '罗设计师', '郑设计师'],
      analyst: ['徐分析师', '孙分析师', '朱分析师', '马分析师'],
      writer: ['郭作者', '林作者', '何作者', '高作者'],
      support: ['客服小', '客服小', '客服小', '客服小'],
      researcher: ['研究员小', '研究员小', '研究员小'],
      qa: ['测试小', '测试小', '测试小', '测试小'],
      devops: ['运维小', '运维小', '运维小'],
      custom: ['助手小', '助手小', '助手小']
    };

    const rolePrefixes = prefixes[role] || prefixes.custom;
    const baseName = rolePrefixes[index % rolePrefixes.length];
    return index > 0 && index >= rolePrefixes.length ? `${baseName}${index + 1}` : baseName;
  }

  // 获取模板对应的主题
  private getThemeForTemplate(template: TeamTemplate): 'tech' | 'business' | 'creative' | 'default' | 'minimal' {
    const themeMap: Record<TeamTemplate, 'tech' | 'business' | 'creative' | 'default' | 'minimal'> = {
      startup: 'tech',
      enterprise: 'business',
      project: 'default',
      support: 'business',
      content: 'creative',
      dev: 'tech',
      research: 'tech',
      custom: 'default'
    };
    return themeMap[template] || 'default';
  }

  // 创建团队
  async createTeam(input: CreateTeamInput): Promise<ApiResponse<DigitalTeam>> {
    await this.ensureInit();
    try {
      const templateConfig = this.getTemplateConfig(input.template);
      if (!templateConfig) {
        return {
          success: false,
          error: { code: 'INVALID_TEMPLATE', message: '无效的模板类型' }
        };
      }

      const size = input.size || templateConfig.structure.minSize;
      if (size < templateConfig.structure.minSize || size > templateConfig.structure.maxSize) {
        return {
          success: false,
          error: {
            code: 'INVALID_SIZE',
            message: `团队规模必须在 ${templateConfig.structure.minSize} 到 ${templateConfig.structure.maxSize} 之间`
          }
        };
      }

      // 生成员工
      const employeeConfigs = this.generateEmployeeConfigsFromTemplate(
        input.template,
        size,
        input.gatewayConnection
      );

      const employeeResults = await employeeService.batchCreateEmployees(employeeConfigs);
      if (!employeeResults.success || !employeeResults.data) {
        return {
          success: false,
          error: employeeResults.error || { code: 'CREATE_EMPLOYEES_FAILED', message: '创建员工失败' }
        };
      }

      const employees = employeeResults.data;
      const coordinator = employees.find(e => e.role === 'manager');

      const now = new Date().toISOString();
      const team: DigitalTeam = {
        id: crypto.randomUUID(),
        name: input.name,
        description: input.description || templateConfig.description,
        template: input.template,
        employees,
        config: {
          coordinatorId: coordinator?.id,
          autoAssign: false,
          collaborationMode: input.template === 'dev' ? 'parallel' : 'hybrid'
        },
        status: 'active',
        stats: {
          totalTasks: 0,
          completedTasks: 0,
          activeProjects: 0
        },
        createdAt: now,
        updatedAt: now
      };

      this.teams.set(team.id, team);
      await this.save();
      return { success: true, data: team };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_TEAM_FAILED',
          message: error instanceof Error ? error.message : '创建团队失败'
        }
      };
    }
  }

  // 创建自定义团队
  async createCustomTeam(input: CreateCustomTeamInput): Promise<ApiResponse<DigitalTeam>> {
    await this.ensureInit();
    try {
      const employeeConfigs: CreateEmployeeInput[] = input.employees.map(emp => ({
        name: emp.name,
        role: emp.role,
        department: input.name,
        gatewayUrl: input.gatewayConnection.url,
        gatewayType: input.gatewayConnection.type as GatewayType,
        apiKey: input.gatewayConnection.config.apiKey,
        theme: 'default'
      }));

      const employeeResults = await employeeService.batchCreateEmployees(employeeConfigs);
      if (!employeeResults.success || !employeeResults.data) {
        return {
          success: false,
          error: employeeResults.error || { code: 'CREATE_EMPLOYEES_FAILED', message: '创建员工失败' }
        };
      }

      const employees = employeeResults.data;
      const coordinator = employees.find(e => e.role === 'manager');

      const now = new Date().toISOString();
      const team: DigitalTeam = {
        id: crypto.randomUUID(),
        name: input.name,
        description: input.description || '自定义团队',
        template: 'custom',
        employees,
        config: {
          coordinatorId: coordinator?.id,
          autoAssign: input.config?.autoAssign ?? false,
          collaborationMode: input.config?.collaborationMode || 'hybrid'
        },
        status: 'active',
        stats: {
          totalTasks: 0,
          completedTasks: 0,
          activeProjects: 0
        },
        createdAt: now,
        updatedAt: now
      };

      this.teams.set(team.id, team);
      await this.save();
      return { success: true, data: team };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_TEAM_FAILED',
          message: error instanceof Error ? error.message : '创建团队失败'
        }
      };
    }
  }

  // 获取所有团队
  getAllTeams(): DigitalTeam[] {
    // 注意：这里不调用 ensureInit，因为 getter 应该是同步的
    // 数据会在服务初始化时加载
    return Array.from(this.teams.values());
  }

  // 分页获取团队
  getTeamsPaginated(page = 1, pageSize = 10): PaginatedResponse<DigitalTeam> {
    const all = this.getAllTeams();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      items: all.slice(start, end),
      total: all.length,
      page,
      pageSize
    };
  }

  // 获取单个团队
  getTeam(id: string): DigitalTeam | undefined {
    return this.teams.get(id);
  }

  // 更新团队
  async updateTeam(
    id: string,
    updates: Partial<Pick<DigitalTeam, 'name' | 'description' | 'config' | 'status'>>
  ): Promise<ApiResponse<DigitalTeam>> {
    await this.ensureInit();
    const team = this.teams.get(id);
    if (!team) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '团队不存在' }
      };
    }

    const updated: DigitalTeam = {
      ...team,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.teams.set(id, updated);
    await this.save();
    return { success: true, data: updated };
  }

  // 向团队添加员工
  async addEmployeeToTeam(
    teamId: string,
    employeeInput: CreateEmployeeInput
  ): Promise<ApiResponse<DigitalTeam>> {
    await this.ensureInit();
    const team = this.teams.get(teamId);
    if (!team) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '团队不存在' }
      };
    }

    const employeeResult = await employeeService.createEmployee(employeeInput);
    if (!employeeResult.success || !employeeResult.data) {
      return {
        success: false,
        error: employeeResult.error || { code: 'CREATE_EMPLOYEE_FAILED', message: '创建员工失败' }
      };
    }

    team.employees.push(employeeResult.data);
    team.updatedAt = new Date().toISOString();

    this.teams.set(teamId, team);
    await this.save();
    return { success: true, data: team };
  }

  // 从团队移除员工
  async removeEmployeeFromTeam(
    teamId: string,
    employeeId: string
  ): Promise<ApiResponse<DigitalTeam>> {
    await this.ensureInit();
    const team = this.teams.get(teamId);
    if (!team) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '团队不存在' }
      };
    }

    const employeeIndex = team.employees.findIndex(e => e.id === employeeId);
    if (employeeIndex === -1) {
      return {
        success: false,
        error: { code: 'EMPLOYEE_NOT_FOUND', message: '员工不在该团队中' }
      };
    }

    // 删除员工
    await employeeService.deleteEmployee(employeeId);

    // 从团队中移除
    team.employees.splice(employeeIndex, 1);
    team.updatedAt = new Date().toISOString();

    this.teams.set(teamId, team);
    await this.save();
    return { success: true, data: team };
  }

  // 删除团队
  async deleteTeam(id: string): Promise<ApiResponse<void>> {
    await this.ensureInit();
    const team = this.teams.get(id);
    if (!team) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '团队不存在' }
      };
    }

    // 删除团队中的所有员工
    for (const employee of team.employees) {
      await employeeService.deleteEmployee(employee.id);
    }

    this.teams.delete(id);
    await this.save();
    return { success: true };
  }

  // 获取模板列表
  getTemplates() {
    return TEAM_TEMPLATES.map(t => ({
      template: t.template,
      name: t.name,
      description: t.description,
      icon: t.icon,
      defaultRoles: t.defaultRoles,
      recommendedSkills: t.recommendedSkills,
      structure: t.structure
    }));
  }

  // 搜索团队
  searchTeams(query: string): DigitalTeam[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllTeams().filter(
      t =>
        t.name.toLowerCase().includes(lowercaseQuery) ||
        t.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  // 团队任务协调 - Main Agent 驱动
  async orchestrateTeamTask(
    team: DigitalTeam,
    requirement: string
  ): Promise<ApiResponse<{ execution: Array<{
    id: string;
    agentId: string;
    agentName: string;
    role: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    output?: string;
  }>; summary: string }>> {
    try {
      // 找到协调员（Manager）作为主代理
      const coordinator = team.config.coordinatorId
        ? team.employees.find(e => e.id === team.config.coordinatorId)
        : team.employees.find(e => e.role === 'manager') || team.employees[0];

      if (!coordinator) {
        return {
          success: false,
          error: { code: 'NO_COORDINATOR', message: '团队中未找到协调员' }
        };
      }

      // 主代理分析需求并分解任务
      const taskPlan = await this.analyzeRequirement(requirement, coordinator, team);

      // 执行任务分配
      const execution: Array<{
        id: string;
        agentId: string;
        agentName: string;
        role: string;
        status: 'pending' | 'running' | 'completed' | 'failed';
        output?: string;
      }> = [];

      // 根据协作模式执行任务
      switch (team.config.collaborationMode) {
        case 'parallel':
          // 并行模式：同时分配任务给所有相关成员
          await Promise.all(taskPlan.map(async (task) => {
            const agent = team.employees.find(e => e.role === task.role);
            if (agent) {
              execution.push({
                id: crypto.randomUUID(),
                agentId: agent.id,
                agentName: agent.name,
                role: agent.roleName,
                status: 'running'
              });

              // 模拟执行
              const output = await this.executeAgentTask(agent, task, team);

              const execItem = execution.find(e => e.agentId === agent.id);
              if (execItem) {
                execItem.status = 'completed';
                execItem.output = output;
              }
            }
          }));
          break;

        case 'sequential':
          // 顺序模式：按顺序执行
          for (const task of taskPlan) {
            const agent = team.employees.find(e => e.role === task.role);
            if (agent) {
              execution.push({
                id: crypto.randomUUID(),
                agentId: agent.id,
                agentName: agent.name,
                role: agent.roleName,
                status: 'running'
              });

              const output = await this.executeAgentTask(agent, task, team);

              const execItem = execution.find(e => e.agentId === agent.id);
              if (execItem) {
                execItem.status = 'completed';
                execItem.output = output;
              }
            }
          }
          break;

        case 'hybrid':
        default:
          // 混合模式：智能分组并行，组间顺序
          const taskGroups = this.groupTasksByDependency(taskPlan);
          for (const group of taskGroups) {
            await Promise.all(group.map(async (task) => {
              const agent = team.employees.find(e => e.role === task.role);
              if (agent) {
                execution.push({
                  id: crypto.randomUUID(),
                  agentId: agent.id,
                  agentName: agent.name,
                  role: agent.roleName,
                  status: 'running'
                });

                const output = await this.executeAgentTask(agent, task, team);

                const execItem = execution.find(e => e.agentId === agent.id);
                if (execItem) {
                  execItem.status = 'completed';
                  execItem.output = output;
                }
              }
            }));
          }
          break;
      }

      // 生成执行摘要
      const summary = this.generateExecutionSummary(requirement, execution, coordinator);

      // 更新团队统计
      team.stats.totalTasks += execution.length;
      team.stats.completedTasks += execution.filter(e => e.status === 'completed').length;
      await this.save();

      return {
        success: true,
        data: { execution, summary }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ORCHESTRATION_ERROR',
          message: error instanceof Error ? error.message : '任务协调失败'
        }
      };
    }
  }

  // 分析需求并分解任务 - 使用 AI
  private async analyzeRequirement(
    requirement: string,
    coordinator: DigitalEmployee,
    team: DigitalTeam
  ): Promise<Array<{ role: EmployeeRole; task: string; priority: number }>> {
    try {
      // 获取团队的 OpenClaw 连接（从协调员的配置中获取）
      const gatewayUrl = coordinator.openclawConfig?.gatewayUrl;
      if (!gatewayUrl) {
        console.warn('[TeamService] 无可用 OpenClaw 连接，使用回退策略');
        return this.fallbackAnalyzeRequirement(requirement, team);
      }

      // 查找对应的连接
      const connections = await openclawService.getAllConnections();
      const connection = connections.find(c => c.url === gatewayUrl && c.status === 'connected');

      if (!connection) {
        console.warn('[TeamService] 未找到匹配的 OpenClaw 连接，使用回退策略');
        return this.fallbackAnalyzeRequirement(requirement, team);
      }

      // 构建提示词，让 AI 分析需求并分解任务
      const teamRoles = team.employees.map(e => ({
        role: e.role,
        name: e.name,
        roleName: e.roleName,
        skills: e.openclawConfig?.skills?.join(', ') || '通用技能'
      }));

      const systemPrompt = `你是团队协调专家 "${coordinator.name}" (${coordinator.roleName})。你的职责是分析团队需求，将其分解为可执行的子任务，并分配给最合适的团队成员。

可用团队成员:
${teamRoles.map(r => `- ${r.name} (${r.roleName}): ${r.skills}`).join('\n')}

要求:
1. 评估需求的复杂度和所需技能
2. 将需求分解为 2-5 个可执行的子任务
3. 每个子任务指定负责人（使用 role 字段: manager/developer/designer/analyst/writer/support/researcher/qa/devops）
4. 设定优先级（1=高, 2=中, 3=低）
5. 必须以 JSON 格式返回，格式如下:
{
  "tasks": [
    {"role": "角色", "task": "具体任务描述", "priority": 1}
  ],
  "analysis": "需求分析摘要"
}`;

      const userPrompt = `请分析以下团队需求并进行任务分解：

需求: "${requirement}"

请直接输出 JSON 格式的任务分配方案。`;

      // 调用 OpenClaw 进行分析
      const result = await openclawService.sendMessage(connection.id, userPrompt, {
        channel: 'team-orchestration',
        systemPrompt: systemPrompt
      });

      if (!result.success || !result.data) {
        console.warn('[TeamService] AI 分析失败，使用回退策略:', result.error);
        return this.fallbackAnalyzeRequirement(requirement, team);
      }

      // 解析 AI 返回的 JSON
      const response = result.data.response;
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          console.log('[TeamService] AI 任务分解成功:', parsed.analysis);
          return parsed.tasks.sort((a: any, b: any) => a.priority - b.priority);
        }
      }

      // 如果解析失败，使用回退策略
      return this.fallbackAnalyzeRequirement(requirement, team);
    } catch (error) {
      console.error('[TeamService] 需求分析出错:', error);
      return this.fallbackAnalyzeRequirement(requirement, team);
    }
  }

  // 回退策略：基于关键词的任务分解
  private fallbackAnalyzeRequirement(
    requirement: string,
    team: DigitalTeam
  ): Array<{ role: EmployeeRole; task: string; priority: number }> {
    const tasks: Array<{ role: EmployeeRole; task: string; priority: number }> = [];
    const requirement_lower = requirement.toLowerCase();

    // 开发相关
    if (requirement_lower.includes('开发') || requirement_lower.includes('代码') || requirement_lower.includes('程序')) {
      tasks.push({ role: 'developer', task: `开发实现: ${requirement}`, priority: 1 });
      tasks.push({ role: 'qa', task: '编写测试用例并进行测试', priority: 2 });
    }

    // 设计相关
    if (requirement_lower.includes('设计') || requirement_lower.includes('ui') || requirement_lower.includes('界面')) {
      tasks.push({ role: 'designer', task: `UI/UX设计: ${requirement}`, priority: 1 });
    }

    // 数据分析相关
    if (requirement_lower.includes('数据') || requirement_lower.includes('分析') || requirement_lower.includes('报表')) {
      tasks.push({ role: 'analyst', task: `数据分析: ${requirement}`, priority: 1 });
    }

    // 内容相关
    if (requirement_lower.includes('内容') || requirement_lower.includes('文案') || requirement_lower.includes('文档')) {
      tasks.push({ role: 'writer', task: `内容创作: ${requirement}`, priority: 1 });
    }

    // 项目管理
    if (requirement_lower.includes('项目') || requirement_lower.includes('规划')) {
      tasks.push({ role: 'manager', task: `项目规划: ${requirement}`, priority: 1 });
    }

    // 如果没有匹配到特定任务，分配给经理统一协调
    if (tasks.length === 0) {
      tasks.push({ role: 'manager', task: `统筹协调: ${requirement}`, priority: 1 });
    }

    return tasks.sort((a, b) => a.priority - b.priority);
  }

  // 执行任务 - 使用 AI
  private async executeAgentTask(
    agent: DigitalEmployee,
    task: { role: EmployeeRole; task: string; priority: number },
    team?: DigitalTeam
  ): Promise<string> {
    try {
      // 获取 agent 的 OpenClaw 连接
      const gatewayUrl = agent.openclawConfig?.gatewayUrl;
      if (!gatewayUrl) {
        console.warn(`[TeamService] Agent ${agent.name} 无可用 OpenClaw 连接，使用回退策略`);
        await new Promise(resolve => setTimeout(resolve, 500)); // 短暂延迟模拟处理
        return this.fallbackExecuteAgentTask(agent, task);
      }

      // 查找对应的连接
      const connections = await openclawService.getAllConnections();
      const connection = connections.find(c => c.url === gatewayUrl && c.status === 'connected');

      if (!connection) {
        console.warn(`[TeamService] Agent ${agent.name} 未找到匹配的 OpenClaw 连接，使用回退策略`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.fallbackExecuteAgentTask(agent, task);
      }

      // 构建角色特定的提示词
      const skills = agent.openclawConfig?.skills?.join(', ') || '通用技能';
      const rolePrompts: Record<EmployeeRole, string> = {
        manager: `你是项目经理 "${agent.name}"。你的职责是协调团队、制定计划和确保项目成功。请专业、有条理地回应。`,
        developer: `你是开发工程师 "${agent.name}"。你的专长是 ${skills}。请提供技术性强、实用的解决方案。`,
        designer: `你是设计师 "${agent.name}"。你的专长是 ${skills}。请关注用户体验和视觉美学。`,
        analyst: `你是数据分析师 "${agent.name}"。你的专长是 ${skills}。请提供数据驱动的洞察。`,
        writer: `你是内容创作者 "${agent.name}"。你的专长是 ${skills}。请创作高质量、有吸引力的内容。`,
        support: `你是客服专员 "${agent.name}"。你的专长是 ${skills}。请友善、专业地回应。`,
        researcher: `你是研究员 "${agent.name}"。你的专长是 ${skills}。请提供深入、全面的分析。`,
        qa: `你是测试工程师 "${agent.name}"。你的专长是 ${skills}。请关注软件质量和测试覆盖。`,
        devops: `你是运维工程师 "${agent.name}"。你的专长是 ${skills}。请提供可靠的部署和运维方案。`,
        custom: `你是数字员工 "${agent.name}"。你的专长是 ${skills}。请专业地完成任务。`
      };

      const systemPrompt = rolePrompts[agent.role] || rolePrompts.custom;
      const userPrompt = `你的任务：${task.task}

请直接输出你的工作成果或执行摘要。如果需要代码、设计稿、分析报告等，请直接输出内容。保持简洁专业。`;

      console.log(`[TeamService] Agent ${agent.name} 开始执行任务: ${task.task.substring(0, 50)}...`);

      // 调用 OpenClaw 执行任务 - 使用 systemPrompt 设置角色
      const result = await openclawService.sendMessage(connection.id, userPrompt, {
        channel: `agent-${agent.id}`,
        systemPrompt: systemPrompt
      });

      if (!result.success || !result.data) {
        console.warn(`[TeamService] Agent ${agent.name} AI 调用失败:`, result.error);
        return this.fallbackExecuteAgentTask(agent, task);
      }

      console.log(`[TeamService] Agent ${agent.name} 任务完成`);
      return result.data.response;

    } catch (error) {
      console.error(`[TeamService] Agent ${agent.name} 任务执行出错:`, error);
      return this.fallbackExecuteAgentTask(agent, task);
    }
  }

  // 回退策略：模拟执行
  private async fallbackExecuteAgentTask(
    agent: DigitalEmployee,
    task: { role: EmployeeRole; task: string; priority: number }
  ): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const outputs: Record<EmployeeRole, string[]> = {
      manager: [
        `已完成项目规划，确定了关键里程碑和交付物。`,
        `已协调团队成员，制定了详细的工作计划。`,
        `已评估风险并制定了应对策略。`
      ],
      developer: [
        `已完成核心功能开发，代码已通过初步测试。`,
        `已编写API接口文档，实现了预期的功能。`,
        `已优化代码性能，解决了关键bug。`
      ],
      designer: [
        `已完成UI设计稿，包含完整的交互流程。`,
        `已确定设计规范，输出了相关资源文件。`,
        `已完成视觉设计，符合品牌调性要求。`
      ],
      analyst: [
        `已完成数据分析，发现了关键业务洞察。`,
        `已生成数据报表，提供了决策建议。`,
        `已建立数据模型，验证了核心假设。`
      ],
      writer: [
        `已完成文案撰写，符合SEO优化要求。`,
        `已编写技术文档，包含详细的使用说明。`,
        `已创作内容，通过质量审核。`
      ],
      support: [
        `已处理客户反馈，提供了满意的解决方案。`,
        `已更新知识库，补充了常见问题解答。`,
        `已完成服务质量评估，客户满意度达标。`
      ],
      researcher: [
        `已完成技术调研，形成了详细的研究报告。`,
        `已评估技术方案，给出了推荐建议。`,
        `已整理研究资料，建立了知识库。`
      ],
      qa: [
        `已完成功能测试，发现并修复了缺陷。`,
        `已编写自动化测试用例，覆盖率达标。`,
        `已完成回归测试，系统稳定性良好。`
      ],
      devops: [
        `已完成部署配置，服务正常运行。`,
        `已优化CI/CD流程，提升了构建效率。`,
        `已配置监控系统，设置了告警规则。`
      ],
      custom: [
        `已按要求完成指定任务。`,
        `已交付工作成果，质量符合预期。`,
        `已处理相关事项，等待下一步指示。`
      ]
    };

    const roleOutputs = outputs[agent.role] || outputs.custom;
    return `[模拟模式] ${agent.name}: ${roleOutputs[Math.floor(Math.random() * roleOutputs.length)]}`;
  }

  // 按依赖关系分组任务
  private groupTasksByDependency(
    tasks: Array<{ role: EmployeeRole; task: string; priority: number }>
  ): Array<Array<{ role: EmployeeRole; task: string; priority: number }>> {
    // 简单实现：按优先级分组
    const groups: Array<Array<{ role: EmployeeRole; task: string; priority: number }>> = [];
    const priorityMap = new Map<number, Array<{ role: EmployeeRole; task: string; priority: number }>>();

    tasks.forEach(task => {
      if (!priorityMap.has(task.priority)) {
        priorityMap.set(task.priority, []);
      }
      priorityMap.get(task.priority)!.push(task);
    });

    // 按优先级排序并转为数组
    const sortedPriorities = Array.from(priorityMap.keys()).sort((a, b) => a - b);
    sortedPriorities.forEach(priority => {
      groups.push(priorityMap.get(priority)!);
    });

    return groups;
  }

  // 生成执行摘要
  private generateExecutionSummary(
    requirement: string,
    execution: Array<{
      id: string;
      agentId: string;
      agentName: string;
      role: string;
      status: string;
      output?: string;
    }>,
    coordinator: DigitalEmployee
  ): string {
    const completedCount = execution.filter(e => e.status === 'completed').length;
    const totalCount = execution.length;

    return `✅ 任务协调完成

需求：${requirement}

执行概况：
- 协调员：${coordinator.name}
- 参与成员：${totalCount} 人
- 完成状态：${completedCount}/${totalCount} 已完成

分工详情：
${execution.map(e => `• ${e.agentName} (${e.role})：${e.output?.substring(0, 50)}...`).join('\n')}

下一步建议：
${completedCount === totalCount
  ? '所有任务已完成，可以进行成果汇总和交付。'
  : '部分任务需要跟进，请检查未完成项并协调资源。'}`;
  }
}

export const teamService = new TeamService();
