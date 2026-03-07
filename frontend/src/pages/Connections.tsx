import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Plus,
  Server,
  CheckCircle2,
  XCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Star,
  Edit2,
  Activity,
  Cloud,
  Home,
  Globe,
  Bot,
  Key,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Cpu,
} from 'lucide-react'
import type { OpenClawConnection, GatewayType, ModelConfig, ModelProvider } from '../types'

type TabType = 'crayfish' | 'models'

// ============================================
// API 函数
// ============================================

const fetchConnections = async (): Promise<OpenClawConnection[]> => {
  const res = await fetch('/api/connections')
  const data = await res.json()
  return data.data || []
}

const fetchStats = async () => {
  const res = await fetch('/api/connections/stats/overview')
  const data = await res.json()
  return data.data
}

const createConnection = async (connectionData: {
  name: string
  type: GatewayType
  url: string
  apiKey?: string
  description?: string
}) => {
  const res = await fetch('/api/connections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(connectionData),
  })
  return res.json()
}

const updateConnection = async (id: string, updates: Partial<OpenClawConnection>) => {
  const res = await fetch(`/api/connections/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  return res.json()
}

const deleteConnection = async (id: string) => {
  const res = await fetch(`/api/connections/${id}`, {
    method: 'DELETE',
  })
  return res.ok
}

const healthCheckConnection = async (id: string) => {
  const res = await fetch(`/api/connections/${id}/health-check`, {
    method: 'POST',
  })
  return res.json()
}

const setDefaultConnection = async (id: string) => {
  const res = await fetch(`/api/connections/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isDefault: true }),
  })
  return res.json()
}

// 模型管理 API
const fetchModels = async (): Promise<ModelConfig[]> => {
  const res = await fetch('/api/models')
  const data = await res.json()
  return data.data || []
}

const createModel = async (modelData: Omit<ModelConfig, 'id' | 'createdAt'>) => {
  const res = await fetch('/api/models', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(modelData),
  })
  return res.json()
}

const updateModel = async (id: string, updates: Partial<ModelConfig>) => {
  const res = await fetch(`/api/models/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  return res.json()
}

const deleteModel = async (id: string) => {
  const res = await fetch(`/api/models/${id}`, {
    method: 'DELETE',
  })
  return res.ok
}

const setDefaultModel = async (id: string) => {
  const res = await fetch(`/api/models/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isDefault: true }),
  })
  return res.json()
}

const testModel = async (id: string) => {
  const res = await fetch(`/api/models/${id}/test`, {
    method: 'POST',
  })
  return res.json()
}

// ============================================
// 小龙虾管理组件
// ============================================

function CrayfishManagement() {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: 'local' as GatewayType,
    url: 'http://localhost:3457',
    apiKey: '',
    description: '',
  })
  const [editConnection, setEditConnection] = useState<Partial<OpenClawConnection>>({})
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [checkingId, setCheckingId] = useState<string | null>(null)

  const { data: connections, isLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: fetchConnections,
  })

  const { data: stats } = useQuery({
    queryKey: ['connection-stats'],
    queryFn: fetchStats,
  })

  const createMutation = useMutation({
    mutationFn: createConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] })
      queryClient.invalidateQueries({ queryKey: ['connection-stats'] })
      setIsCreating(false)
      setNewConnection({
        name: '',
        type: 'local',
        url: 'http://localhost:3457',
        apiKey: '',
        description: '',
      })
      setTestResult(null)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<OpenClawConnection> }) =>
      updateConnection(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] })
      queryClient.invalidateQueries({ queryKey: ['connection-stats'] })
      setIsEditing(null)
      setEditConnection({})
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] })
      queryClient.invalidateQueries({ queryKey: ['connection-stats'] })
    },
  })

  const healthCheckMutation = useMutation({
    mutationFn: healthCheckConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] })
      queryClient.invalidateQueries({ queryKey: ['connection-stats'] })
      setCheckingId(null)
    },
  })

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] })
    },
  })

  const handleHealthCheck = async (id: string) => {
    setCheckingId(id)
    healthCheckMutation.mutate(id)
  }

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id)
  }

  const handleCreate = () => {
    createMutation.mutate(newConnection)
  }

  const startEdit = (connection: OpenClawConnection) => {
    setIsEditing(connection.id)
    setEditConnection({
      name: connection.name,
      url: connection.url,
      description: connection.description || '',
    })
    setExpandedId(connection.id)
  }

  const handleSaveEdit = () => {
    if (isEditing) {
      updateMutation.mutate({ id: isEditing, updates: editConnection })
    }
  }

  const getTypeIcon = (type: GatewayType) => {
    switch (type) {
      case 'local':
        return <Home className="w-4 h-4" />
      case 'cloud':
        return <Cloud className="w-4 h-4" />
      case 'hybrid':
        return <Globe className="w-4 h-4" />
      default:
        return <Server className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: GatewayType) => {
    switch (type) {
      case 'local':
        return '本地'
      case 'cloud':
        return '云端'
      case 'hybrid':
        return '混合'
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">总连接</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.connected}</p>
                <p className="text-sm text-gray-500">正常</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.error}</p>
                <p className="text-sm text-gray-500">异常</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span className="text-sm"><span className="font-bold text-blue-600">{stats.local}</span> 本地</span>
                <span className="text-sm"><span className="font-bold text-purple-600">{stats.cloud}</span> 云端</span>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Connection Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">新建 OpenClaw 连接</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                连接名称
              </label>
              <input
                type="text"
                value={newConnection.name}
                onChange={(e) =>
                  setNewConnection({ ...newConnection, name: e.target.value })
                }
                placeholder="我的 OpenClaw 网关"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                连接类型
              </label>
              <select
                value={newConnection.type}
                onChange={(e) =>
                  setNewConnection({
                    ...newConnection,
                    type: e.target.value as GatewayType,
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              >
                <option value="local">本地网关</option>
                <option value="cloud">云端网关</option>
                <option value="hybrid">混合模式</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                网关 URL
              </label>
              <input
                type="text"
                value={newConnection.url}
                onChange={(e) =>
                  setNewConnection({ ...newConnection, url: e.target.value })
                }
                placeholder="http://localhost:3457"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述 (可选)
              </label>
              <input
                type="text"
                value={newConnection.description}
                onChange={(e) =>
                  setNewConnection({ ...newConnection, description: e.target.value })
                }
                placeholder="描述这个连接的用途"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key (可选)
              </label>
              <input
                type="password"
                value={newConnection.apiKey}
                onChange={(e) =>
                  setNewConnection({ ...newConnection, apiKey: e.target.value })
                }
                placeholder="sk-..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
          </div>

          {testResult && (
            <div
              className={`mt-4 p-4 rounded-xl ${
                testResult.success
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              <div className="flex items-center">
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2" />
                )}
                {testResult.message}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsCreating(false)
                setTestResult(null)
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              取消
            </button>
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending || !newConnection.name || !newConnection.url}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {createMutation.isPending ? '创建中...' : '创建'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Create Button */}
      {!isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          新建连接
        </button>
      )}

      {/* Connections List */}
      <div className="space-y-4">
        {connections?.map((connection, index) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div
              className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() =>
                setExpandedId(expandedId === connection.id ? null : connection.id)
              }
            >
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    connection.status === 'connected'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  <Server className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{connection.name}</h3>
                    {connection.metadata?.isDefault && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        默认
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {getTypeIcon(connection.type)}
                      {getTypeLabel(connection.type)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        connection.status === 'connected'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {connection.status === 'connected' ? '已连接' : '未连接'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{connection.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleHealthCheck(connection.id)
                  }}
                  disabled={checkingId === connection.id}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  title="健康检查"
                >
                  <RefreshCw className={`w-5 h-5 ${checkingId === connection.id ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    startEdit(connection)
                  }}
                  className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"
                  title="编辑"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSetDefault(connection.id)
                  }}
                  disabled={connection.metadata?.isDefault}
                  className="p-2 text-gray-400 hover:text-yellow-600 rounded-lg hover:bg-yellow-50 disabled:opacity-30"
                  title="设为默认"
                >
                  <Star className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteMutation.mutate(connection.id)
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  title="删除"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                {expandedId === connection.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 ml-2" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === connection.id && (
              <div className="px-6 pb-6 border-t border-gray-100">
                {isEditing === connection.id ? (
                  /* Edit Form */
                  <div className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          连接名称
                        </label>
                        <input
                          type="text"
                          value={editConnection.name || ''}
                          onChange={(e) =>
                            setEditConnection({ ...editConnection, name: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          网关 URL
                        </label>
                        <input
                          type="text"
                          value={editConnection.url || ''}
                          onChange={(e) =>
                            setEditConnection({ ...editConnection, url: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          描述
                        </label>
                        <input
                          type="text"
                          value={editConnection.description || ''}
                          onChange={(e) =>
                            setEditConnection({ ...editConnection, description: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(null)
                          setEditConnection({})
                        }}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={updateMutation.isPending}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                      >
                        {updateMutation.isPending ? '保存中...' : '保存'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Details View */
                  <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">版本</p>
                      <p className="font-medium text-gray-900">
                        {connection.metadata?.version || '未知'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">提供商</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {connection.metadata?.provider || '未知'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">最后连接</p>
                      <p className="font-medium text-gray-900">
                        {connection.lastConnected
                          ? new Date(connection.lastConnected).toLocaleString()
                          : '从未'}
                      </p>
                    </div>
                    {connection.metadata?.channels && connection.metadata.channels.length > 0 && (
                      <div className="md:col-span-3">
                        <p className="text-sm text-gray-500 mb-2">通道</p>
                        <div className="flex flex-wrap gap-2">
                          {connection.metadata.channels.map((ch) => (
                            <span
                              key={ch}
                              className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600"
                            >
                              {ch}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {connection.metadata?.skills && connection.metadata.skills.length > 0 && (
                      <div className="md:col-span-3">
                        <p className="text-sm text-gray-500 mb-2">技能</p>
                        <div className="flex flex-wrap gap-2">
                          {connection.metadata.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {connections?.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">暂无连接</p>
          <p className="text-gray-400 text-sm mt-1">点击"新建连接"添加您的第一个 OpenClaw 网关</p>
        </div>
      )}
    </div>
  )
}

// ============================================
// 模型管理组件
// ============================================

function ModelManagement() {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [newModel, setNewModel] = useState({
    name: '',
    provider: 'kimi' as ModelProvider,
    model: '',
    apiKey: '',
    baseUrl: '',
    description: '',
  })
  const [editModel, setEditModel] = useState<Partial<ModelConfig>>({})
  const [testResult, setTestResult] = useState<{
    id: string
    success: boolean
    message: string
  } | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)

  const { data: models, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: fetchModels,
  })

  const createMutation = useMutation({
    mutationFn: createModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] })
      setIsCreating(false)
      setNewModel({
        name: '',
        provider: 'kimi',
        model: '',
        apiKey: '',
        baseUrl: '',
        description: '',
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ModelConfig> }) =>
      updateModel(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] })
      setIsEditing(null)
      setEditModel({})
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] })
    },
  })

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] })
    },
  })

  const handleTest = async (id: string) => {
    setTestingId(id)
    setTestResult(null)
    try {
      const result = await testModel(id)
      setTestResult({ id, success: result.success, message: result.message || '测试成功' })
    } catch {
      setTestResult({ id, success: false, message: '测试失败' })
    }
    setTestingId(null)
  }

  const handleCreate = () => {
    createMutation.mutate({
      ...newModel,
      isDefault: false,
    })
  }

  const handleSaveEdit = () => {
    if (isEditing) {
      updateMutation.mutate({ id: isEditing, updates: editModel })
    }
  }

  const startEdit = (model: ModelConfig) => {
    setIsEditing(model.id)
    setEditModel({
      name: model.name,
      model: model.model,
      description: model.description || '',
      baseUrl: model.baseUrl || '',
    })
  }

  const getProviderIcon = (provider: ModelProvider) => {
    switch (provider) {
      case 'kimi':
        return <Sparkles className="w-5 h-5 text-purple-500" />
      case 'anthropic':
        return <Bot className="w-5 h-5 text-orange-500" />
      case 'openai':
        return <Cpu className="w-5 h-5 text-green-500" />
      default:
        return <Key className="w-5 h-5 text-gray-500" />
    }
  }

  const getProviderLabel = (provider: ModelProvider) => {
    switch (provider) {
      case 'kimi':
        return 'Kimi'
      case 'anthropic':
        return 'Claude'
      case 'openai':
        return 'OpenAI'
      case 'custom':
        return '自定义'
      default:
        return provider
    }
  }

  const getProviderModels = (provider: ModelProvider): string[] => {
    switch (provider) {
      case 'kimi':
        return ['kimi-latest', 'kimi-k1', 'kimi-k2', 'moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k']
      case 'anthropic':
        return ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022']
      case 'openai':
        return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']
      case 'custom':
        return []
      default:
        return []
    }
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '****'
    return key.slice(0, 4) + '****' + key.slice(-4)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{models?.length || 0}</p>
              <p className="text-sm text-gray-500">总配置</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {models?.filter(m => m.isDefault).length || 0}
              </p>
              <p className="text-sm text-gray-500">默认配置</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {models?.filter(m => m.provider === 'kimi').length || 0}
              </p>
              <p className="text-sm text-gray-500">Kimi</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <span className="text-sm"><span className="font-bold text-orange-600">{models?.filter(m => m.provider === 'anthropic').length || 0}</span> Claude</span>
              <span className="text-sm"><span className="font-bold text-green-600">{models?.filter(m => m.provider === 'openai').length || 0}</span> OpenAI</span>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Create Model Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">新建模型配置</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                配置名称
              </label>
              <input
                type="text"
                value={newModel.name}
                onChange={(e) =>
                  setNewModel({ ...newModel, name: e.target.value })
                }
                placeholder="例如：Kimi 生产环境"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提供商
              </label>
              <select
                value={newModel.provider}
                onChange={(e) =>
                  setNewModel({
                    ...newModel,
                    provider: e.target.value as ModelProvider,
                    model: '',
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              >
                <option value="kimi">Kimi (Moonshot)</option>
                <option value="anthropic">Claude (Anthropic)</option>
                <option value="openai">OpenAI</option>
                <option value="custom">自定义</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模型
              </label>
              {newModel.provider === 'custom' ? (
                <input
                  type="text"
                  value={newModel.model}
                  onChange={(e) =>
                    setNewModel({ ...newModel, model: e.target.value })
                  }
                  placeholder="输入模型名称"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                />
              ) : (
                <select
                  value={newModel.model}
                  onChange={(e) =>
                    setNewModel({ ...newModel, model: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                >
                  <option value="">选择模型</option>
                  {getProviderModels(newModel.provider).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={newModel.apiKey}
                onChange={(e) =>
                  setNewModel({ ...newModel, apiKey: e.target.value })
                }
                placeholder="sk-..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base URL (可选)
              </label>
              <input
                type="text"
                value={newModel.baseUrl}
                onChange={(e) =>
                  setNewModel({ ...newModel, baseUrl: e.target.value })
                }
                placeholder="https://api.example.com/v1"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述 (可选)
              </label>
              <input
                type="text"
                value={newModel.description}
                onChange={(e) =>
                  setNewModel({ ...newModel, description: e.target.value })
                }
                placeholder="描述这个配置的用途"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setIsCreating(false)
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              取消
            </button>
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending || !newModel.name || !newModel.model || !newModel.apiKey}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {createMutation.isPending ? '创建中...' : '创建'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Create Button */}
      {!isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          新建模型配置
        </button>
      )}

      {/* Models List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models?.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    model.provider === 'kimi' ? 'bg-purple-100' :
                    model.provider === 'anthropic' ? 'bg-orange-100' :
                    model.provider === 'openai' ? 'bg-green-100' :
                    'bg-gray-100'
                  }`}>
                    {getProviderIcon(model.provider)}
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{model.name}</h3>
                      {model.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          默认
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{getProviderLabel(model.provider)}</span>
                      <span>·</span>
                      <span className="font-mono">{model.model}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTest(model.id)}
                    disabled={testingId === model.id}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    title="测试连接"
                  >
                    <RefreshCw className={`w-4 h-4 ${testingId === model.id ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => startEdit(model)}
                    className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDefaultMutation.mutate(model.id)}
                    disabled={model.isDefault}
                    className="p-2 text-gray-400 hover:text-yellow-600 rounded-lg hover:bg-yellow-50 disabled:opacity-30"
                    title="设为默认"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(model.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {testResult?.id === model.id && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${
                  testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <div className="flex items-center">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    {testResult.message}
                  </div>
                </div>
              )}

              {isEditing === model.id ? (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={editModel.name || ''}
                    onChange={(e) => setEditModel({ ...editModel, name: e.target.value })}
                    placeholder="配置名称"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  />
                  {model.provider === 'custom' && (
                    <input
                      type="text"
                      value={editModel.model || ''}
                      onChange={(e) => setEditModel({ ...editModel, model: e.target.value })}
                      placeholder="模型名称"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                    />
                  )}
                  <input
                    type="text"
                    value={editModel.baseUrl || ''}
                    onChange={(e) => setEditModel({ ...editModel, baseUrl: e.target.value })}
                    placeholder="Base URL (可选)"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  />
                  <input
                    type="text"
                    value={editModel.description || ''}
                    onChange={(e) => setEditModel({ ...editModel, description: e.target.value })}
                    placeholder="描述"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(null)
                        setEditModel({})
                      }}
                      className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={updateMutation.isPending}
                      className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      API Key
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-600">
                        {showApiKey === model.id ? model.apiKey : maskApiKey(model.apiKey)}
                      </span>
                      <button
                        onClick={() => setShowApiKey(showApiKey === model.id ? null : model.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey === model.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {model.baseUrl && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Base URL</span>
                      <span className="font-mono text-gray-600 text-xs truncate max-w-[200px]">{model.baseUrl}</span>
                    </div>
                  )}
                  {model.description && (
                    <p className="text-sm text-gray-500 pt-2 border-t border-gray-100">{model.description}</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {models?.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">暂无模型配置</p>
          <p className="text-gray-400 text-sm mt-1">点击"新建模型配置"添加您的第一个 AI 模型</p>
        </div>
      )}
    </div>
  )
}

// ============================================
// 主连接管理页面
// ============================================

export function Connections() {
  const [activeTab, setActiveTab] = useState<TabType>('crayfish')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">链接管理</h1>
          <p className="text-gray-500 mt-1">管理您的 OpenClaw 连接和 AI 模型配置</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('crayfish')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'crayfish'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Bot className="w-5 h-5 mr-2" />
            小龙虾管理
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'models'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Cpu className="w-5 h-5 mr-2" />
            模型管理
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'crayfish' ? <CrayfishManagement /> : <ModelManagement />}
    </div>
  )
}
