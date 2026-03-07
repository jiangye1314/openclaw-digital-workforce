// ============================================
// 飞书渠道集成服务
// ============================================

export interface FeishuNotification {
  taskId: string;
  teamName: string;
  task: string;
  assignees: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface FeishuCompletedNotification {
  taskId: string;
  teamName: string;
  task: string;
  result: string;
}

export class FeishuService {
  private webhookUrl?: string;
  private appId?: string;
  private appSecret?: string;

  constructor() {
    this.webhookUrl = process.env.FEISHU_WEBHOOK_URL;
    this.appId = process.env.FEISHU_APP_ID;
    this.appSecret = process.env.FEISHU_APP_SECRET;
  }

  // 检查是否已配置
  isConfigured(): boolean {
    return !!this.webhookUrl || (!!this.appId && !!this.appSecret);
  }

  // 发送任务通知
  async sendTaskNotification(notification: FeishuNotification): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('[Feishu] 未配置飞书，跳过通知');
      return false;
    }

    try {
      const priorityColors: Record<string, string> = {
        low: 'blue',
        medium: 'green',
        high: 'orange',
        urgent: 'red'
      };

      const priorityLabels: Record<string, string> = {
        low: '低',
        medium: '中',
        high: '高',
        urgent: '紧急'
      };

      const card = {
        msg_type: 'interactive',
        card: {
          config: { wide_screen_mode: true },
          header: {
            title: { tag: 'plain_text', content: '🤖 数字员工团队 - 新任务' },
            template: priorityColors[notification.priority] || 'blue'
          },
          elements: [
            {
              tag: 'div',
              text: {
                tag: 'lark_md',
                content: `**团队：** ${notification.teamName}\n**任务：** ${notification.task}\n**执行人：** ${notification.assignees.join(', ')}\n**优先级：** ${priorityLabels[notification.priority] || '中'}`
              }
            },
            {
              tag: 'action',
              actions: [
                {
                  tag: 'button',
                  text: { tag: 'plain_text', content: '查看详情' },
                  type: 'primary',
                  url: `http://localhost:5173/tasks/${notification.taskId}`
                }
              ]
            }
          ]
        }
      };

      await this.sendMessage(card);
      return true;
    } catch (error) {
      console.error('[Feishu] 发送通知失败:', error);
      return false;
    }
  }

  // 发送任务完成通知
  async sendTaskCompletedNotification(notification: FeishuCompletedNotification): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const card = {
        msg_type: 'interactive',
        card: {
          config: { wide_screen_mode: true },
          header: {
            title: { tag: 'plain_text', content: '✅ 数字员工团队 - 任务完成' },
            template: 'green'
          },
          elements: [
            {
              tag: 'div',
              text: {
                tag: 'lark_md',
                content: `**团队：** ${notification.teamName}\n**任务：** ${notification.task}\n**结果：** ${notification.result.slice(0, 100)}${notification.result.length > 100 ? '...' : ''}`
              }
            },
            {
              tag: 'action',
              actions: [
                {
                  tag: 'button',
                  text: { tag: 'plain_text', content: '查看结果' },
                  type: 'primary',
                  url: `http://localhost:5173/tasks/${notification.taskId}`
                }
              ]
            }
          ]
        }
      };

      await this.sendMessage(card);
      return true;
    } catch (error) {
      console.error('[Feishu] 发送完成通知失败:', error);
      return false;
    }
  }

  // 发送原始消息
  private async sendMessage(payload: unknown): Promise<void> {
    if (!this.webhookUrl) {
      throw new Error('飞书 webhook URL 未配置');
    }

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`飞书 API 错误: ${response.status}`);
    }

    const data = await response.json();
    if (data.code !== 0) {
      throw new Error(`飞书 API 返回错误: ${data.msg}`);
    }
  }

  // 测试飞书连接
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return { success: false, message: '飞书未配置' };
    }

    try {
      await this.sendMessage({
        msg_type: 'text',
        content: { text: '🤖 数字员工团队管理系统 - 飞书连接测试' }
      });
      return { success: true, message: '飞书连接成功' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '连接失败'
      };
    }
  }
}

export const feishuService = new FeishuService();
