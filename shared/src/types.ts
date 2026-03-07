// ============================================
// 数字员工团队管理系统 - 共享类型定义
// ============================================

/** 员工角色类型 */
export type EmployeeRole = 
  | 'manager'      // 项目经理
  | 'developer'    // 开发工程师
  | 'designer'     // 设计师
  | 'analyst'      // 数据分析师
  | 'writer'       // 内容创作者
  | 'support'      // 客服支持
  | 'researcher'   // 研究员
  | 'qa'           // 测试工程师
  | 'devops'       // 运维工程师
  | 'custom';      // 自定义角色

/** 员工状态 */
export type EmployeeStatus = 
  | 'active'       // 工作中
  | 'idle'         // 空闲
  | 'busy'         // 忙碌
  | 'offline'      // 离线
  | 'error';       // 错误状态

/** 工牌样式主题 */
export type BadgeTheme = 
  | 'default'
  | 'tech' 
  | 'business'
  | 'creative'
  | 'minimal';

/** OpenClaw 连接类型 */
export type GatewayType = 'local' | 'cloud' | 'hybrid';

/** 团队类型模板 */
export type TeamTemplate = 
  | 'startup'           // 创业团队
  | 'enterprise'        // 企业级团队
  | 'project'           // 项目制团队
  | 'support'           // 客服团队
  | 'content'           // 内容创作团队
  | 'dev'               // 开发团队
  | 'research'          // 研究团队
  | 'custom';           // 自定义团队

// ============================================
// 核心实体类型
// ============================================

/** 数字员工 */
export interface DigitalEmployee {
  id: string;
  name: string;
  nickname?: string;       // 昵称
  avatar: string;
  role: EmployeeRole;
  roleName: string;        // 显示的角色名称（可自定义）
  badgeNumber: string;     // 工号
  department: string;      // 部门
  status: EmployeeStatus;

  // 个人档案信息
  profile?: {
    age?: number;          // 年龄
    yearsOfService?: number;  // 工龄（年）
    joinDate?: string;     // 入职日期
    location?: string;     // 工作地点
    email?: string;
    phone?: string;
  };

  // 擅长技能
  expertise?: string[];

  // OpenClaw 相关配置
  openclawConfig: {
    gatewayUrl: string;
    gatewayType: GatewayType;
    apiKey?: string;
    skills: string[];      // 启用的技能列表
    model?: string;        // 使用的 AI 模型
    modelConfig?: {        // 模型详细配置
      baseUrl?: string;
      apiKey?: string;
      provider?: 'kimi' | 'anthropic' | 'openai';
    };
  };
  
  // 工牌样式
  badgeStyle: {
    theme: BadgeTheme;
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
  };
  
  // 职能描述
  responsibilities: string[];
  
  // 统计信息
  stats: {
    tasksCompleted: number;
    uptime: number;        // 运行时间（小时）
    lastActive: string;    // ISO 日期
    efficiency: number;    // 效率评分 0-100
  };
  
  createdAt: string;
  updatedAt: string;
}

/** 数字团队 */
export interface DigitalTeam {
  id: string;
  name: string;
  description: string;
  template: TeamTemplate;
  
  // 团队成员
  employees: DigitalEmployee[];
  
  // 团队配置
  config: {
    coordinatorId?: string;    // 协调员（Manager）ID
    autoAssign: boolean;       // 是否自动分配任务
    collaborationMode: 'parallel' | 'sequential' | 'hybrid';
  };
  
  // 团队状态
  status: 'active' | 'paused' | 'archived';
  
  // 使用统计
  stats: {
    totalTasks: number;
    completedTasks: number;
    activeProjects: number;
  };
  
  createdAt: string;
  updatedAt: string;
}

/** OpenClaw 网关连接 */
export interface OpenClawConnection {
  id: string;
  name: string;
  type: GatewayType;
  url: string;
  description?: string;
  status: 'connected' | 'disconnected' | 'error';

  // 连接信息
  config: {
    apiKey?: string;
    timeout: number;
    retryAttempts: number;
  };

  // 元数据
  metadata?: {
    version?: string;
    channels?: string[];
    skills?: string[];
    isDefault?: boolean;
    provider?: string;
    tags?: string[];
  };

  lastConnected?: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// 角色预设配置
// ============================================

export interface RolePreset {
  role: EmployeeRole;
  name: string;
  icon: string;
  defaultSkills: string[];
  defaultModel: string;
  description: string;
  responsibilities: string[];
  suggestedColor: string;
}

// ============================================
// 团队模板配置
// ============================================

export interface TeamTemplateConfig {
  template: TeamTemplate;
  name: string;
  description: string;
  icon: string;
  defaultRoles: EmployeeRole[];
  recommendedSkills: string[];
  structure: {
    minSize: number;
    maxSize: number;
    requiresCoordinator: boolean;
  };
}

// ============================================
// API 响应类型
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================
// WebSocket 事件类型
// ============================================

export type WSEventType = 
  | 'employee.status_changed'
  | 'employee.task_assigned'
  | 'employee.task_completed'
  | 'team.member_joined'
  | 'team.member_left'
  | 'connection.status_changed'
  | 'system.notification';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  timestamp: string;
  payload: T;
}

// ============================================
// AI 模型配置管理
// ============================================

export type ModelProvider = 'kimi' | 'anthropic' | 'openai' | 'custom';

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  model: string;
  apiKey: string;
  baseUrl?: string;
  isDefault: boolean;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}
