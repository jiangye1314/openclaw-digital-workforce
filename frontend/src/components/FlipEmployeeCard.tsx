import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Clock,
  AlertCircle,
  Power,
  Award,
  Briefcase,
  User,
  MapPin,
  Calendar,
  Star,
  Sparkles,
} from 'lucide-react'
import type { DigitalEmployee } from '../types'

interface FlipEmployeeCardProps {
  employee: DigitalEmployee
  onClick?: () => void
  index?: number
}

const statusConfig = {
  active: {
    icon: Activity,
    label: '工作中',
    stamp: '在岗',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
    borderColor: 'border-green-300',
    stampColor: 'border-ink-green text-ink-green',
  },
  idle: {
    icon: Clock,
    label: '空闲',
    stamp: '待机',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    stampColor: 'border-yellow-600 text-yellow-700',
  },
  busy: {
    icon: AlertCircle,
    label: '忙碌',
    stamp: '繁忙',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    borderColor: 'border-red-300',
    stampColor: 'border-ink-red text-ink-red',
  },
  offline: {
    icon: Power,
    label: '离线',
    stamp: '离线',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-700',
    borderColor: 'border-gray-300',
    stampColor: 'border-gray-500 text-gray-600',
  },
  error: {
    icon: AlertCircle,
    label: '异常',
    stamp: '异常',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    borderColor: 'border-purple-300',
    stampColor: 'border-purple-600 text-purple-700',
  },
}

const themeStyles: Record<string, { bg: string; accent: string; sticker: string; lineColor: string }> = {
  default: {
    bg: 'bg-paper-white',
    accent: 'border-ink-blue',
    sticker: 'bg-highlight-blue',
    lineColor: 'var(--line-blue)',
  },
  tech: {
    bg: 'bg-paper-cream',
    accent: 'border-ink-green',
    sticker: 'bg-green-200',
    lineColor: '#a7f3d0',
  },
  business: {
    bg: 'bg-paper-white',
    accent: 'border-ink-primary',
    sticker: 'bg-gray-200',
    lineColor: 'var(--line-gray)',
  },
  creative: {
    bg: 'bg-paper-yellow',
    accent: 'border-ink-red',
    sticker: 'bg-highlight-pink',
    lineColor: '#fed7aa',
  },
  minimal: {
    bg: 'bg-paper-gray',
    accent: 'border-gray-600',
    sticker: 'bg-gray-300',
    lineColor: 'var(--line-gray)',
  },
}

const generateMockProfile = (employee: DigitalEmployee) => {
  const roleBaseAge: Record<string, number> = {
    manager: 35,
    developer: 28,
    designer: 27,
    analyst: 29,
    writer: 26,
    support: 25,
    researcher: 32,
    qa: 27,
    devops: 30,
    custom: 28,
  }

  const baseAge = roleBaseAge[employee.role] || 28
  const age = baseAge + Math.floor(Math.random() * 10) - 5
  const yearsOfService = Math.max(1, Math.floor(Math.random() * 8) + 1)

  return {
    age,
    yearsOfService,
    joinDate: new Date(Date.now() - yearsOfService * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: ['北京', '上海', '深圳', '杭州', '成都'][Math.floor(Math.random() * 5)],
    email: `${employee.badgeNumber.toLowerCase()}@digitalteam.com`,
    phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
  }
}

const generateExpertise = (employee: DigitalEmployee): string[] => {
  const roleExpertise: Record<string, string[]> = {
    manager: ['项目管理', '团队协调', '需求分析', '风险控制', '资源调度'],
    developer: ['Python', 'TypeScript', '系统架构', '性能优化', '代码审查'],
    designer: ['UI设计', '用户体验', 'Figma', '品牌设计', '原型制作'],
    analyst: ['数据分析', 'SQL', 'Python', '可视化', '统计学'],
    writer: ['内容创作', '文案策划', 'SEO优化', '品牌文案', '新媒体'],
    support: ['客户服务', '问题诊断', '沟通协调', '产品知识', '情绪管理'],
    researcher: ['算法研究', '论文阅读', '实验设计', '数据建模', '技术调研'],
    qa: ['测试用例', '自动化测试', 'Bug分析', '性能测试', '质量保障'],
    devops: ['CI/CD', 'Docker', 'K8s', '监控告警', '云原生'],
    custom: ['专业技能', '团队协作', '问题解决', '创新思维', '执行力'],
  }

  const baseSkills = roleExpertise[employee.role] || roleExpertise.custom
  const shuffled = [...baseSkills].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3 + Math.floor(Math.random() * 2))
}

export function FlipEmployeeCard({ employee, onClick, index = 0 }: FlipEmployeeCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const status = statusConfig[employee.status]
  const theme = themeStyles[employee.badgeStyle.theme] || themeStyles.default

  const profile = employee.profile || generateMockProfile(employee)
  const expertise = employee.expertise || generateExpertise(employee)
  const nickname = employee.nickname || employee.name.slice(0, 2)

  const handleClick = () => {
    setIsFlipped(!isFlipped)
    onClick?.()
  }

  return (
    <motion.div
      className="flip-card-container w-56 h-72 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={handleClick}
    >
      <motion.div
        className="flip-card-inner w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 正面 */}
        <div
          className={`flip-card-front absolute inset-0 ${theme.bg} sketch-border ${theme.accent} border-2 overflow-hidden flex flex-col`}
        >
          {/* 胶带效果 */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/60 backdrop-blur-sm z-10 rotate-1"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '2px dotted rgba(0,0,0,0.1)',
              borderRight: '2px dotted rgba(0,0,0,0.1)',
            }}
          />

          {/* 内部横线背景 */}
          <div className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `repeating-linear-gradient(transparent, transparent 23px, ${theme.lineColor} 23px, ${theme.lineColor} 24px)`,
              backgroundSize: '100% 24px',
            }}
          />

          {/* 图钉 */}
          <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-ink-red shadow-md z-10"
            style={{ boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.3)' }}
          />

          {/* 顶部装饰条 */}
          <div className={`relative z-10 h-2 ${theme.accent} border-b-2 opacity-60`} />

          {/* 头像区域 */}
          <div className="relative z-10 flex flex-col items-center pt-6 pb-3">
            <div className={`${theme.sticker} w-20 h-20 sketch-border flex items-center justify-center text-4xl`}
              style={{ borderRadius: '50%', transform: 'rotate(-2deg)' }}
            >
              {employee.avatar}
            </div>

            {/* 状态印章 */}
            <div className={`absolute top-4 right-4 stamp ${status.stampColor} text-xs px-2 py-0.5 bg-white/80`}
              style={{ transform: 'rotate(-12deg)' }}
            >
              {status.stamp}
            </div>
          </div>

          {/* 基本信息 */}
          <div className="relative z-10 flex-1 px-4 text-center">
            <h3 className="font-bold text-xl text-ink-primary leading-tight font-handwriting-cn">
              {employee.name}
            </h3>
            <p className="text-sm text-ink-secondary mt-1">
              {employee.roleName}
            </p>

            {/* 工号 */}
            <div className="flex items-center justify-center mt-2">
              <Award className="w-3 h-3 text-ink-light mr-1" />
              <span className="text-xs font-mono text-ink-light">
                {employee.badgeNumber}
              </span>
            </div>

            {/* 部门 */}
            <div className="flex items-center justify-center mt-1">
              <Briefcase className="w-3 h-3 text-ink-light mr-1" />
              <span className="text-xs text-ink-secondary">{employee.department}</span>
            </div>
          </div>

          {/* 底部统计 */}
          <div className="relative z-10 px-3 pb-3">
            <div className={`flex items-center justify-between py-2 border-t-2 border-dashed ${theme.accent} border-opacity-30`}>
              <div className="text-center flex-1">
                <span className="text-[10px] text-ink-light block">任务</span>
                <span className="text-sm font-bold text-ink-primary font-handwriting">
                  {employee.stats.tasksCompleted}
                </span>
              </div>
              <div className="w-px h-6 bg-ink-primary/20" />
              <div className="text-center flex-1">
                <span className="text-[10px] text-ink-light block">运行</span>
                <span className="text-sm font-bold text-ink-primary font-handwriting">
                  {employee.stats.uptime}h
                </span>
              </div>
              <div className="w-px h-6 bg-ink-primary/20" />
              <div className="text-center flex-1">
                <span className="text-[10px] text-ink-light block">效率</span>
                <span className="text-sm font-bold text-ink-primary font-handwriting">
                  {employee.stats.efficiency}%
                </span>
              </div>
            </div>
          </div>

          {/* 提示文字 */}
          <div className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-ink-light/50">
            点击翻转查看工牌
          </div>

          {/* 右下角撕角效果 */}
          <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-tl from-black/5 to-transparent"
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
          />
        </div>

        {/* 背面 */}
        <div
          className={`flip-card-back absolute inset-0 ${theme.bg} sketch-border ${theme.accent} border-2 overflow-hidden flex flex-col`}
        >
          {/* 胶带效果 */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/60 backdrop-blur-sm z-10"
            style={{
              transform: 'rotate(-1deg)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '2px dotted rgba(0,0,0,0.1)',
              borderRight: '2px dotted rgba(0,0,0,0.1)',
            }}
          />

          {/* 装饰背景 */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white/40 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

          {/* 顶部标题栏 */}
          <div className={`relative z-10 px-3 py-2 border-b-2 ${theme.accent} border-opacity-30 flex items-center justify-between`}>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-ink-blue" />
              <span className="text-xs font-bold text-ink-primary">员工工牌</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${status.badgeBg} ${status.badgeText}`}>
              {status.label}
            </span>
          </div>

          {/* 工牌内容 */}
          <div className="relative z-10 flex-1 px-3 py-2 space-y-1">
            {/* 昵称 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3 text-ink-light" />
                <span className="text-[10px] text-ink-light">昵称</span>
              </div>
              <span className="text-xs font-medium text-ink-primary font-handwriting-cn">{nickname}</span>
            </div>

            {/* 部门 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Briefcase className="w-3 h-3 text-ink-light" />
                <span className="text-[10px] text-ink-light">部门</span>
              </div>
              <span className="text-xs text-ink-primary truncate max-w-[80px]">{employee.department}</span>
            </div>

            {/* 年龄 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-ink-light" />
                <span className="text-[10px] text-ink-light">年龄</span>
              </div>
              <span className="text-xs font-medium text-ink-primary">{profile.age} 岁</span>
            </div>

            {/* 工龄 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Award className="w-3 h-3 text-ink-light" />
                <span className="text-[10px] text-ink-light">工龄</span>
              </div>
              <span className="text-xs font-medium text-ink-primary">{profile.yearsOfService} 年</span>
            </div>

            {/* 工作地点 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-ink-light" />
                <span className="text-[10px] text-ink-light">地点</span>
              </div>
              <span className="text-xs text-ink-primary">{profile.location}</span>
            </div>

            {/* 擅长技能 */}
            <div className="pt-1 border-t border-dashed border-ink-primary/20">
              <div className="flex items-center space-x-1 mb-1">
                <Star className="w-3 h-3 text-ink-orange" />
                <span className="text-[10px] text-ink-light">擅长技能</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {expertise.slice(0, 4).map((skill, idx) => (
                  <span
                    key={skill}
                    className={`${theme.sticker} px-1.5 py-0.5 text-[9px] text-ink-primary sketch-border`}
                    style={{
                      transform: `rotate(${-1 + idx * 1}deg)`,
                      borderRadius: '3px',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="relative z-10 px-3 pb-3">
            <div className={`pt-2 border-t-2 border-dashed ${theme.accent} border-opacity-30 flex items-center justify-between`}>
              <span className="text-[9px] text-ink-light">入职: {profile.joinDate}</span>
              <span className="text-xs font-mono font-bold text-ink-blue">{employee.badgeNumber}</span>
            </div>
          </div>

          {/* 提示文字 */}
          <div className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-ink-light/50">
            点击翻转返回
          </div>

          {/* 左下角撕角效果 */}
          <div className="absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-black/5 to-transparent"
            style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0)' }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
