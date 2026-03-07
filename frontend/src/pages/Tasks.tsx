// ============================================
// 任务执行页面 - 向数字员工团队下达任务
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, CheckCircle, AlertCircle, Bell } from 'lucide-react';

export function Tasks() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [task, setTask] = useState('');
  const [context, setContext] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [assigneeRole, setAssigneeRole] = useState('');
  const [notifyFeishu, setNotifyFeishu] = useState(false);
  const [feishuStatus, setFeishuStatus] = useState<{ configured: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    taskId?: string;
    message?: string;
  } | null>(null);

  // 获取团队列表
  useEffect(() => {
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => setTeams(data.data?.items || []))
      .catch(() => setTeams([]));
  }, []);

  // 获取飞书状态
  useEffect(() => {
    fetch('/api/tasks/feishu/status')
      .then(res => res.json())
      .then(data => setFeishuStatus(data.data))
      .catch(() => setFeishuStatus({ configured: false }));
  }, []);

  const handleSubmit = async () => {
    if (!selectedTeam || !task) return;

    setLoading(true);
    setResult(null);

    try {
      const notifyChannels = notifyFeishu ? ['feishu'] : [];
      const response = await fetch('/api/tasks/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeam,
          task,
          context: context || undefined,
          priority,
          assigneeRole: assigneeRole || undefined,
          notifyChannels
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          taskId: data.data.taskId,
          message: '任务已提交，正在执行中...'
        });
        // 清空表单
        setTask('');
        setContext('');
      } else {
        setResult({
          success: false,
          message: data.error?.message || '提交失败'
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: '网络错误'
      });
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: '低', color: 'bg-blue-100 text-blue-800' },
    { value: 'medium', label: '中', color: 'bg-green-100 text-green-800' },
    { value: 'high', label: '高', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: '紧急', color: 'bg-red-100 text-red-800' }
  ];

  const roleOptions = [
    { value: '', label: '自动分配' },
    { value: 'manager', label: '项目经理' },
    { value: 'developer', label: '开发工程师' },
    { value: 'designer', label: '设计师' },
    { value: 'analyst', label: '分析师' },
    { value: 'writer', label: '内容创作者' }
  ];

  return (
    <div className="min-h-screen bg-paper pb-20">
      {/* 头部 */}
      <div className="bg-paper border-b-2 border-ink/10 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/teams')}
            className="flex items-center text-ink-light hover:text-ink transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="font-handwriting">返回</span>
          </button>
          <h1 className="text-2xl font-bold text-ink font-handwriting flex items-center gap-2">
            <Send className="w-6 h-6" />
            下达任务
          </h1>
          <p className="text-ink-light font-handwriting mt-1">
            向数字员工团队分配工作任务
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 表单 */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-ink/10 p-6 space-y-6">
          {/* 选择团队 */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2 font-handwriting">
              选择团队 *
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-ink/20 focus:border-primary-500 focus:outline-none font-handwriting bg-white"
            >
              <option value="">请选择团队</option>
              {teams.map((team: any) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.employees?.length || 0}人)
                </option>
              ))}
            </select>
          </div>

          {/* 任务描述 */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2 font-handwriting">
              任务描述 *
            </label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="请描述需要完成的任务，例如：设计一个产品logo，分析用户数据..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-ink/20 focus:border-primary-500 focus:outline-none font-handwriting resize-none"
            />
          </div>

          {/* 背景信息 */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2 font-handwriting">
              背景信息（可选）
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="提供更多背景信息帮助员工理解任务..."
              rows={2}
              className="w-full px-4 py-3 rounded-lg border-2 border-ink/20 focus:border-primary-500 focus:outline-none font-handwriting resize-none"
            />
          </div>

          {/* 优先级和角色 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2 font-handwriting">
                优先级
              </label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPriority(opt.value as any)}
                    className={`px-3 py-2 rounded-lg text-sm font-handwriting transition-all ${
                      priority === opt.value
                        ? `${opt.color} ring-2 ring-offset-1 ring-ink/20`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-2 font-handwriting">
                分配给
              </label>
              <select
                value={assigneeRole}
                onChange={(e) => setAssigneeRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border-2 border-ink/20 focus:border-primary-500 focus:outline-none font-handwriting bg-white"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 飞书通知 */}
          {feishuStatus?.configured && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Bell className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyFeishu}
                    onChange={(e) => setNotifyFeishu(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="font-handwriting text-sm text-gray-700">
                    通过飞书通知团队成员
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={!selectedTeam || !task || loading}
            className="w-full py-4 bg-primary-600 text-white rounded-xl font-handwriting text-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                下达任务
              </>
            )}
          </button>

          {/* 结果提示 */}
          {result && (
            <div
              className={`p-4 rounded-lg flex items-start gap-3 ${
                result.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-handwriting ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.message}
                </p>
                {result.taskId && (
                  <p className="text-sm text-green-600 font-mono mt-1">
                    任务ID: {result.taskId}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-paper-yellow/50 rounded-xl p-6 border-2 border-dashed border-ink/20">
          <h3 className="font-handwriting font-bold text-ink mb-3">💡 使用说明</h3>
          <ul className="space-y-2 text-sm text-ink-light font-handwriting">
            <li>• 选择已创建的数字员工团队</li>
            <li>• 清晰描述任务目标和预期输出</li>
            <li>• 提供相关背景信息帮助理解</li>
            <li>• 任务将使用 Kimi Coding Plan 模型执行</li>
            <li>• 执行结果会通过飞书通知（如已配置）</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
