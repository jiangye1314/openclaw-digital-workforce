import { motion } from 'framer-motion'
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Power,
  Zap,
  User,
  Briefcase,
  Award,
} from 'lucide-react'
import type { DigitalEmployee } from '../types'

interface EmployeeBadgeProps {
  employee: DigitalEmployee
  size?: 'sm' | 'md' | 'lg'
  showStats?: boolean
  onClick?: () => void
}

const statusConfig = {
  active: {
    color: '#1e8449',
    icon: Activity,
    label: '工作中',
    bgClass: 'bg-ink-green',
    stamp: '在岗',
  },
  idle: {
    color: '#f39c12',
    icon: Clock,
    label: '空闲',
    bgClass: 'bg-yellow-500',
    stamp: '待机',
  },
  busy: {
    color: '#c0392b',
    icon: AlertCircle,
    label: '忙碌',
    bgClass: 'bg-ink-red',
    stamp: '繁忙',
  },
  offline: {
    color: '#7f8c8d',
    icon: Power,
    label: '离线',
    bgClass: 'bg-gray-500',
    stamp: '离线',
  },
  error: {
    color: '#8e44ad',
    icon: AlertCircle,
    label: '异常',
    bgClass: 'bg-purple-600',
    stamp: '异常',
  },
}

const themeStyles: Record<string, { bg: string; accent: string; sticker: string }> = {
  default: {
    bg: 'bg-paper-white',
    accent: 'border-ink-blue',
    sticker: 'bg-highlight-blue',
  },
  tech: {
    bg: 'bg-paper-cream',
    accent: 'border-ink-green',
    sticker: 'bg-green-200',
  },
  business: {
    bg: 'bg-paper-white',
    accent: 'border-ink-primary',
    sticker: 'bg-gray-200',
  },
  creative: {
    bg: 'bg-paper-yellow',
    accent: 'border-ink-red',
    sticker: 'bg-highlight-pink',
  },
  minimal: {
    bg: 'bg-paper-gray',
    accent: 'border-gray-600',
    sticker: 'bg-gray-300',
  },
}

export function EmployeeBadge({
  employee,
  size = 'md',
  showStats = true,
  onClick,
}: EmployeeBadgeProps) {
  const status = statusConfig[employee.status]
  const theme = themeStyles[employee.badgeStyle.theme] || themeStyles.default

  const sizeClasses = {
    sm: 'w-56 h-32',
    md: 'w-72 h-40',
    lg: 'w-80 h-48',
  }

  const fontSizes = {
    sm: { name: 'text-base', role: 'text-xs', id: 'text-xs' },
    md: { name: 'text-lg', role: 'text-sm', id: 'text-sm' },
    lg: { name: 'text-xl', role: 'text-base', id: 'text-base' },
  }

  const fonts = fontSizes[size]

  return (
    <motion.div
      whileHover={{ scale: 1.02, rotate: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`relative ${sizeClasses[size]} cursor-pointer`}
      onClick={onClick}
      style={{ transform: `rotate(${-0.5 + Math.random()}deg)` }}
    >
      {/* 胶带效果 */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/60 backdrop-blur-sm z-10 rotate-1"
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '2px dotted rgba(0,0,0,0.1)',
          borderRight: '2px dotted rgba(0,0,0,0.1)',
        }}
      />

      {/* 工牌主体 - 纸张风格 */}
      <div className={`relative h-full ${theme.bg} sketch-border ${theme.accent} border-2 overflow-hidden`}
        style={{
          borderRadius: '3px 8px 5px 12px',
          boxShadow: '4px 4px 0 rgba(0,0,0,0.1), 8px 8px 0 rgba(0,0,0,0.05)',
        }}
      >
        {/* 内部横线背景 */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 11px, var(--line-gray) 11px, var(--line-gray) 12px)',
            backgroundSize: '100% 12px',
          }}
        />

        {/* 图钉 */}
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-ink-red shadow-md"
          style={{ boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.3)' }}
        />

        {/* 内容 */}
        <div className="relative h-full p-3 flex flex-col justify-between text-ink-primary">
          {/* 头部 - 头像和基本信息 */}
          <div className="flex items-start space-x-3">
            {/* 头像贴纸 */}
            <div className={`${theme.sticker} w-12 h-12 sketch-border flex items-center justify-center text-2xl transform -rotate-3`}
              style={{ borderRadius: '50%' }}
            >
              {employee.avatar}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={`font-bold ${fonts.name} text-ink-primary leading-tight font-handwriting-cn`}>
                {employee.name}
              </h3>
              <p className={`${fonts.role} text-ink-secondary mt-0.5`}>
                {employee.roleName}
              </p>

              {/* 工号 */}
              <div className="flex items-center mt-1">
                <Award className="w-3 h-3 text-ink-light mr-1" />
                <span className={`${fonts.id} font-mono text-ink-light`}>
                  {employee.badgeNumber}
                </span>
              </div>
            </div>

            {/* 状态印章 */}
            <div className={`stamp ${status.bgClass} text-white text-xs px-2 py-0.5`}
              style={{ transform: 'rotate(-8deg)' }}
            >
              {status.stamp}
            </div>
          </div>

          {/* 部门标签 */}
          <div className="flex items-center">
            <Briefcase className="w-3 h-3 text-ink-light mr-1" />
            <span className="text-xs text-ink-secondary">{employee.department}</span>
          </div>

          {/* 统计信息 - 手写风格 */}
          {showStats && size !== 'sm' && (
            <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-ink-primary/20">
              <div className="text-center">
                <span className="text-xs text-ink-light block">任务</span>
                <span className="text-sm font-bold text-ink-primary font-handwriting">
                  {employee.stats.tasksCompleted}
                </span>
              </div>
              <div className="w-px h-6 bg-ink-primary/20" />
              <div className="text-center">
                <span className="text-xs text-ink-light block">运行</span>
                <span className="text-sm font-bold text-ink-primary font-handwriting">
                  {employee.stats.uptime}h
                </span>
              </div>
              <div className="w-px h-6 bg-ink-primary/20" />
              <div className="text-center">
                <span className="text-xs text-ink-light block">效率</span>
                <span className="text-sm font-bold text-ink-primary font-handwriting">
                  {employee.stats.efficiency}%
                </span>
              </div>
            </div>
          )}

          {/* 技能标签 - 小贴纸风格 */}
          {size === 'lg' && (
            <div className="flex flex-wrap gap-1 mt-1">
              {employee.openclawConfig.skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={skill}
                  className={`${theme.sticker} px-2 py-0.5 text-xs text-ink-primary sketch-border`}
                  style={{
                    transform: `rotate(${-2 + idx * 2}deg)`,
                    borderRadius: '3px',
                  }}
                >
                  {skill}
                </span>
              ))}
              {employee.openclawConfig.skills.length > 3 && (
                <span className="text-xs text-ink-light self-center">
                  +{employee.openclawConfig.skills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 右下角装饰 - 撕角效果 */}
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-black/5 to-transparent"
          style={{
            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
          }}
        />
      </div>
    </motion.div>
  )
}

// 迷你工牌 - 用于列表显示
export function EmployeeBadgeMini({
  employee,
  onClick,
}: {
  employee: DigitalEmployee
  onClick?: () => void
}) {
  const status = statusConfig[employee.status]
  const theme = themeStyles[employee.badgeStyle.theme] || themeStyles.default

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center p-3 ${theme.bg} sketch-border cursor-pointer`}
      style={{
        borderRadius: '3px 8px 5px 12px',
        boxShadow: '3px 3px 0 rgba(0,0,0,0.08)',
        transform: `rotate(${-0.3 + Math.random() * 0.6}deg)`,
      }}
    >
      {/* 头像 */}
      <div className={`${theme.sticker} w-10 h-10 sketch-border flex items-center justify-center text-lg flex-shrink-0`}
        style={{ borderRadius: '50%', transform: 'rotate(-3deg)' }}
      >
        {employee.avatar}
      </div>

      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center">
          <h4 className="font-bold text-ink-primary truncate font-handwriting-cn">
            {employee.name}
          </h4>
          {/* 状态小点 */}
          <span className={`ml-2 w-2 h-2 rounded-full ${status.bgClass} border border-white`} />
        </div>
        <p className="text-sm text-ink-secondary truncate">{employee.roleName}</p>
        <p className="text-xs font-mono text-ink-light">{employee.badgeNumber}</p>
      </div>

      {/* 右侧状态 */}
      <div className="text-right ml-2">
        <span className={`text-xs ${status.bgClass} text-white px-2 py-0.5 sketch-border`}
          style={{ borderRadius: '3px' }}
        >
          {status.label}
        </span>
      </div>
    </motion.div>
  )
}

// 工牌预览 - 用于创建团队
export function EmployeeBadgePreview({
  role,
  theme: themeName,
  index,
}: {
  role: string
  theme: string
  index: number
}) {
  const theme = themeStyles[themeName] || themeStyles.default
  const roleNames: Record<string, string> = {
    manager: '项目经理',
    developer: '开发工程师',
    designer: '设计师',
    analyst: '数据分析师',
    writer: '内容创作者',
    support: '客服专员',
    researcher: '研究员',
    qa: '测试工程师',
    devops: '运维工程师',
  }
  const roleIcons: Record<string, string> = {
    manager: '👔',
    developer: '💻',
    designer: '🎨',
    analyst: '📊',
    writer: '✍️',
    support: '🎧',
    researcher: '🔬',
    qa: '🧪',
    devops: '🚀',
  }

  const rotation = -2 + (index % 5) * 1

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`w-40 h-24 ${theme.bg} sketch-border ${theme.accent} relative`}
      style={{
        transform: `rotate(${rotation}deg)`,
        borderRadius: '3px 8px 5px 12px',
        boxShadow: '3px 3px 0 rgba(0,0,0,0.1)',
      }}
    >
      {/* 胶带 */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-white/60 z-10"
        style={{
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          borderLeft: '1px dotted rgba(0,0,0,0.1)',
          borderRight: '1px dotted rgba(0,0,0,0.1)',
        }}
      />

      <div className="h-full p-2 flex flex-col justify-center items-center text-ink-primary">
        {/* 头像占位 */}
        <div className={`${theme.sticker} w-10 h-10 sketch-border flex items-center justify-center text-xl mb-1`}
          style={{ borderRadius: '50%' }}
        >
          {roleIcons[role] || '⚙️'}
        </div>

        <p className="font-bold text-sm text-center font-handwriting-cn">
          {roleNames[role] || role}
        </p>
        <p className="text-xs text-ink-light">待创建</p>
      </div>
    </motion.div>
  )
}
