// ============================================
// 角色预设配置
// ============================================

import type { RolePreset, TeamTemplateConfig } from './types.js';

export const ROLE_PRESETS: RolePreset[] = [
  {
    role: 'manager',
    name: '项目经理',
    icon: '👔',
    defaultSkills: ['github', 'notion', 'slack'],
    defaultModel: 'claude-3-opus',
    description: '负责项目协调、任务分配和团队管理',
    responsibilities: [
      '制定项目计划和时间表',
      '协调团队成员工作',
      '跟踪项目进度',
      '风险管理',
      '资源调配'
    ],
    suggestedColor: '#4F46E5'
  },
  {
    role: 'developer',
    name: '开发工程师',
    icon: '💻',
    defaultSkills: ['github', 'coding-agent', 'tmux', 'obsidian'],
    defaultModel: 'claude-3-sonnet',
    description: '负责软件开发和代码实现',
    responsibilities: [
      '编写高质量代码',
      '代码审查',
      '技术方案设计',
      'Bug 修复',
      '性能优化'
    ],
    suggestedColor: '#0891B2'
  },
  {
    role: 'designer',
    name: '设计师',
    icon: '🎨',
    defaultSkills: ['canvas', 'openai-image-gen', 'peekaboo'],
    defaultModel: 'claude-3-sonnet',
    description: '负责UI/UX设计和视觉创意',
    responsibilities: [
      'UI/UX 设计',
      '视觉设计',
      '原型制作',
      '设计规范制定',
      '用户体验优化'
    ],
    suggestedColor: '#DB2777'
  },
  {
    role: 'analyst',
    name: '数据分析师',
    icon: '📊',
    defaultSkills: ['canvas', 'nano-pdf', 'summarize'],
    defaultModel: 'claude-3-sonnet',
    description: '负责数据分析和洞察提取',
    responsibilities: [
      '数据收集和清洗',
      '数据分析',
      '生成报告',
      '趋势预测',
      '数据可视化'
    ],
    suggestedColor: '#059669'
  },
  {
    role: 'writer',
    name: '内容创作者',
    icon: '✍️',
    defaultSkills: ['canvas', 'openai-image-gen', 'xurl', 'summarize'],
    defaultModel: 'claude-3-sonnet',
    description: '负责内容创作和文案撰写',
    responsibilities: [
      '内容策划',
      '文案撰写',
      '内容优化',
      '多平台发布',
      '受众分析'
    ],
    suggestedColor: '#DC2626'
  },
  {
    role: 'support',
    name: '客服专员',
    icon: '🎧',
    defaultSkills: ['slack', 'discord', 'session-logs'],
    defaultModel: 'claude-3-haiku',
    description: '负责客户支持和问题解决',
    responsibilities: [
      '客户咨询回复',
      '问题记录和跟踪',
      '知识库维护',
      '客户满意度跟踪',
      '反馈收集'
    ],
    suggestedColor: '#7C3AED'
  },
  {
    role: 'researcher',
    name: '研究员',
    icon: '🔬',
    defaultSkills: ['xurl', 'blogwatcher', 'canvas', 'summarize'],
    defaultModel: 'claude-3-opus',
    description: '负责技术研究和趋势分析',
    responsibilities: [
      '技术调研',
      '竞品分析',
      '趋势研究',
      '技术报告撰写',
      '创新提案'
    ],
    suggestedColor: '#4338CA'
  },
  {
    role: 'qa',
    name: '测试工程师',
    icon: '🧪',
    defaultSkills: ['github', 'gh-issues', 'healthcheck'],
    defaultModel: 'claude-3-sonnet',
    description: '负责质量保证和测试',
    responsibilities: [
      '测试用例设计',
      '自动化测试',
      'Bug 报告',
      '性能测试',
      '测试报告生成'
    ],
    suggestedColor: '#EA580C'
  },
  {
    role: 'devops',
    name: '运维工程师',
    icon: '🚀',
    defaultSkills: ['github', 'healthcheck', 'mcporter', 'tmux'],
    defaultModel: 'claude-3-sonnet',
    description: '负责基础设施和部署',
    responsibilities: [
      'CI/CD 流程管理',
      '服务器监控',
      '故障排查',
      '自动化部署',
      '安全管理'
    ],
    suggestedColor: '#0D9488'
  },
  {
    role: 'custom',
    name: '自定义角色',
    icon: '⚙️',
    defaultSkills: [],
    defaultModel: 'claude-3-haiku',
    description: '自定义配置的数字员工',
    responsibilities: [],
    suggestedColor: '#6B7280'
  }
];

// ============================================
// 团队模板配置
// ============================================

export const TEAM_TEMPLATES: TeamTemplateConfig[] = [
  {
    template: 'startup',
    name: '创业团队',
    description: '精简高效的创业团队配置，适合快速迭代的初创公司',
    icon: '🚀',
    defaultRoles: ['manager', 'developer', 'designer'],
    recommendedSkills: ['github', 'notion', 'slack', 'canvas'],
    structure: {
      minSize: 2,
      maxSize: 8,
      requiresCoordinator: true
    }
  },
  {
    template: 'enterprise',
    name: '企业级团队',
    description: '完整的企业级配置，包含所有职能角色',
    icon: '🏢',
    defaultRoles: ['manager', 'developer', 'designer', 'analyst', 'support', 'qa'],
    recommendedSkills: ['github', 'notion', 'slack', 'canvas', 'healthcheck'],
    structure: {
      minSize: 4,
      maxSize: 20,
      requiresCoordinator: true
    }
  },
  {
    template: 'project',
    name: '项目制团队',
    description: '围绕特定项目组建的临时团队',
    icon: '📁',
    defaultRoles: ['manager', 'developer', 'designer', 'qa'],
    recommendedSkills: ['github', 'notion', 'gh-issues'],
    structure: {
      minSize: 3,
      maxSize: 12,
      requiresCoordinator: true
    }
  },
  {
    template: 'support',
    name: '客服团队',
    description: '专注于客户支持的团队配置',
    icon: '🎧',
    defaultRoles: ['manager', 'support'],
    recommendedSkills: ['slack', 'discord', 'session-logs', 'healthcheck'],
    structure: {
      minSize: 2,
      maxSize: 15,
      requiresCoordinator: true
    }
  },
  {
    template: 'content',
    name: '内容创作团队',
    description: '专注于内容创作和营销的团队',
    icon: '📝',
    defaultRoles: ['writer', 'designer', 'analyst'],
    recommendedSkills: ['canvas', 'openai-image-gen', 'xurl', 'summarize'],
    structure: {
      minSize: 2,
      maxSize: 10,
      requiresCoordinator: false
    }
  },
  {
    template: 'dev',
    name: '开发团队',
    description: '专注于软件开发的纯技术团队',
    icon: '💻',
    defaultRoles: ['manager', 'developer', 'qa', 'devops'],
    recommendedSkills: ['github', 'coding-agent', 'tmux', 'healthcheck'],
    structure: {
      minSize: 3,
      maxSize: 15,
      requiresCoordinator: true
    }
  },
  {
    template: 'research',
    name: '研究团队',
    description: '专注于技术研究和创新的团队',
    icon: '🔬',
    defaultRoles: ['researcher', 'analyst', 'writer'],
    recommendedSkills: ['xurl', 'blogwatcher', 'canvas', 'nano-pdf', 'summarize'],
    structure: {
      minSize: 2,
      maxSize: 8,
      requiresCoordinator: false
    }
  },
  {
    template: 'custom',
    name: '自定义团队',
    description: '完全自定义的团队配置',
    icon: '⚙️',
    defaultRoles: [],
    recommendedSkills: [],
    structure: {
      minSize: 1,
      maxSize: 50,
      requiresCoordinator: false
    }
  }
];

// ============================================
// 工牌样式预设
// ============================================

export const BADGE_STYLES = {
  default: {
    theme: 'default' as const,
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    backgroundGradient: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)'
  },
  tech: {
    theme: 'tech' as const,
    primaryColor: '#06B6D4',
    secondaryColor: '#0891B2',
    backgroundGradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #0E7490 100%)'
  },
  business: {
    theme: 'business' as const,
    primaryColor: '#4F46E5',
    secondaryColor: '#4338CA',
    backgroundGradient: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)'
  },
  creative: {
    theme: 'creative' as const,
    primaryColor: '#EC4899',
    secondaryColor: '#DB2777',
    backgroundGradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 50%, #BE185D 100%)'
  },
  minimal: {
    theme: 'minimal' as const,
    primaryColor: '#374151',
    secondaryColor: '#1F2937',
    backgroundGradient: 'linear-gradient(135deg, #374151 0%, #1F2937 100%)'
  }
};

// ============================================
// OpenClaw 默认配置
// ============================================

export const OPENCLAW_DEFAULTS = {
  localGateway: {
    url: 'http://localhost:3000',
    type: 'local' as const
  },
  cloudGateway: {
    url: 'https://api.openclaw.ai',
    type: 'cloud' as const
  },
  defaultSkills: ['healthcheck', 'session-logs'],
  defaultTimeout: 30000,
  defaultRetryAttempts: 3
};

// ============================================
// 状态颜色映射
// ============================================

export const STATUS_COLORS = {
  active: '#10B981',
  idle: '#F59E0B',
  busy: '#EF4444',
  offline: '#6B7280',
  error: '#DC2626'
};

export const STATUS_LABELS = {
  active: '工作中',
  idle: '空闲',
  busy: '忙碌',
  offline: '离线',
  error: '异常'
};
