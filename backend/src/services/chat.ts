// ============================================
// 聊天服务 - 处理数字员工对话
// ============================================

import type { DigitalEmployee, ApiResponse } from '@openclaw-digital-workforce/shared';
import { storageService } from './storage.js';

const STORAGE_KEY = 'chat-history';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  employeeId: string;
  messages: ChatMessage[];
}

export class ChatService {
  private sessions: Map<string, ChatSession> = new Map();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    const data = await storageService.loadMap<ChatSession>(STORAGE_KEY);
    this.sessions = data;

    this.initialized = true;
    console.log(`[ChatService] 已加载 ${data.size} 个聊天会话`);
  }

  private async save(): Promise<void> {
    await storageService.saveMap(STORAGE_KEY, this.sessions, { pretty: true });
  }

  private async ensureInit(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  // 获取聊天记录
  async getChatHistory(employeeId: string): Promise<ChatMessage[]> {
    await this.ensureInit();
    const session = this.sessions.get(employeeId);
    return session?.messages || [];
  }

  // 发送消息并获取AI回复
  async sendMessage(
    employeeId: string,
    message: string,
    employee: DigitalEmployee
  ): Promise<ApiResponse<{ response: string }>> {
    await this.ensureInit();

    try {
      // 保存用户消息
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      let session = this.sessions.get(employeeId);
      if (!session) {
        session = { employeeId, messages: [] };
        this.sessions.set(employeeId, session);
      }
      session.messages.push(userMessage);

      // 调用AI获取回复
      const aiResponse = await this.callAI(message, employee, session.messages);

      // 保存AI回复
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };
      session.messages.push(assistantMessage);

      await this.save();

      return {
        success: true,
        data: { response: aiResponse },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AI_CALL_FAILED',
          message: error instanceof Error ? error.message : 'AI调用失败',
        },
      };
    }
  }

  // 调用AI服务
  private async callAI(
    message: string,
    employee: DigitalEmployee,
    history: ChatMessage[]
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modelConfig = (employee.openclawConfig as any).modelConfig;

    // 构建系统提示词
    const systemPrompt = this.buildSystemPrompt(employee);

    // 构建消息历史
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // 优先使用 Kimi API
    if (modelConfig?.apiKey && modelConfig?.baseUrl) {
      return this.callKimiAPI(messages, modelConfig);
    }

    // 回退到环境变量中的 Kimi API
    if (process.env.KIMI_API_KEY) {
      return this.callKimiAPI(messages, {
        baseUrl: process.env.KIMI_BASE_URL || 'https://api.kimi.com/coding/',
        apiKey: process.env.KIMI_API_KEY,
      });
    }

    // 回退到环境变量中的 Claude API
    if (process.env.ANTHROPIC_API_KEY) {
      return this.callClaudeAPI(messages);
    }

    // 使用模拟回复（用于测试）
    return this.generateMockResponse(message, employee);
  }

  // 调用 Kimi API
  private async callKimiAPI(
    messages: Array<{ role: string; content: string }>,
    config: { baseUrl?: string; apiKey?: string }
  ): Promise<string> {
    const response = await fetch(`${config.baseUrl}chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: 'kimi-coding',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Kimi API 错误: ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '抱歉，我没有理解您的问题。';
  }

  // 调用 Claude API
  private async callClaudeAPI(
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        messages: messages.filter((m) => m.role !== 'system').map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        system: messages.find((m) => m.role === 'system')?.content,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API 错误: ${error}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '抱歉，我没有理解您的问题。';
  }

  // 构建系统提示词
  private buildSystemPrompt(employee: DigitalEmployee): string {
    const roleDescriptions: Record<string, string> = {
      manager: '项目经理，擅长项目规划、团队协调和进度跟踪',
      developer: '开发工程师，擅长编程、代码审查和技术方案设计',
      designer: '设计师，擅长UI/UX设计、视觉设计和原型制作',
      analyst: '数据分析师，擅长数据分析、报表制作和商业洞察',
      writer: '内容创作者，擅长文案撰写、内容策划和创意写作',
      support: '客服专员，擅长客户沟通、问题解决和服务支持',
      researcher: '研究员，擅长技术研究、文献分析和知识整理',
      qa: '测试工程师，擅长测试用例设计、缺陷管理和质量保障',
      devops: '运维工程师，擅长系统部署、监控和自动化运维',
      custom: '专业助手，根据需求提供定制化服务',
    };

    return `你是${employee.name}，${employee.department}的${employee.roleName}。

角色描述：${roleDescriptions[employee.role] || '专业数字员工'}

技能：${employee.openclawConfig.skills.join('、')}

职责：
${employee.responsibilities.map((r) => `- ${r}`).join('\n')}

回复要求：
1. 保持专业、友好的语气
2. 根据你的角色专长回答问题
3. 如果不确定，坦诚告知并建议寻求帮助的方向
4. 使用中文回复
5. 回复简洁明了，突出重点`;
  }

  // 生成模拟回复（用于测试）
  private generateMockResponse(message: string, employee: DigitalEmployee): string {
    const responses: Record<string, string[]> = {
      manager: [
        `收到！作为项目经理，我来帮您梳理一下这个需求。首先，我们需要明确项目目标和里程碑...`,
        `好的，我来协调一下资源。根据当前团队情况，我建议这样安排...`,
        `明白了，这是一个典型的项目管理场景。我的建议是...`,
      ],
      developer: [
        `这个需求从技术角度来看，我建议采用以下方案...`,
        `我来帮您分析一下代码。根据我的判断...`,
        `好的，这是一个典型的开发任务。我可以这样实现...`,
      ],
      designer: [
        `从设计角度来看，我建议采用这样的视觉风格...`,
        `明白了，我来为您设计一个符合品牌调性的方案...`,
        `这个需求很有意思！我的设计思路是这样的...`,
      ],
      analyst: [
        `让我来分析一下这些数据。根据统计结果显示...`,
        `从数据角度来看，我发现了以下趋势...`,
        `好的，我来为您制作一份详细的数据分析报告...`,
      ],
      writer: [
        `明白了，我来为您撰写一份有吸引力的文案...`,
        `这个主题很有意思！我的创作思路是这样的...`,
        `根据您的需求，我建议采用这样的写作风格...`,
      ],
      support: [
        `感谢您的反馈！我已经记录了您的问题...`,
        `好的，我来帮您解决这个问题。请按以下步骤操作...`,
        `理解您的困扰，让我为您提供解决方案...`,
      ],
      researcher: [
        `这是一个有趣的研究课题。根据我收集的资料...`,
        `让我来为您分析一下这个技术领域的最新进展...`,
        `基于我的研究，我发现以下几点值得注意...`,
      ],
      qa: [
        `收到！我来为您设计测试用例覆盖这个场景...`,
        `好的，我来分析一下这个功能的测试点...`,
        `从质量保障角度，我建议进行以下测试...`,
      ],
      devops: [
        `好的，我来帮您配置这个部署流程...`,
        `从运维角度来看，我建议采用以下架构...`,
        `明白了，我来为您设置监控和告警...`,
      ],
      custom: [
        `收到！我会尽力帮助您完成这个任务...`,
        `好的，根据您的需求，我的建议是这样的...`,
        `明白了，让我来为您提供专业的支持...`,
      ],
    };

    const roleResponses = responses[employee.role] || responses.custom;
    return roleResponses[Math.floor(Math.random() * roleResponses.length)];
  }

  // 清空聊天记录
  async clearHistory(employeeId: string): Promise<void> {
    await this.ensureInit();
    this.sessions.delete(employeeId);
    await this.save();
  }
}

export const chatService = new ChatService();
