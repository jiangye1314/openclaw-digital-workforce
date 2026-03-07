import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Users,
  Server,
  Check,
  Plus,
  Minus,
} from 'lucide-react'
import { TeamTemplateCard } from '../components/TeamTemplateCard'
import { EmployeeBadgePreview } from '../components/EmployeeBadge'
import type { TeamTemplateConfig } from '../types'

const fetchTemplates = async (): Promise<TeamTemplateConfig[]> => {
  const res = await fetch('/api/teams/templates/list')
  const data = await res.json()
  return data.data || []
}

const fetchConnections = async (): Promise<OpenClawConnection[]> => {
  const res = await fetch('/api/connections')
  const data = await res.json()
  return data.data || []
}

const createTeam = async (teamData: {
  name: string
  description: string
  templateId: string
  connectionId: string
  size: number
}): Promise<{ data: { id: string } }> => {
  const res = await fetch('/api/teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teamData),
  })
  return res.json()
}

export function CreateTeam() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [teamName, setTeamName] = useState('')
  const [teamDescription, setTeamDescription] = useState('')
  const [teamSize, setTeamSize] = useState(3)
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null)

  const { data: templates } = useQuery({
    queryKey: ['team-templates'],
    queryFn: fetchTemplates,
  })

  const { data: connections } = useQuery({
    queryKey: ['connections'],
    queryFn: fetchConnections,
  })

  const createTeamMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      navigate(`/teams/${data.data.id}`)
    },
  })

  const selectedTemplateData = templates?.find((t) => t.template === selectedTemplate)
  const selectedConnectionData = connections?.find((c) => c.id === selectedConnection)

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleCreate = () => {
    if (selectedTemplateData && selectedConnectionData && selectedTemplate) {
      createTeamMutation.mutate({
        name: teamName,
        description: teamDescription,
        templateId: selectedTemplate,
        connectionId: selectedConnectionData.id,
        size: teamSize,
      })
    }
  }

  const steps = [
    { number: 1, title: '选择模板', description: '选择适合您需求的团队模板' },
    { number: 2, title: '配置团队', description: '设置团队名称和规模' },
    { number: 3, title: '选择网关', description: '选择 OpenClaw 网关连接' },
    { number: 4, title: '确认创建', description: '预览并创建团队' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/teams')}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回团队列表
        </button>
        <h1 className="text-2xl font-bold text-gray-900">创建新团队</h1>
        <p className="text-gray-500 mt-1">选择模板并配置您的数字员工团队</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= s.number
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s.number ? <Check className="w-5 h-5" /> : s.number}
              </div>
              <div className="ml-3 hidden sm:block">
                <p
                  className={`text-sm font-medium ${
                    step >= s.number ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {s.title}
                </p>
                <p className="text-xs text-gray-400">{s.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-24 h-0.5 mx-4 ${
                    step > s.number ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
        >
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">选择团队模板</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates?.map((template) => (
                  <TeamTemplateCard
                    key={template.template}
                    template={template}
                    isSelected={selectedTemplate === template.template}
                    onClick={() => setSelectedTemplate(template.template)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 2 && selectedTemplateData && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">配置团队</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    团队名称
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="输入团队名称"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    团队描述
                  </label>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    placeholder="描述团队的职责和目标"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    团队规模
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setTeamSize(Math.max(selectedTemplateData.structure.minSize, teamSize - 1))}
                      className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                      {teamSize}
                    </span>
                    <button
                      onClick={() => setTeamSize(Math.min(selectedTemplateData.structure.maxSize, teamSize + 1))}
                      className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500">
                      推荐: {selectedTemplateData.structure.minSize}-{selectedTemplateData.structure.maxSize} 人
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    预览
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {selectedTemplateData.defaultRoles.slice(0, teamSize).map((role, index) => (
                      <EmployeeBadgePreview
                        key={`${role}-${index}`}
                        role={role}
                        theme={getThemeForTemplate(selectedTemplateData.template)}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">选择 OpenClaw 网关</h2>

              {connections?.length === 0 ? (
                <div className="text-center py-12">
                  <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无网关连接</p>
                  <button
                    onClick={() => navigate('/connections')}
                    className="mt-4 text-primary-600 font-medium hover:text-primary-700"
                  >
                    先去创建连接 →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections?.map((connection) => (
                    <motion.div
                      key={connection.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedConnection(connection.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedConnection === connection.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              connection.status === 'connected'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            <Server className="w-5 h-5" />
                          </div>
                          <div className="ml-3">
                            <p className="font-semibold text-gray-900">{connection.name}</p>
                            <p className="text-sm text-gray-500">{connection.url}</p>
                          </div>
                        </div>
                        <div className="text-right">
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
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && selectedTemplateData && selectedConnectionData && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">确认创建</h2>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">团队名称</p>
                    <p className="font-semibold text-gray-900">{teamName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">模板类型</p>
                    <p className="font-semibold text-gray-900">{selectedTemplateData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">团队规模</p>
                    <p className="font-semibold text-gray-900">{teamSize} 人</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">网关连接</p>
                    <p className="font-semibold text-gray-900">{selectedConnectionData.name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">描述</p>
                  <p className="text-gray-700">{teamDescription || '暂无描述'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">将创建的数字员工</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplateData.defaultRoles.slice(0, teamSize).map((role, index) => (
                      <span
                        key={`${role}-${index}`}
                        className="px-3 py-1 bg-white rounded-lg text-sm border border-gray-200"
                      >
                        {getRoleName(role)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className={`flex items-center px-6 py-3 rounded-xl font-medium transition-colors ${
            step === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          上一步
        </button>

        {step < 4 ? (
          <button
            onClick={handleNext}
            disabled={
              (step === 1 && !selectedTemplate) ||
              (step === 2 && !teamName) ||
              (step === 3 && !selectedConnection)
            }
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            下一步
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={createTeamMutation.isPending}
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {createTeamMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                创建中...
              </>
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />
                创建团队
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function getThemeForTemplate(template: string): string {
  const themeMap: Record<string, string> = {
    startup: 'tech',
    enterprise: 'business',
    project: 'default',
    support: 'business',
    content: 'creative',
    dev: 'tech',
    research: 'tech',
    custom: 'default',
  }
  return themeMap[template] || 'default'
}

function getRoleName(role: string): string {
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
  return roleNames[role] || role
}
