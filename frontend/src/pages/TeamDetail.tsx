import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Users,
  Settings,
  Activity,
  Edit2,
  Pause,
  Play,
  Archive,
  Plus,
  Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { EmployeeBadge } from '../components/EmployeeBadge'
import type { DigitalTeam } from '../types'

const fetchTeam = async (id: string): Promise<DigitalTeam> => {
  const res = await fetch(`/api/teams/${id}`)
  const data = await res.json()
  return data.data
}

export function TeamDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: () => fetchTeam(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">团队不存在</p>
        <button
          onClick={() => navigate('/teams')}
          className="mt-4 text-primary-600 font-medium"
        >
          返回团队列表
        </button>
      </div>
    )
  }

  const activeEmployees = team.employees.filter(
    (e) => e.status === 'active'
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/teams')}
            className="flex items-center text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回团队列表
          </button>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            <span
              className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                team.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : team.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {team.status === 'active' ? '活跃' : team.status === 'paused' ? '暂停' : '已归档'}
            </span>
          </div>
          <p className="text-gray-500 mt-1">{team.description}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/teams/${id}/orchestrate`)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            智能协调
          </button>
          <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <Edit2 className="w-4 h-4 mr-2" />
            编辑
          </button>
          {team.status === 'active' ? (
            <button className="flex items-center px-4 py-2 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100">
              <Pause className="w-4 h-4 mr-2" />
              暂停
            </button>
          ) : team.status === 'paused' ? (
            <button className="flex items-center px-4 py-2 text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
              <Play className="w-4 h-4 mr-2" />
              恢复
            </button>
          ) : null}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">团队成员</p>
              <p className="text-2xl font-bold text-gray-900">{team.employees.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">工作中</p>
              <p className="text-2xl font-bold text-gray-900">{activeEmployees.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已完成任务</p>
              <p className="text-2xl font-bold text-gray-900">{team.stats.completedTasks}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">活跃项目</p>
              <p className="text-2xl font-bold text-gray-900">{team.stats.activeProjects}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Archive className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Badges */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">员工工牌</h2>
          <button className="flex items-center px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">
            <Plus className="w-4 h-4 mr-2" />
            添加员工
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.employees.map((employee, index) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <EmployeeBadge employee={employee} size="md" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team Configuration */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">团队配置</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              协调模式
            </label>
            <select
              value={team.config.collaborationMode}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            >
              <option value="parallel">并行模式 - 同时处理多个任务</option>
              <option value="sequential">顺序模式 - 按顺序执行任务</option>
              <option value="hybrid">混合模式 - 智能分配</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自动分配
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={team.config.autoAssign}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-gray-700">根据负载自动分配任务</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
