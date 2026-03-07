import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Send,
  Zap,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  Bot,
  User,
  Sparkles,
  Loader2,
  Terminal,
  GitBranch,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Minimize2,
  Maximize2,
} from 'lucide-react'
import type { DigitalTeam, DigitalEmployee } from '../types'

interface TaskExecution {
  id: string
  agentId: string
  agentName: string
  role: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  output?: string
  startTime?: string
  endTime?: string
}

interface OrchestrationMessage {
  id: string
  role: 'user' | 'coordinator' | 'agent'
  agentId?: string
  agentName?: string
  content: string
  timestamp: string
  tasks?: TaskExecution[]
}

const fetchTeam = async (id: string): Promise<DigitalTeam> => {
  const res = await fetch(`/api/teams/${id}`)
  const data = await res.json()
  return data.data
}

const orchestrateTask = async ({
  teamId,
  requirement,
}: {
  teamId: string
  requirement: string
}): Promise<{ execution: TaskExecution[]; summary: string }> => {
  const res = await fetch(`/api/teams/${teamId}/orchestrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirement }),
  })
  const data = await res.json()
  if (!data.success) {
    throw new Error(data.error?.message || '任务协调失败')
  }
  return data.data
}

// 计算节点位置（圆形布局）
const calculateNodePositions = (
  centerX: number,
  centerY: number,
  radius: number,
  count: number
): Array<{ x: number; y: number; angle: number }> => {
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

// 拓扑节点组件
function TopologyNode({
  employee,
  position,
  isCoordinator,
  isActive,
  onClick,
  taskStatus,
}: {
  employee: DigitalEmployee
  position: { x: number; y: number }
  isCoordinator?: boolean
  isActive?: boolean
  onClick?: () => void
  taskStatus?: TaskExecution['status']
}) {
  const getStatusColor = () => {
    if (isCoordinator) return 'bg-purple-500'
    switch (taskStatus) {
      case 'running':
        return 'bg-blue-500 animate-pulse'
      case 'completed':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return employee.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
    }
  }

  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: position.x, top: position.y }}
      whileHover={{ scale: 1.1 }}
      onClick={onClick}
    >
      <div
        className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg ${
          isActive ? 'ring-4 ring-primary-300' : ''
        } ${isCoordinator ? 'bg-purple-100 ring-4 ring-purple-300' : 'bg-white'}`}
      >
        {isCoordinator ? (
          <Zap className="w-8 h-8 text-purple-600" />
        ) : (
          <span>{employee.avatar}</span>
        )}
        {/* 状态指示器 */}
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusColor()}`}
        />
      </div>
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <p className="text-sm font-medium text-gray-900">{isCoordinator ? '协调中心' : employee.name}</p>
        <p className="text-xs text-gray-500 text-center">
          {isCoordinator ? 'OpenClaw Main Agent' : employee.roleName}
        </p>
      </div>
    </motion.div>
  )
}

// 连接线组件
function ConnectionLine({
  from,
  to,
  isActive,
  animated,
}: {
  from: { x: number; y: number }
  to: { x: number; y: number }
  isActive?: boolean
  animated?: boolean
}) {
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={isActive ? '#6366f1' : '#e5e7eb'} />
        </marker>
      </defs>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={isActive ? '#6366f1' : '#e5e7eb'}
        strokeWidth={isActive ? 3 : 2}
        markerEnd="url(#arrowhead)"
        className={animated ? 'animate-pulse' : ''}
      />
      {isActive && animated && (
        <circle r="4" fill="#6366f1">
          <animateMotion
            dur="1.5s"
            repeatCount="indefinite"
            path={`M${from.x},${from.y} L${to.x},${to.y}`}
          />
        </circle>
      )}
    </svg>
  )
}

// 任务执行卡片
function TaskCard({ task }: { task: TaskExecution }) {
  const getStatusIcon = () => {
    switch (task.status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'failed':
        return <div className="w-4 h-4 rounded-full bg-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2 font-medium text-sm">{task.agentName}</span>
          <span className="ml-2 text-xs text-gray-500">({task.role})</span>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            task.status === 'running'
              ? 'bg-blue-100 text-blue-700'
              : task.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : task.status === 'failed'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {task.status === 'running'
            ? '执行中'
            : task.status === 'completed'
            ? '已完成'
            : task.status === 'failed'
            ? '失败'
            : '等待中'}
        </span>
      </div>
      {task.output && (
        <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2 font-mono">
          {task.output}
        </div>
      )}
    </motion.div>
  )
}

// 可折叠消息组件
function CollapsibleMessage({
  message,
  isLatest,
}: {
  message: OrchestrationMessage
  isLatest: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(isLatest)
  const [isHovered, setIsHovered] = useState(false)

  const isAgent = message.role === 'agent'
  const isCoordinator = message.role === 'coordinator'
  const isUser = message.role === 'user'

  const getMessageStyles = () => {
    if (isUser) return 'bg-primary-600 text-white'
    if (isCoordinator) return 'bg-purple-100 text-purple-900 border border-purple-200'
    return 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 border border-gray-200'
  }

  const getAvatarStyles = () => {
    if (isUser) return 'bg-primary-700'
    if (isCoordinator) return 'bg-purple-500'
    return 'bg-gradient-to-br from-blue-400 to-blue-500'
  }

  const getAgentColor = () => {
    if (isUser) return 'text-white'
    if (isCoordinator) return 'text-purple-700'
    return 'text-blue-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`max-w-[90%] ${isUser ? 'ml-8' : 'mr-8'}`}>
        {/* 消息头部 - 可点击折叠 */}
        <div
          onClick={() => !isUser && setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 mb-1 cursor-pointer select-none ${isUser ? 'flex-row-reverse' : ''}`}
        >
          {/* 头像 */}
          <div className={`w-8 h-8 rounded-full ${getAvatarStyles()} flex items-center justify-center text-white shadow-sm`}>
            {isCoordinator ? (
              <Zap className="w-4 h-4" />
            ) : isUser ? (
              <User className="w-4 h-4" />
            ) : (
              <span className="text-sm">🤖</span>
            )}
          </div>

          {/* 发送者信息 */}
          <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
            <span className={`text-xs font-semibold ${getAgentColor()}`}>
              {isUser ? '我' : isCoordinator ? '协调中心' : message.agentName}
            </span>
            {!isUser && (
              <span className="text-[10px] text-gray-400">
                {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {/* 折叠指示器 */}
          {!isUser && (
            <motion.button
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* 消息内容 */}
        <AnimatePresence>
          {(isExpanded || isUser) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${getMessageStyles()} ${
                  isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>

              {/* 任务列表 */}
              {message.tasks && message.tasks.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {message.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 折叠状态指示 */}
        {!isExpanded && !isUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => setIsExpanded(true)}
          >
            <MessageSquare className="w-3 h-3" />
            <span>点击展开消息内容</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// 消息分组组件 - 按员工分组
function MessageGroup({
  messages,
  agentName,
  agentId,
}: {
  messages: OrchestrationMessage[]
  agentName: string
  agentId?: string
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const latestMessage = messages[messages.length - 1]

  return (
    <div className="space-y-2">
      {/* 分组头部 */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-xs">
          🤖
        </div>
        <span className="text-sm font-medium text-gray-700">{agentName}</span>
        <span className="text-xs text-gray-400">({messages.length} 条消息)</span>
        <div className="flex-1" />
        <button className="p-1 text-gray-400 hover:text-gray-600">
          {isCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 消息列表 */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 pl-2"
          >
            {messages.map((msg, index) => (
              <CollapsibleMessage
                key={msg.id}
                message={msg}
                isLatest={index === messages.length - 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function TeamOrchestrator() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const containerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<OrchestrationMessage[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [viewMode, setViewMode] = useState<'topology' | 'list'>('topology')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [activeTasks, setActiveTasks] = useState<TaskExecution[]>([])
  const [allCollapsed, setAllCollapsed] = useState(false)

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: () => fetchTeam(id!),
    enabled: !!id,
  })

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 协调任务Mutation
  const orchestrateMutation = useMutation({
    mutationFn: orchestrateTask,
    onSuccess: (data) => {
      setActiveTasks(data.execution)

      // 添加协调器响应
      const coordinatorMsg: OrchestrationMessage = {
        id: Date.now().toString(),
        role: 'coordinator',
        content: data.summary,
        timestamp: new Date().toISOString(),
        tasks: data.execution,
      }
      setMessages((prev) => [...prev, coordinatorMsg])
      setIsExecuting(false)
    },
    onError: (error) => {
      const errorMsg: OrchestrationMessage = {
        id: Date.now().toString(),
        role: 'coordinator',
        content: `任务执行失败: ${error.message}`,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
      setIsExecuting(false)
    },
  })

  const handleSend = () => {
    if (!input.trim() || !id || isExecuting) return

    // 添加用户消息
    const userMsg: OrchestrationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsExecuting(true)

    // 调用协调API
    orchestrateMutation.mutate({ teamId: id, requirement: userMsg.content })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 计算拓扑布局
  const containerWidth = containerRef.current?.clientWidth || 800
  const containerHeight = containerRef.current?.clientHeight || 600
  const centerX = containerWidth / 2
  const centerY = containerHeight / 2 - 50
  const radius = Math.min(containerWidth, containerHeight) * 0.35

  const nodePositions = team
    ? calculateNodePositions(centerX, centerY, radius, team.employees.length)
    : []

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

  const coordinator = team.employees.find((e) => e.role === 'manager') || team.employees[0]

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(`/teams/${id}`)}
              className="p-2 hover:bg-gray-100 rounded-lg mr-4"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center">
                <GitBranch className="w-5 h-5 mr-2 text-primary-600" />
                {team.name} - 智能协调中心
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                通过 OpenClaw 主代理协调 {team.employees.length} 名数字员工执行任务
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('topology')}
              className={`p-2 rounded-lg ${
                viewMode === 'topology' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="拓扑视图"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="列表视图"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Topology Visualization */}
        <div className="flex-1 bg-gray-50 relative" ref={containerRef}>
          {viewMode === 'topology' ? (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Connection Lines */}
              {nodePositions.map((pos, index) => (
                <ConnectionLine
                  key={`line-${index}`}
                  from={{ x: centerX, y: centerY }}
                  to={{ x: pos.x, y: pos.y }}
                  isActive={activeTasks.some(
                    (t) => t.agentId === team.employees[index]?.id && t.status === 'running'
                  )}
                  animated={activeTasks.some(
                    (t) => t.agentId === team.employees[index]?.id && t.status === 'running'
                  )}
                />
              ))}

              {/* Center Node - Coordinator */}
              <TopologyNode
                employee={coordinator}
                position={{ x: centerX, y: centerY }}
                isCoordinator
                isActive={isExecuting}
              />

              {/* Agent Nodes */}
              {team.employees.map((employee, index) => {
                const position = nodePositions[index]
                if (!position) return null
                const task = activeTasks.find((t) => t.agentId === employee.id)

                return (
                  <TopologyNode
                    key={employee.id}
                    employee={employee}
                    position={position}
                    isActive={selectedAgent === employee.id}
                    taskStatus={task?.status}
                    onClick={() => setSelectedAgent(employee.id)}
                  />
                )
              })}
            </div>
          ) : (
            /* List View */
            <div className="p-6 overflow-y-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">团队成员</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {team.employees.map((employee) => {
                    const task = activeTasks.find((t) => t.agentId === employee.id)
                    return (
                      <div
                        key={employee.id}
                        className={`p-4 flex items-center hover:bg-gray-50 cursor-pointer ${
                          selectedAgent === employee.id ? 'bg-primary-50' : ''
                        }`}
                        onClick={() => setSelectedAgent(employee.id)}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-lg">
                          {employee.avatar}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.roleName}</p>
                        </div>
                        {task && (
                          <div className="flex items-center">
                            {task.status === 'running' && (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-500 mr-2" />
                            )}
                            {task.status === 'completed' && (
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                            )}
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                task.status === 'running'
                                  ? 'bg-blue-100 text-blue-700'
                                  : task.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {task.status === 'running'
                                ? '执行中'
                                : task.status === 'completed'
                                ? '已完成'
                                : '等待中'}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-2">图例</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
                <span className="text-gray-600">协调中心 (Main Agent)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 mr-2" />
                <span className="text-gray-600">数字员工 (空闲)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                <span className="text-gray-600">执行任务中</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-0.5 bg-indigo-500 mr-2" />
                <span className="text-gray-600">任务调度路径</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat & Tasks */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">开始协调任务</h3>
                <p className="text-sm text-gray-500">
                  在下方输入需求，主代理将自动分解任务并分配给团队成员执行。
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    '帮我开发一个用户登录功能',
                    '分析上个月的销售数据并生成报告',
                    '设计一个新产品的Logo和品牌配色',
                    '写一份关于AI趋势的技术调研文档',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 批量折叠控制按钮 */}
                <div className="flex justify-end gap-2 mb-2">
                  <button
                    onClick={() => setAllCollapsed(false)}
                    className="text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    <Maximize2 className="w-3 h-3" />
                    全部展开
                  </button>
                  <button
                    onClick={() => setAllCollapsed(true)}
                    className="text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    <Minimize2 className="w-3 h-3" />
                    全部折叠
                  </button>
                </div>

                {/* 按员工分组显示消息 */}
                {(() => {
                  // 按员工ID分组
                  const grouped: Record<string, OrchestrationMessage[]> = {}
                  messages.forEach((msg) => {
                    const key = msg.role === 'user' ? 'user' : msg.role === 'coordinator' ? 'coordinator' : (msg.agentId || msg.agentName || 'unknown')
                    if (!grouped[key]) grouped[key] = []
                    grouped[key].push(msg)
                  })

                  return Object.entries(grouped).map(([key, groupMessages]) => {
                    if (key === 'user') {
                      // 用户消息不折叠，直接显示
                      return groupMessages.map((msg) => (
                        <CollapsibleMessage
                          key={msg.id}
                          message={msg}
                          isLatest={msg.id === messages[messages.length - 1]?.id}
                        />
                      ))
                    }
                    if (key === 'coordinator') {
                      // 协调中心消息也不折叠
                      return groupMessages.map((msg) => (
                        <CollapsibleMessage
                          key={msg.id}
                          message={msg}
                          isLatest={msg.id === messages[messages.length - 1]?.id}
                        />
                      ))
                    }
                    // 员工消息按组折叠
                    const agentName = groupMessages[0]?.agentName || '未知员工'
                    return (
                      <MessageGroup
                        key={key}
                        agentId={key}
                        agentName={agentName}
                        messages={groupMessages}
                      />
                    )
                  })
                })()}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <div className="border-t border-gray-200 p-4 max-h-48 overflow-y-auto">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                任务执行状态
              </h4>
              <div className="space-y-2">
                {activeTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入需求，让团队开始工作..."
                rows={2}
                disabled={isExecuting}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none disabled:bg-gray-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isExecuting}
                className="px-4 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExecuting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              主代理将分析需求并自动分配给最适合的团队成员
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
