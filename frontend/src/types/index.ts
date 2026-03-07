// ============================================
// 前端类型定义
// ============================================

export type EmployeeRole =
  | 'manager'
  | 'developer'
  | 'designer'
  | 'analyst'
  | 'writer'
  | 'support'
  | 'researcher'
  | 'qa'
  | 'devops'
  | 'custom'

export type EmployeeStatus = 'active' | 'idle' | 'busy' | 'offline' | 'error'

export type BadgeTheme = 'default' | 'tech' | 'business' | 'creative' | 'minimal'

export type GatewayType = 'local' | 'cloud' | 'hybrid'

export type TeamTemplate =
  | 'startup'
  | 'enterprise'
  | 'project'
  | 'support'
  | 'content'
  | 'dev'
  | 'research'
  | 'custom'

export interface DigitalEmployee {
  id: string
  name: string
  nickname?: string
  avatar: string
  role: EmployeeRole
  roleName: string
  badgeNumber: string
  department: string
  status: EmployeeStatus

  // 工牌详细信息
  profile?: {
    age?: number
    yearsOfService?: number // 工龄（年）
    joinDate?: string // 入职日期
    location?: string // 工作地点
    email?: string
    phone?: string
  }

  // 擅长技能
  expertise?: string[]

  openclawConfig: {
    gatewayUrl: string
    gatewayType: GatewayType
    apiKey?: string
    skills: string[]
    model?: string
  }

  badgeStyle: {
    theme: BadgeTheme
    primaryColor: string
    secondaryColor: string
    logo?: string
  }

  responsibilities: string[]

  stats: {
    tasksCompleted: number
    uptime: number
    lastActive: string
    efficiency: number
  }

  createdAt: string
  updatedAt: string
}

export interface DigitalTeam {
  id: string
  name: string
  description: string
  template: TeamTemplate
  employees: DigitalEmployee[]

  config: {
    coordinatorId?: string
    autoAssign: boolean
    collaborationMode: 'parallel' | 'sequential' | 'hybrid'
  }

  status: 'active' | 'paused' | 'archived'

  stats: {
    totalTasks: number
    completedTasks: number
    activeProjects: number
  }

  createdAt: string
  updatedAt: string
}

export interface OpenClawConnection {
  id: string
  name: string
  type: GatewayType
  url: string
  description?: string
  status: 'connected' | 'disconnected' | 'error'

  config: {
    apiKey?: string
    timeout: number
    retryAttempts: number
  }

  metadata?: {
    version?: string
    channels?: string[]
    skills?: string[]
    isDefault?: boolean
    provider?: string
    tags?: string[]
  }

  lastConnected?: string
  createdAt: string
  updatedAt?: string
}

export interface TeamTemplateConfig {
  template: TeamTemplate
  name: string
  description: string
  icon: string
  defaultRoles: EmployeeRole[]
  recommendedSkills: string[]
  structure: {
    minSize: number
    maxSize: number
    requiresCoordinator: boolean
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// AI 模型配置管理
export type ModelProvider = 'kimi' | 'anthropic' | 'openai' | 'custom'

export interface ModelConfig {
  id: string
  name: string
  provider: ModelProvider
  model: string
  apiKey: string
  baseUrl?: string
  isDefault: boolean
  description?: string
  createdAt: string
  updatedAt?: string
}
