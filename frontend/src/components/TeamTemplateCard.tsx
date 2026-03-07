import { motion } from 'framer-motion'
import {
  Rocket,
  Building2,
  FolderKanban,
  Headphones,
  PenTool,
  Code2,
  Microscope,
  Settings,
  Users,
  Check,
} from 'lucide-react'

interface TeamTemplate {
  template: string
  name: string
  description: string
  icon: string
  defaultRoles: string[]
  recommendedSkills: string[]
  structure: {
    minSize: number
    maxSize: number
    requiresCoordinator: boolean
  }
}

interface TeamTemplateCardProps {
  template: TeamTemplate
  isSelected: boolean
  onClick: () => void
}

const iconMap: Record<string, React.ElementType> = {
  '🚀': Rocket,
  '🏢': Building2,
  '📁': FolderKanban,
  '🎧': Headphones,
  '📝': PenTool,
  '💻': Code2,
  '🔬': Microscope,
  '⚙️': Settings,
}

const templateColors: Record<string, { bg: string; border: string; text: string }> = {
  startup: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  enterprise: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  project: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  support: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  content: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
  dev: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
  research: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
  custom: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
}

export function TeamTemplateCard({
  template,
  isSelected,
  onClick,
}: TeamTemplateCardProps) {
  const Icon = iconMap[template.icon] || Users
  const colors = templateColors[template.template] || templateColors.custom

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
        isSelected
          ? `border-primary-500 shadow-lg shadow-primary-200 ${colors.bg}`
          : `border-transparent bg-white hover:border-gray-200 shadow-md hover:shadow-lg`
      }`}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
        >
          <Check className="w-4 h-4 text-white" />
        </motion.div>
      )}

      <div
        className={`w-14 h-14 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center mb-4`}
      >
        <Icon className={`w-7 h-7 ${colors.text}`} />
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">默认角色</p>
          <div className="flex flex-wrap gap-1">
            {template.defaultRoles?.slice(0, 4).map((role) => (
              <span
                key={role}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
              >
                {getRoleName(role)}
              </span>
            ))}
            {template.defaultRoles && template.defaultRoles.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                +{template.defaultRoles.length - 4}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            推荐规模: {template.structure?.minSize ?? 1}-{template.structure?.maxSize ?? 10} 人
          </span>
        </div>
      </div>

      {template.structure?.requiresCoordinator && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-primary-600 font-medium">
            ✓ 需要指定团队负责人
          </span>
        </div>
      )}
    </motion.div>
  )
}

function getRoleName(role: string): string {
  const roleNames: Record<string, string> = {
    manager: '项目经理',
    developer: '开发',
    designer: '设计',
    analyst: '分析',
    writer: '内容',
    support: '客服',
    researcher: '研究',
    qa: '测试',
    devops: '运维',
  }
  return roleNames[role] || role
}
