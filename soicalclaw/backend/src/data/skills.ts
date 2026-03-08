import { Skill, SkillCategory } from '../types';

export const SKILLS: Skill[] = [
  // ============ 养殖技术 ============
  {
    id: 'breeding-pond-construction',
    name: '虾塘建设',
    description: '掌握虾塘选址、设计、施工和防逃设施安装',
    category: 'breeding',
    level: 'basic',
    icon: '🏗️',
    requirements: ['通过学徒级考试']
  },
  {
    id: 'breeding-seedling',
    name: '苗种投放',
    description: '掌握虾苗选择、运输、缓苗和投放技术',
    category: 'breeding',
    level: 'basic',
    icon: '🌱',
    requirements: ['通过学徒级考试']
  },
  {
    id: 'breeding-feeding',
    name: '科学投喂',
    description: '掌握饲料选择、投喂时间、投喂量控制',
    category: 'breeding',
    level: 'basic',
    icon: '🍽️',
    requirements: ['通过初级考试']
  },
  {
    id: 'breeding-density',
    name: '密度控制',
    description: '合理控制养殖密度，避免过密或过稀',
    category: 'breeding',
    level: 'intermediate',
    icon: '📊',
    requirements: ['通过初级考试']
  },
  {
    id: 'breeding-breeding-tech',
    name: '人工繁殖',
    description: '掌握亲虾选择、配对、产卵和孵化技术',
    category: 'breeding',
    level: 'advanced',
    icon: '🔄',
    requirements: ['通过高级考试']
  },
  {
    id: 'breeding-intelligent',
    name: '智能养殖',
    description: '应用物联网、自动化设备进行智能养殖管理',
    category: 'breeding',
    level: 'expert',
    icon: '🤖',
    requirements: ['通过专家级考试']
  },

  // ============ 疾病防治 ============
  {
    id: 'disease-prevention',
    name: '疾病预防',
    description: '掌握疾病预防的基本原则和日常管理',
    category: 'disease',
    level: 'basic',
    icon: '🛡️',
    requirements: ['通过学徒级考试']
  },
  {
    id: 'disease-diagnosis',
    name: '病害诊断',
    description: '能够识别常见病害症状，初步判断病因',
    category: 'disease',
    level: 'intermediate',
    icon: '🔍',
    requirements: ['通过中级考试']
  },
  {
    id: 'disease-treatment',
    name: '病害治疗',
    description: '掌握常见疾病的治疗方法和用药',
    category: 'disease',
    level: 'intermediate',
    icon: '💊',
    requirements: ['通过中级考试']
  },
  {
    id: 'disease-emergency',
    name: '应急处理',
    description: '突发疫情时的紧急应对措施',
    category: 'disease',
    level: 'advanced',
    icon: '🚑',
    requirements: ['通过高级考试']
  },

  // ============ 水质管理 ============
  {
    id: 'water-monitoring',
    name: '水质监测',
    description: '掌握水质指标检测方法和工具使用',
    category: 'water',
    level: 'basic',
    icon: '📏',
    requirements: ['通过学徒级考试']
  },
  {
    id: 'water-regulation',
    name: '水质调控',
    description: '调节pH、溶氧、氨氮等关键指标',
    category: 'water',
    level: 'intermediate',
    icon: '⚗️',
    requirements: ['通过中级考试']
  },
  {
    id: 'water-aquatic-plants',
    name: '水草管理',
    description: '种植、养护和调控水生植物',
    category: 'water',
    level: 'intermediate',
    icon: '🌿',
    requirements: ['通过中级考试']
  },
  {
    id: 'water-ecological',
    name: '生态修复',
    description: '建立和维护养殖水体生态系统',
    category: 'water',
    level: 'advanced',
    icon: '🌊',
    requirements: ['通过高级考试']
  },

  // ============ 设备维护 ============
  {
    id: 'equipment-aeration',
    name: '增氧设备',
    description: '增氧机、水泵的安装、使用和维护',
    category: 'equipment',
    level: 'basic',
    icon: '💨',
    requirements: ['通过学徒级考试']
  },
  {
    id: 'equipment-monitoring',
    name: '监控设备',
    description: '水质监测仪、摄像头等设备的维护',
    category: 'equipment',
    level: 'intermediate',
    icon: '📹',
    requirements: ['通过中级考试']
  },
  {
    id: 'equipment-automation',
    name: '自动投喂',
    description: '自动投喂系统的安装和调试',
    category: 'equipment',
    level: 'advanced',
    icon: '⚙️',
    requirements: ['通过高级考试']
  },

  // ============ 收获加工 ============
  {
    id: 'harvest-catching',
    name: '捕捞技术',
    description: '地笼、网具的使用和捕捞技巧',
    category: 'harvest',
    level: 'basic',
    icon: '🕸️',
    requirements: ['通过初级考试']
  },
  {
    id: 'harvest-selection',
    name: '分级挑选',
    description: '按规格分级，提高商品价值',
    category: 'harvest',
    level: 'intermediate',
    icon: '⚖️',
    requirements: ['通过中级考试']
  },
  {
    id: 'harvest-storage',
    name: '暂养运输',
    description: '小龙虾暂养、包装和运输技术',
    category: 'harvest',
    level: 'intermediate',
    icon: '📦',
    requirements: ['通过中级考试']
  },
  {
    id: 'harvest-processing',
    name: '深加工',
    description: '速冻、调味、甲壳素提取等加工技术',
    category: 'harvest',
    level: 'advanced',
    icon: '🏭',
    requirements: ['通过高级考试']
  },

  // ============ 经营管理 ============
  {
    id: 'business-management',
    name: '养殖场管理',
    description: '人员、物资、财务等日常管理',
    category: 'business',
    level: 'intermediate',
    icon: '📋',
    requirements: ['通过中级考试']
  },
  {
    id: 'business-marketing',
    name: '市场营销',
    description: '产品定价、渠道建设、品牌推广',
    category: 'business',
    level: 'advanced',
    icon: '📈',
    requirements: ['通过高级考试']
  },
  {
    id: 'business-ecommerce',
    name: '电商运营',
    description: '线上销售平台运营和直播带货',
    category: 'business',
    level: 'advanced',
    icon: '🛒',
    requirements: ['通过高级考试']
  },
  {
    id: 'business-strategy',
    name: '产业规划',
    description: '产业链整合、合作社运营、标准制定',
    category: 'business',
    level: 'expert',
    icon: '🎯',
    requirements: ['通过专家级考试']
  }
];

// 根据分类获取技能
export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return SKILLS.filter(skill => skill.category === category);
}

// 根据等级获取技能
export function getSkillsByLevel(level: Skill['level']): Skill[] {
  return SKILLS.filter(skill => skill.level === level);
}

// 获取所有技能
export function getAllSkills(): Skill[] {
  return SKILLS;
}

// 根据ID获取技能
export function getSkillById(id: string): Skill | undefined {
  return SKILLS.find(skill => skill.id === id);
}

// 分类名称映射
export const CATEGORY_NAMES: Record<SkillCategory, string> = {
  breeding: '养殖技术',
  disease: '疾病防治',
  equipment: '设备维护',
  water: '水质管理',
  harvest: '收获加工',
  business: '经营管理'
};

// 技能等级名称映射
export const SKILL_LEVEL_NAMES = {
  basic: '基础',
  intermediate: '进阶',
  advanced: '高级',
  expert: '专家'
};
