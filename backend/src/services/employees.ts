// ============================================
// 数字员工管理服务
// ============================================

import type {
  DigitalEmployee,
  EmployeeRole,
  EmployeeStatus,
  BadgeTheme,
  GatewayType,
  ApiResponse,
  PaginatedResponse,
  RolePreset
} from '@openclaw-digital-workforce/shared';
import { BADGE_STYLES, ROLE_PRESETS } from '@openclaw-digital-workforce/shared';
import { storageService } from './storage.js';

const STORAGE_KEY = 'employees';
const COUNTER_KEY = 'employee-counters';

export interface CreateEmployeeInput {
  name: string;
  role: EmployeeRole;
  roleName?: string;
  department?: string;
  gatewayUrl: string;
  gatewayType: GatewayType;
  apiKey?: string;
  skills?: string[];
  model?: string;
  modelConfig?: {
    baseUrl?: string;
    apiKey?: string;
    provider?: 'kimi' | 'anthropic' | 'openai';
  };
  theme?: BadgeTheme;
  responsibilities?: string[];
}

export class EmployeeService {
  private employees: Map<string, DigitalEmployee> = new Map();
  private badgeCounter = new Map<EmployeeRole, number>();
  private initialized = false;

  // 初始化 - 从文件加载数据
  async init(): Promise<void> {
    if (this.initialized) return;

    const data = await storageService.loadMap<DigitalEmployee>(STORAGE_KEY);
    this.employees = data;

    const counters = await storageService.loadCounter(COUNTER_KEY);
    this.badgeCounter = counters as Map<EmployeeRole, number>;

    this.initialized = true;
    console.log(`[EmployeeService] 已加载 ${data.size} 个员工数据`);
  }

  // 保存数据到文件
  private async save(): Promise<void> {
    await storageService.saveMap(STORAGE_KEY, this.employees, { pretty: true });
    await storageService.saveCounter(COUNTER_KEY, this.badgeCounter);
  }

  // 确保已初始化
  private async ensureInit(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  // 生成工号
  private generateBadgeNumber(role: EmployeeRole): string {
    const prefix = role.toUpperCase().slice(0, 3);
    const count = (this.badgeCounter.get(role) || 0) + 1;
    this.badgeCounter.set(role, count);
    return `${prefix}-${String(count).padStart(4, '0')}`;
  }

  // 生成默认头像
  private generateAvatar(role: EmployeeRole): string {
    const avatars: Record<EmployeeRole, string[]> = {
      manager: ['👔', '🤵', '👨‍💼', '👩‍💼'],
      developer: ['💻', '👨‍💻', '👩‍💻', '🖥️'],
      designer: ['🎨', '👨‍🎨', '👩‍🎨', '✏️'],
      analyst: ['📊', '📈', '👨‍🔬', '👩‍🔬'],
      writer: ['✍️', '📖', '📝', '📚'],
      support: ['🎧', '💁', '💁‍♂️', '💁‍♀️'],
      researcher: ['🔬', '🔭', '👨‍🔬', '👩‍🔬'],
      qa: ['🧪', '🔍', '✅', '📋'],
      devops: ['🚀', '⚙️', '🔧', '🛠️'],
      custom: ['⚙️', '🔧', '🛠️', '📎']
    };

    const roleAvatars = avatars[role] || avatars.custom;
    return roleAvatars[Math.floor(Math.random() * roleAvatars.length)];
  }

  // 生成员工档案信息
  private generateProfile(role: EmployeeRole): DigitalEmployee['profile'] {
    const roleBaseAge: Record<EmployeeRole, number> = {
      manager: 35,
      developer: 28,
      designer: 27,
      analyst: 29,
      writer: 26,
      support: 25,
      researcher: 32,
      qa: 27,
      devops: 30,
      custom: 28
    };

    const baseAge = roleBaseAge[role] || 28;
    const age = baseAge + Math.floor(Math.random() * 10) - 5;
    const yearsOfService = Math.max(1, Math.floor(Math.random() * 8) + 1);

    const cities = ['北京', '上海', '深圳', '杭州', '成都', '广州', '南京', '武汉'];
    const location = cities[Math.floor(Math.random() * cities.length)];

    return {
      age,
      yearsOfService,
      joinDate: new Date(Date.now() - yearsOfService * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location,
      email: `emp${Date.now().toString(36)}@digitalteam.com`,
      phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`
    };
  }

  // 生成擅长技能
  private generateExpertise(role: EmployeeRole, presetSkills: string[]): string[] {
    const roleExpertise: Record<EmployeeRole, string[]> = {
      manager: ['项目管理', '团队协调', '需求分析', '风险控制', '资源调度'],
      developer: ['Python', 'TypeScript', '系统架构', '性能优化', '代码审查'],
      designer: ['UI设计', '用户体验', 'Figma', '品牌设计', '原型制作'],
      analyst: ['数据分析', 'SQL', 'Python', '可视化', '统计学'],
      writer: ['内容创作', '文案策划', 'SEO优化', '品牌文案', '新媒体'],
      support: ['客户服务', '问题诊断', '沟通协调', '产品知识', '情绪管理'],
      researcher: ['算法研究', '论文阅读', '实验设计', '数据建模', '技术调研'],
      qa: ['测试用例', '自动化测试', 'Bug分析', '性能测试', '质量保障'],
      devops: ['CI/CD', 'Docker', 'K8s', '监控告警', '云原生'],
      custom: ['专业技能', '团队协作', '问题解决', '创新思维', '执行力']
    };

    const baseSkills = roleExpertise[role] || roleExpertise.custom;
    // 合并预设技能和角色专长，随机选择3-5个
    const combined = [...new Set([...presetSkills, ...baseSkills])];
    const shuffled = [...combined].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3 + Math.floor(Math.random() * 3));
  }

  // 生成昵称
  private generateNickname(name: string): string {
    const prefixes = ['小', '阿', '老', '大'];
    const suffixes = ['子', '儿', '哥', '姐', '弟', '妹'];

    // 简单规则：取名字第一个字 + 随机后缀，或使用随机前缀 + 名字第一个字
    const firstChar = name.charAt(0);
    const usePrefix = Math.random() > 0.5;

    if (usePrefix) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      return `${prefix}${firstChar}`;
    } else {
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      return `${firstChar}${suffix}`;
    }
  }

  // 获取角色预设
  private getRolePreset(role: EmployeeRole): RolePreset | undefined {
    return ROLE_PRESETS.find(p => p.role === role);
  }

  // 创建员工
  async createEmployee(input: CreateEmployeeInput): Promise<ApiResponse<DigitalEmployee>> {
    await this.ensureInit();
    try {
      const preset = this.getRolePreset(input.role);
      const now = new Date().toISOString();

      const skills = input.skills || preset?.defaultSkills || [];
      const nickname = this.generateNickname(input.name);
      const profile = this.generateProfile(input.role);
      const expertise = this.generateExpertise(input.role, skills);

      const employee: DigitalEmployee = {
        id: crypto.randomUUID(),
        name: input.name,
        nickname,
        avatar: this.generateAvatar(input.role),
        role: input.role,
        roleName: input.roleName || preset?.name || '数字员工',
        badgeNumber: this.generateBadgeNumber(input.role),
        department: input.department || '数字员工部',
        status: 'idle',

        profile,
        expertise,

        openclawConfig: {
          gatewayUrl: input.gatewayUrl,
          gatewayType: input.gatewayType,
          apiKey: input.apiKey,
          skills,
          model: input.model || preset?.defaultModel || 'claude-3-haiku',
          modelConfig: input.modelConfig
        } as DigitalEmployee['openclawConfig'],

        badgeStyle: {
          theme: input.theme || 'default',
          primaryColor: preset?.suggestedColor || '#3B82F6',
          secondaryColor: '#1E40AF'
        },

        responsibilities: input.responsibilities || preset?.responsibilities || [],

        stats: {
          tasksCompleted: 0,
          uptime: 0,
          lastActive: now,
          efficiency: 100
        },

        createdAt: now,
        updatedAt: now
      };

      this.employees.set(employee.id, employee);
      await this.save();

      return { success: true, data: employee };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_EMPLOYEE_FAILED',
          message: error instanceof Error ? error.message : '创建员工失败'
        }
      };
    }
  }

  // 获取所有员工
  getAllEmployees(): DigitalEmployee[] {
    return Array.from(this.employees.values());
  }

  // 分页获取员工
  getEmployeesPaginated(page = 1, pageSize = 10): PaginatedResponse<DigitalEmployee> {
    const all = this.getAllEmployees();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      items: all.slice(start, end),
      total: all.length,
      page,
      pageSize
    };
  }

  // 获取单个员工
  getEmployee(id: string): DigitalEmployee | undefined {
    return this.employees.get(id);
  }

  // 按角色获取员工
  getEmployeesByRole(role: EmployeeRole): DigitalEmployee[] {
    return this.getAllEmployees().filter(e => e.role === role);
  }

  // 按状态获取员工
  getEmployeesByStatus(status: EmployeeStatus): DigitalEmployee[] {
    return this.getAllEmployees().filter(e => e.status === status);
  }

  // 更新员工
  async updateEmployee(
    id: string,
    updates: Partial<Omit<DigitalEmployee, 'id' | 'createdAt' | 'badgeNumber'>>
  ): Promise<ApiResponse<DigitalEmployee>> {
    await this.ensureInit();
    const employee = this.employees.get(id);
    if (!employee) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '员工不存在' }
      };
    }

    const updated: DigitalEmployee = {
      ...employee,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.employees.set(id, updated);
    await this.save();
    return { success: true, data: updated };
  }

  // 更新员工状态
  async updateStatus(
    id: string,
    status: EmployeeStatus
  ): Promise<ApiResponse<DigitalEmployee>> {
    await this.ensureInit();
    const employee = this.employees.get(id);
    if (!employee) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '员工不存在' }
      };
    }

    employee.status = status;
    if (status === 'active') {
      employee.stats.lastActive = new Date().toISOString();
    }
    employee.updatedAt = new Date().toISOString();

    this.employees.set(id, employee);
    await this.save();
    return { success: true, data: employee };
  }

  // 更新统计信息
  async updateStats(
    id: string,
    stats: Partial<DigitalEmployee['stats']>
  ): Promise<ApiResponse<DigitalEmployee>> {
    await this.ensureInit();
    const employee = this.employees.get(id);
    if (!employee) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '员工不存在' }
      };
    }

    employee.stats = { ...employee.stats, ...stats };
    employee.updatedAt = new Date().toISOString();

    this.employees.set(id, employee);
    await this.save();
    return { success: true, data: employee };
  }

  // 删除员工
  async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    await this.ensureInit();
    const deleted = this.employees.delete(id);
    if (!deleted) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '员工不存在' }
      };
    }

    await this.save();
    return { success: true };
  }

  // 批量创建员工
  async batchCreateEmployees(
    inputs: CreateEmployeeInput[]
  ): Promise<ApiResponse<DigitalEmployee[]>> {
    const results: DigitalEmployee[] = [];
    const errors: string[] = [];

    for (const input of inputs) {
      const result = await this.createEmployee(input);
      if (result.success && result.data) {
        results.push(result.data);
      } else {
        errors.push(`${input.name}: ${result.error?.message}`);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      return {
        success: false,
        error: {
          code: 'BATCH_CREATE_FAILED',
          message: `全部创建失败: ${errors.join(', ')}`
        }
      };
    }

    return { success: true, data: results };
  }

  // 获取角色统计
  getRoleStatistics(): Record<EmployeeRole, number> {
    const stats = {} as Record<EmployeeRole, number>;
    for (const employee of this.employees.values()) {
      stats[employee.role] = (stats[employee.role] || 0) + 1;
    }
    return stats;
  }

  // 获取状态统计
  getStatusStatistics(): Record<EmployeeStatus, number> {
    const stats = {} as Record<EmployeeStatus, number>;
    for (const employee of this.employees.values()) {
      stats[employee.status] = (stats[employee.status] || 0) + 1;
    }
    return stats;
  }

  // 搜索员工
  searchEmployees(query: string): DigitalEmployee[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllEmployees().filter(
      e =>
        e.name.toLowerCase().includes(lowercaseQuery) ||
        e.roleName.toLowerCase().includes(lowercaseQuery) ||
        e.badgeNumber.toLowerCase().includes(lowercaseQuery) ||
        e.department.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export const employeeService = new EmployeeService();
