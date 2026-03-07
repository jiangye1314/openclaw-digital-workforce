import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Users,
  Briefcase,
  Server,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { EmployeeBadgeMini } from '../components/EmployeeBadge'
import type { DigitalEmployee, DigitalTeam, OpenClawConnection } from '../types'

const fetchStats = async () => {
  const [teamsRes, employeesRes, connectionsRes] = await Promise.all([
    fetch('/api/teams'),
    fetch('/api/employees'),
    fetch('/api/connections'),
  ])

  const [teams, employees, connections] = await Promise.all([
    teamsRes.json(),
    employeesRes.json(),
    connectionsRes.json(),
  ])

  return {
    teams: teams.data?.items || [],
    employees: employees.data?.items || [],
    connections: connections.data || [],
  }
}

export function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchStats,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink-blue" />
      </div>
    )
  }

  const activeEmployees =
    stats?.employees.filter((e: DigitalEmployee) => e.status === 'active').length || 0

  const connectedGateways =
    stats?.connections.filter((c: OpenClawConnection) => c.status === 'connected')
      .length || 0

  const statCards = [
    {
      title: '活跃团队',
      value: stats?.teams.length || 0,
      icon: Users,
      color: 'bg-ink-blue',
      trend: '+12%',
      note: '本周新增',
    },
    {
      title: '数字员工',
      value: stats?.employees.length || 0,
      icon: Briefcase,
      color: 'bg-ink-green',
      trend: '+8%',
      note: '人员增长',
    },
    {
      title: '工作中',
      value: activeEmployees,
      icon: Activity,
      color: 'bg-ink-primary',
      trend: '实时',
      note: '当前活跃',
    },
    {
      title: '已连接网关',
      value: `${connectedGateways}/${stats?.connections.length || 0}`,
      icon: Server,
      color: 'bg-ink-red',
      trend: '正常',
      note: '运行状态',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header - 手写标题 */}
      <div>
        <h1 className="text-3xl font-bold text-ink-primary marker-highlight inline-block">
          我的笔记本
        </h1>
        <p className="text-ink-light mt-2 text-lg">概览您的数字员工团队状态</p>
      </div>

      {/* Stats Grid - 便利贴风格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`sticky-note p-6 ${
              index % 3 === 0 ? '' : index % 3 === 1 ? 'pink' : 'blue'
            }`}
            style={{
              transform: `rotate(${-2 + index * 1}deg)`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-secondary font-handwriting-cn">{card.title}</p>
                <p className="text-3xl font-bold text-ink-primary mt-2 font-handwriting">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center shadow-sketch`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-ink-green mr-1" />
              <span className="text-ink-primary font-medium">{card.trend}</span>
              <span className="text-ink-light ml-2">{card.note}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Employees */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-handwriting">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-ink-primary doodle-underline">活跃员工</h2>
              <button className="text-ink-blue text-sm font-medium hover:text-ink-primary sketch-border px-3 py-1">
                查看全部 →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats?.employees.slice(0, 4).map((employee: DigitalEmployee) => (
                <EmployeeBadgeMini key={employee.id} employee={employee} />
              ))}
            </div>
          </div>

          {/* Team Overview */}
          <div className="card-handwriting" style={{ transform: 'rotate(0.5deg)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-ink-primary doodle-underline">团队概览</h2>
            </div>

            <div className="space-y-4">
              {stats?.teams.slice(0, 3).map((team: DigitalTeam, idx: number) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-4 bg-paper-cream sketch-border"
                  style={{ transform: `rotate(${-0.5 + idx * 0.5}deg)` }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-highlight-yellow flex items-center justify-center text-ink-primary font-bold sketch-border">
                      {team.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-ink-primary">{team.name}</p>
                      <p className="text-sm text-ink-light">{team.employees.length} 名成员</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-ink-primary">
                      {team.stats.completedTasks}/{team.stats.totalTasks}
                    </p>
                    <p className="text-xs text-ink-light">已完成任务</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="sticky-note pink p-6" style={{ transform: 'rotate(1deg)' }}>
            <h2 className="text-xl font-bold text-ink-primary mb-4 doodle-underline">快速操作</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-3 bg-paper-white text-ink-primary sketch-border hover:shadow-sketch-hover transition-shadow">
                <Users className="w-5 h-5 mr-2" />
                创建新团队
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-paper-white text-ink-primary sketch-border hover:shadow-sketch-hover transition-shadow">
                <Briefcase className="w-5 h-5 mr-2" />
                添加员工
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-paper-white text-ink-primary sketch-border hover:shadow-sketch-hover transition-shadow">
                <Server className="w-5 h-5 mr-2" />
                管理连接
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="sticky-note blue p-6" style={{ transform: 'rotate(-1deg)' }}>
            <h2 className="text-xl font-bold text-ink-primary mb-4 doodle-underline">系统状态</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-ink-green mr-2" />
                  <span className="text-ink-primary">OpenClaw Gateway</span>
                </div>
                <span className="text-sm text-ink-green font-medium stamp" style={{ transform: 'rotate(-5deg) scale(0.8)' }}>正常</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-ink-green mr-2" />
                  <span className="text-ink-primary">消息队列</span>
                </div>
                <span className="text-sm text-ink-green font-medium">正常</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-ink-red mr-2" />
                  <span className="text-ink-primary">定时任务</span>
                </div>
                <span className="text-sm text-ink-red font-medium">维护中</span>
              </div>
            </div>
          </div>

          {/* 手写便签 */}
          <div className="bg-paper-yellow p-6 sketch-border" style={{ transform: 'rotate(2deg)' }}>
            <p className="text-ink-primary text-lg leading-relaxed font-handwriting-cn">
              💡 小贴士：<br />
              点击左侧菜单开始管理您的数字员工团队。每个员工都有独特的技能和工牌！
            </p>
            <div className="mt-4 text-right text-ink-light text-sm">
              —— 您的数字助手
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
