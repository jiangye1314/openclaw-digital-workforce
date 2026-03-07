import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Search,
  Briefcase,
  Activity,
  Clock,
  CheckCircle2,
  Network,
  List,
  Zap,
  Users,
} from 'lucide-react'
import { EmployeeBadge } from '../components/EmployeeBadge'
import { FlipEmployeeCard } from '../components/FlipEmployeeCard'
import type { DigitalEmployee, DigitalTeam } from '../types'

const fetchEmployees = async (): Promise<DigitalEmployee[]> => {
  const res = await fetch('/api/employees')
  const data = await res.json()
  return data.data?.items || []
}

const fetchTeams = async (): Promise<DigitalTeam[]> => {
  const res = await fetch('/api/teams')
  const data = await res.json()
  return data.data?.items || []
}

const fetchRolePresets = async () => {
  const res = await fetch('/api/employees/roles/presets')
  const data = await res.json()
  return data.data || []
}

type ViewMode = 'list' | 'topology'

// 团队拓扑组件 - 手写笔记本风格
function TeamTopology({ team, onSelect }: { team: DigitalTeam; onSelect: (id: string) => void }) {
  const radius = 80
  const centerX = 120
  const centerY = 120

  const calculateNodePositions = (count: number) => {
    const positions = []
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2
      positions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        angle,
      })
    }
    return positions
  }

  const positions = calculateNodePositions(team.employees.length)

  // 根据团队主题获取颜色
  const getThemeColors = () => {
    const theme = team.employees[0]?.badgeStyle?.theme || 'default'
    const colors: Record<string, { line: string; center: string; sticker: string }> = {
      default: { line: '#2874a6', center: 'from-blue-500 to-indigo-600', sticker: 'bg-blue-100' },
      tech: { line: '#1e8449', center: 'from-green-500 to-emerald-600', sticker: 'bg-green-100' },
      creative: { line: '#c0392b', center: 'from-orange-500 to-red-600', sticker: 'bg-orange-100' },
      business: { line: '#5d4e6d', center: 'from-gray-500 to-slate-600', sticker: 'bg-gray-100' },
      minimal: { line: '#666666', center: 'from-gray-400 to-gray-600', sticker: 'bg-gray-50' },
    }
    return colors[theme] || colors.default
  }

  const themeColors = getThemeColors()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-paper-white sketch-border border-2 border-ink-primary/20 p-5 cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden"
      style={{
        borderRadius: '8px 3px 12px 5px',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.08), 8px 8px 0 rgba(0,0,0,0.04)',
      }}
      onClick={() => onSelect(team.id)}
    >
      {/* 内部横线背景 */}
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(transparent, transparent 23px, var(--line-gray) 23px, var(--line-gray) 24px)`,
          backgroundSize: '100% 24px',
        }}
      />

      {/* 胶带效果 */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-white/60 backdrop-blur-sm z-10 rotate-1"
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '2px dotted rgba(0,0,0,0.1)',
          borderRight: '2px dotted rgba(0,0,0,0.1)',
        }}
      />

      {/* 团队标题 */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-ink-primary font-handwriting-cn">{team.name}</h3>
          <p className="text-sm text-ink-light">{team.employees.length} 名成员</p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium sketch-border ${
            team.status === 'active'
              ? 'bg-green-100 text-green-800 border-green-300'
              : team.status === 'paused'
              ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
              : 'bg-gray-100 text-gray-800 border-gray-300'
          }`}
          style={{ borderRadius: '4px 2px 6px 3px' }}
        >
          {team.status === 'active' ? '活跃' : team.status === 'paused' ? '暂停' : '已归档'}
        </span>
      </div>

      {/* 拓扑图 */}
      <div className="relative w-full h-56 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
          {/* 连接线 - 手绘风格 */}
          {positions.map((pos, i) => (
            <motion.line
              key={`line-${i}`}
              x1={centerX}
              y1={centerY}
              x2={pos.x}
              y2={pos.y}
              stroke={themeColors.line}
              strokeWidth="2"
              strokeDasharray="5 3"
              strokeLinecap="round"
              opacity={0.4}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          ))}
        </svg>

        {/* 中心 - 主代理/协调器 (小龙虾中心) */}
        <motion.div
          className="absolute z-10 flex flex-col items-center justify-center"
          style={{ left: centerX - 32, top: centerY - 32 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${themeColors.center} flex items-center justify-center shadow-lg sketch-border`}
            style={{ borderRadius: '50%' }}
          >
            <span className="text-3xl">🦞</span>
          </div>
          <span className="mt-1 text-xs font-medium text-ink-primary bg-white/80 px-2 py-0.5 rounded-full sketch-border">
            主代理
          </span>
        </motion.div>

        {/* 团队成员节点 - 小龙虾 */}
        {team.employees.map((employee, index) => {
          const pos = positions[index]
          if (!pos) return null

          return (
            <motion.div
              key={employee.id}
              className="absolute z-10 flex flex-col items-center"
              style={{
                left: pos.x - 22,
                top: pos.y - 22,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(team.id)
              }}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-lg shadow-md sketch-border ${themeColors.sticker} transform hover:scale-110 transition-transform`}
                style={{
                  borderRadius: '50%',
                  transform: `rotate(${-3 + Math.random() * 6}deg)`,
                }}
                title={employee.name}
              >
                🦞
              </div>
              <span className="mt-1 text-[10px] text-ink-primary bg-white/90 px-1.5 py-0.5 rounded whitespace-nowrap font-handwriting-cn sketch-border">
                {employee.name.slice(0, 4)}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* 底部信息 */}
      <div className="relative z-10 mt-3 pt-3 border-t-2 border-dashed border-ink-primary/20 flex items-center justify-between">
        <div className="flex items-center text-sm text-ink-secondary">
          <Users className="w-4 h-4 mr-1" />
          {team.employees.filter((e) => e.status === 'active').length} 工作中
        </div>
        <button
          className="text-sm text-ink-blue font-medium hover:text-ink-primary flex items-center px-2 py-1 bg-blue-50/50 rounded sketch-border hover:bg-blue-100/50 transition-colors"
          style={{ borderRadius: '3px 5px 2px 4px' }}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(team.id)
          }}
        >
          <Zap className="w-4 h-4 mr-1" />
          智能协调
        </button>
      </div>
    </motion.div>
  )
}

export function Employees() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
  })

  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  })

  const { data: rolePresets } = useQuery({
    queryKey: ['role-presets'],
    queryFn: fetchRolePresets,
  })

  const filteredEmployees = employees?.filter((emp) => {
    const matchesSearch =
      !searchQuery ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = !selectedRole || emp.role === selectedRole
    const matchesStatus = !selectedStatus || emp.status === selectedStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: employees?.length || 0,
    active: employees?.filter((e) => e.status === 'active').length || 0,
    idle: employees?.filter((e) => e.status === 'idle').length || 0,
    busy: employees?.filter((e) => e.status === 'busy').length || 0,
  }

  const isLoading = isLoadingEmployees || isLoadingTeams

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
          <h1 className="text-2xl font-bold text-gray-900">员工管理</h1>
          <p className="text-gray-500 mt-1">
            {viewMode === 'topology' ? '查看团队拓扑架构与协作关系' : '查看和管理您的数字员工'}
          </p>
        </div>
        {/* 视图切换 */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-4 h-4 mr-1.5" />
            列表
          </button>
          <button
            onClick={() => setViewMode('topology')}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'topology'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Network className="w-4 h-4 mr-1.5" />
            拓扑架构
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">员工总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-500">工作中</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.idle}</p>
              <p className="text-sm text-gray-500">空闲</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.busy}</p>
              <p className="text-sm text-gray-500">忙碌</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索员工姓名或工号..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          >
            <option value="">所有角色</option>
            {rolePresets?.map((preset: any) => (
              <option key={preset.role} value={preset.role}>
                {preset.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          >
            <option value="">所有状态</option>
            <option value="active">工作中</option>
            <option value="idle">空闲</option>
            <option value="busy">忙碌</option>
            <option value="offline">离线</option>
          </select>
        </div>
      </div>

      {/* Content - Based on View Mode */}
      {viewMode === 'topology' ? (
        /* 拓扑架构视图 */
        <div className="space-y-8">
          {/* 组织架构概览 */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">组织架构概览</h3>
                  <p className="text-gray-600">
                    共 {teams?.length || 0} 个团队，{employees?.length || 0} 名数字员工
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
                  <span className="text-gray-600">主代理</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                  <span className="text-gray-600">活跃</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                  <span className="text-gray-600">忙碌</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-400 mr-2" />
                  <span className="text-gray-600">空闲/离线</span>
                </div>
              </div>
            </div>
          </div>

          {/* 团队拓扑网格 */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">团队拓扑架构</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {teams?.map((team, index) => (
                <TeamTopology
                  key={team.id}
                  team={team}
                  onSelect={(id) => navigate(`/teams/${id}/orchestrate`)}
                />
              ))}
            </div>
            {(!teams || teams.length === 0) && (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <Network className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无团队数据</p>
                <button
                  onClick={() => navigate('/teams/create')}
                  className="mt-4 text-purple-600 font-medium hover:text-purple-700"
                >
                  创建第一个团队 →
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 列表视图 - 可翻转工牌（3:4 纵向比例） */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" style={{ perspective: 'none' }}>
          {filteredEmployees?.map((employee, index) => (
            <div key={employee.id} className="flex justify-center items-start">
              <div className="relative">
                <FlipEmployeeCard employee={employee} index={index} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
