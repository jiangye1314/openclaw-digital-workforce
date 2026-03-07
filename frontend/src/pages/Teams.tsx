import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Users,
  Plus,
  ArrowRight,
  FolderKanban,
  Briefcase,
  MoreVertical,
} from 'lucide-react'
import type { DigitalTeam } from '../types'

const fetchTeams = async (): Promise<DigitalTeam[]> => {
  const res = await fetch('/api/teams')
  const data = await res.json()
  return data.data?.items || []
}

const templateIcons: Record<string, string> = {
  startup: '🚀',
  enterprise: '🏢',
  project: '📁',
  support: '🎧',
  content: '📝',
  dev: '💻',
  research: '🔬',
  custom: '⚙️',
}

const templateColors: Record<string, string> = {
  startup: 'bg-orange-100 text-orange-600',
  enterprise: 'bg-blue-100 text-blue-600',
  project: 'bg-purple-100 text-purple-600',
  support: 'bg-green-100 text-green-600',
  content: 'bg-pink-100 text-pink-600',
  dev: 'bg-cyan-100 text-cyan-600',
  research: 'bg-indigo-100 text-indigo-600',
  custom: 'bg-gray-100 text-gray-600',
}

export function Teams() {
  const navigate = useNavigate()
  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">团队管理</h1>
          <p className="text-gray-500 mt-1">管理您的数字员工团队</p>
        </div>
        <button
          onClick={() => navigate('/teams/create')}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          创建团队
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{teams?.length || 0}</p>
              <p className="text-sm text-gray-500">团队总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {teams?.reduce((acc, t) => acc + t.employees.length, 0) || 0}
              </p>
              <p className="text-sm text-gray-500">员工总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {teams?.filter((t) => t.status === 'active').length || 0}
              </p>
              <p className="text-sm text-gray-500">活跃团队</p>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams?.map((team, index) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(`/teams/${team.id}`)}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-14 h-14 rounded-xl ${
                  templateColors[team.template]
                } flex items-center justify-center text-2xl`}
              >
                {templateIcons[team.template] || '📁'}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle menu
                }}
                className="p-2 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">{team.name}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
              {team.description}
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex -space-x-2">
                {team.employees.slice(0, 4).map((emp) => (
                  <div
                    key={emp.id}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-sm border-2 border-white"
                  >
                    {emp.avatar}
                  </div>
                ))}
                {team.employees.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600 border-2 border-white">
                    +{team.employees.length - 4}
                  </div>
                )}
              </div>
              <div className="flex items-center text-primary-600 font-medium">
                <span>详情</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  team.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : team.status === 'paused'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {team.status === 'active' ? '活跃' : team.status === 'paused' ? '暂停' : '已归档'}
              </span>
              <span className="text-gray-400">
                {team.stats.completedTasks}/{team.stats.totalTasks} 任务
              </span>
            </div>
          </motion.div>
        ))}

        {/* Create New Team Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (teams?.length || 0) * 0.05 }}
          onClick={() => navigate('/teams/create')}
          className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all flex flex-col items-center justify-center min-h-[240px]"
        >
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900">创建新团队</p>
          <p className="text-sm text-gray-500 mt-1">选择模板快速创建</p>
        </motion.div>
      </div>
    </div>
  )
}
