import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  MoreVertical,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import type { DigitalEmployee } from '../types'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  status?: 'sending' | 'sent' | 'error'
}

const fetchEmployee = async (id: string): Promise<DigitalEmployee> => {
  const res = await fetch(`/api/employees/${id}`)
  const data = await res.json()
  return data.data
}

const fetchChatHistory = async (employeeId: string): Promise<ChatMessage[]> => {
  const res = await fetch(`/api/employees/${employeeId}/chat`)
  const data = await res.json()
  return data.data?.messages || []
}

const sendMessage = async ({
  employeeId,
  message,
}: {
  employeeId: string
  message: string
}): Promise<{ response: string }> => {
  const res = await fetch(`/api/employees/${employeeId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  const data = await res.json()
  if (!data.success) {
    throw new Error(data.error?.message || '发送消息失败')
  }
  return data.data
}

const clearChat = async (employeeId: string) => {
  const res = await fetch(`/api/employees/${employeeId}/chat`, {
    method: 'DELETE',
  })
  return res.ok
}

export function EmployeeChat() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState('')
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([])
  const [showMenu, setShowMenu] = useState(false)

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => fetchEmployee(id!),
    enabled: !!id,
  })

  const { data: historyMessages } = useQuery({
    queryKey: ['chat-history', id],
    queryFn: () => fetchChatHistory(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (historyMessages) {
      setLocalMessages(historyMessages)
    }
  }, [historyMessages])

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (data, variables) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        status: 'sent',
      }
      setLocalMessages((prev) =>
        prev.map((msg) =>
          msg.id === `temp-${variables.message}` ? assistantMessage : msg
        )
      )
      queryClient.invalidateQueries({ queryKey: ['chat-history', id] })
    },
    onError: (error, variables) => {
      setLocalMessages((prev) =>
        prev.map((msg) =>
          msg.id === `temp-${variables.message}`
            ? { ...msg, status: 'error' }
            : msg
        )
      )
    },
  })

  const clearMutation = useMutation({
    mutationFn: clearChat,
    onSuccess: () => {
      setLocalMessages([])
      queryClient.invalidateQueries({ queryKey: ['chat-history', id] })
      setShowMenu(false)
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages])

  const handleSend = () => {
    if (!input.trim() || !id || sendMutation.isPending) return

    const userMessage: ChatMessage = {
      id: `temp-${input}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      status: 'sending',
    }

    setLocalMessages((prev) => [...prev, userMessage])
    setInput('')
    sendMutation.mutate({ employeeId: id, message: input })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">员工不存在</p>
        <button
          onClick={() => navigate('/employees')}
          className="mt-4 text-primary-600 hover:underline"
        >
          返回员工列表
        </button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/employees')}
            className="p-2 hover:bg-gray-100 rounded-lg mr-4"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl">
              {employee.avatar}
            </div>
            <div className="ml-3">
              <h1 className="font-bold text-gray-900">{employee.name}</h1>
              <p className="text-sm text-gray-500">
                {employee.roleName} · {employee.department}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              employee.status === 'active'
                ? 'bg-green-100 text-green-800'
                : employee.status === 'busy'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${
                employee.status === 'active'
                  ? 'bg-green-500 animate-pulse'
                  : employee.status === 'busy'
                  ? 'bg-yellow-500'
                  : 'bg-gray-500'
              }`}
            />
            {employee.status === 'active'
              ? '在线'
              : employee.status === 'busy'
              ? '忙碌'
              : '离线'}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10"
                >
                  <button
                    onClick={() => clearMutation.mutate(id!)}
                    disabled={clearMutation.isPending}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    清空对话
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
        {localMessages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              开始与 {employee.name} 对话
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              这位数字员工擅长 {employee.openclawConfig.skills.join('、')} 等技能。
              试着给TA分配任务或询问问题。
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['帮我分析这份数据', '写一个Python脚本', '设计一个Logo', '总结一下这份文档'].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion)
                      inputRef.current?.focus()
                    }}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </div>
        ) : (
          <>
            {localMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] flex ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary-600 ml-2'
                        : 'bg-gradient-to-br from-primary-100 to-primary-200 mr-2'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-sm">{employee.avatar}</span>
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.status === 'sending' && (
                      <div className="flex items-center mt-1 text-xs opacity-70">
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        发送中...
                      </div>
                    )}
                    {message.status === 'error' && (
                      <div className="flex items-center mt-1 text-xs text-red-400">
                        发送失败
                        <button
                          onClick={() =>
                            sendMutation.mutate({
                              employeeId: id!,
                              message: message.content,
                            })
                          }
                          className="ml-2 underline"
                        >
                          重试
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {sendMutation.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <Bot className="w-5 h-5 text-primary-600 mr-2" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`给 ${employee.name} 发送消息...`}
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none max-h-32"
              style={{ minHeight: '48px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  )
}
