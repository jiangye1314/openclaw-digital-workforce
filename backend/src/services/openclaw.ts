// ============================================
// OpenClaw 连接管理服务 - 支持本地和云端 Gateway
// ============================================

import type { OpenClawConnection, GatewayType, ApiResponse } from '@openclaw-digital-workforce/shared';
import { storageService } from './storage.js';
import WebSocket from 'ws';

const STORAGE_KEY = 'openclaw-connections';

export interface CreateConnectionInput {
  name: string;
  type: GatewayType;
  url: string;
  description?: string;
  apiKey?: string;
  tags?: string[];
  isDefault?: boolean;
  customConfig?: Record<string, unknown>;
}

export class OpenClawService {
  private connections: Map<string, OpenClawConnection> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private websockets: Map<string, WebSocket> = new Map();
  private initialized = false;

  // 初始化 - 从文件加载数据
  async init(): Promise<void> {
    if (this.initialized) return;

    const data = await storageService.loadMap<OpenClawConnection>(STORAGE_KEY);
    this.connections = data;

    // 为所有连接设置健康检查
    for (const [id, connection] of data) {
      if (connection.status === 'connected') {
        this.setupHealthCheck(id);
      }
    }

    this.initialized = true;
    console.log(`[OpenClawService] 已加载 ${data.size} 个连接`);
  }

  // 保存数据到文件
  private async save(): Promise<void> {
    await storageService.saveMap(STORAGE_KEY, this.connections, { pretty: true });
  }

  // 确保已初始化
  private async ensureInit(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  // 创建新连接
  async createConnection(
    input: CreateConnectionInput
  ): Promise<ApiResponse<OpenClawConnection>> {
    await this.ensureInit();

    try {
      const { name, type, url, description, apiKey, tags, isDefault, customConfig } = input;

      // 如果设置为默认，取消其他默认连接
      if (isDefault) {
        await this.clearDefaultConnections();
      }

      // 测试连接
      const healthCheck = await this.testConnection(url, apiKey);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const connection: any = {
        id: crypto.randomUUID(),
        name,
        type,
        url,
        description: description || this.getDefaultDescription(type, url),
        status: healthCheck.success ? 'connected' : 'error',
        config: {
          apiKey,
          timeout: customConfig?.timeout as number || 120000,
          retryAttempts: customConfig?.retryAttempts as number || 3
        },
        metadata: {
          ...healthCheck.data,
          tags: tags || [],
          isDefault: isDefault || false,
          provider: this.detectProvider(url, customConfig)
        },
        lastConnected: healthCheck.success ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.connections.set(connection.id, connection);
      await this.save();

      // 设置健康检查定时器
      if (healthCheck.success) {
        this.setupHealthCheck(connection.id);
      }

      return { success: true, data: connection };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONNECTION_FAILED',
          message: error instanceof Error ? error.message : '连接失败'
        }
      };
    }
  }

  // 获取默认描述
  private getDefaultDescription(type: GatewayType, url: string): string {
    if (type === 'local') {
      return `本地 OpenClaw 实例 (${url})`;
    } else if (type === 'cloud') {
      return `云端 OpenClaw 服务 (${url})`;
    } else if (type === 'hybrid') {
      return `混合模式 OpenClaw (${url})`;
    }
    return `OpenClaw 连接 (${url})`;
  }

  // 检测提供商
  private detectProvider(url: string, customConfig?: Record<string, unknown>): string {
    if (customConfig?.provider) {
      return customConfig.provider as string;
    }
    if (url.includes('kimi.com')) return 'kimi';
    if (url.includes('anthropic')) return 'anthropic';
    if (url.includes('localhost') || url.includes('127.0.0.1')) return 'local';
    return 'unknown';
  }

  // 清除默认连接
  private async clearDefaultConnections(): Promise<void> {
    for (const [id, conn] of this.connections) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((conn.metadata as any)?.isDefault) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (conn.metadata as any).isDefault = false;
        this.connections.set(id, conn);
      }
    }
    await this.save();
  }

  // 测试连接 - 支持 WebSocket 和 HTTP
  async testConnection(url: string, apiKey?: string): Promise<ApiResponse<{
    version?: string;
    channels?: string[];
    skills?: string[];
  }>> {
    try {
      // 首先尝试 WebSocket 连接 (真正的 OpenClaw)
      const wsUrl = url.replace(/^http/, 'ws');
      const wsResult = await this.testWebSocketConnection(wsUrl, apiKey);
      if (wsResult.success) {
        return wsResult;
      }

      // 回退到 HTTP 健康检查
      return await this.testHttpConnection(url, apiKey);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: error instanceof Error ? error.message : '健康检查失败'
        }
      };
    }
  }

  // 测试 WebSocket 连接
  private async testWebSocketConnection(wsUrl: string, apiKey?: string): Promise<ApiResponse<{
    version?: string;
    channels?: string[];
    skills?: string[];
  }>> {
    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(wsUrl, [], {
          headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : undefined,
          timeout: 5000
        });

        const timeout = setTimeout(() => {
          ws.terminate();
          resolve({
            success: false,
            error: { code: 'WS_TIMEOUT', message: 'WebSocket 连接超时' }
          });
        }, 5000);

        ws.on('open', () => {
          clearTimeout(timeout);
          ws.send(JSON.stringify({
            type: 'health',
            id: crypto.randomUUID()
          }));
        });

        ws.on('message', (data) => {
          clearTimeout(timeout);
          try {
            const response = JSON.parse(data.toString());
            ws.close();
            resolve({
              success: true,
              data: {
                version: response.version || '2026.3.3',
                channels: response.channels || [],
                skills: response.skills || []
              }
            });
          } catch {
            ws.close();
            resolve({
              success: true,
              data: { version: '2026.3.3', channels: [], skills: [] }
            });
          }
        });

        ws.on('error', () => {
          clearTimeout(timeout);
          ws.terminate();
          resolve({
            success: false,
            error: { code: 'WS_ERROR', message: 'WebSocket 连接失败' }
          });
        });
      } catch (error) {
        resolve({
          success: false,
          error: {
            code: 'WS_EXCEPTION',
            message: error instanceof Error ? error.message : 'WebSocket 异常'
          }
        });
      }
    });
  }

  // 测试 HTTP 连接
  private async testHttpConnection(url: string, apiKey?: string): Promise<ApiResponse<{
    version?: string;
    channels?: string[];
    skills?: string[];
  }>> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          version: data.version,
          channels: data.channels || [],
          skills: data.skills || []
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'HTTP_CHECK_FAILED',
          message: error instanceof Error ? error.message : 'HTTP 检查失败'
        }
      };
    }
  }

  // 获取所有连接
  async getAllConnections(): Promise<OpenClawConnection[]> {
    await this.ensureInit();
    return Array.from(this.connections.values());
  }

  // 按类型获取连接
  async getConnectionsByType(type: GatewayType): Promise<OpenClawConnection[]> {
    await this.ensureInit();
    const connections = await this.getAllConnections();
    return connections.filter(c => c.type === type);
  }

  // 获取默认连接
  async getDefaultConnection(): Promise<OpenClawConnection | undefined> {
    await this.ensureInit();
    const connections = await this.getAllConnections();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return connections.find(c => (c.metadata as any)?.isDefault);
  }

  // 获取本地连接
  async getLocalConnections(): Promise<OpenClawConnection[]> {
    await this.ensureInit();
    const connections = await this.getAllConnections();
    return connections.filter(c =>
      c.type === 'local' || c.url.includes('localhost') || c.url.includes('127.0.0.1')
    );
  }

  // 获取云端连接
  async getCloudConnections(): Promise<OpenClawConnection[]> {
    await this.ensureInit();
    const connections = await this.getAllConnections();
    return connections.filter(c =>
      c.type === 'cloud' || (!c.url.includes('localhost') && !c.url.includes('127.0.0.1'))
    );
  }

  // 获取单个连接
  async getConnection(id: string): Promise<OpenClawConnection | undefined> {
    await this.ensureInit();
    return this.connections.get(id);
  }

  // 更新连接
  async updateConnection(
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updates: Partial<Pick<OpenClawConnection, 'name' | 'url' | 'config'>> & { [key: string]: any }
  ): Promise<ApiResponse<OpenClawConnection>> {
    await this.ensureInit();

    const connection = this.connections.get(id);
    if (!connection) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '连接不存在' }
      };
    }

    // 如果设置为默认，取消其他默认
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((updates as any).isDefault) {
      await this.clearDefaultConnections();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated: any = {
      ...connection,
      ...updates,
      metadata: {
        ...connection.metadata,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(updates.tags && { tags: updates.tags }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(updates.isDefault !== undefined && { isDefault: updates.isDefault })
      },
      updatedAt: new Date().toISOString()
    };

    // 如果 URL 或 API key 变更，重新测试连接
    if (updates.url || updates.config?.apiKey) {
      const healthCheck = await this.testConnection(
        updated.url,
        updated.config.apiKey
      );
      updated.status = healthCheck.success ? 'connected' : 'error';
      if (healthCheck.success) {
        updated.metadata = { ...updated.metadata, ...healthCheck.data };
        updated.lastConnected = new Date().toISOString();
        this.setupHealthCheck(id);
      }
    }

    this.connections.set(id, updated);
    await this.save();
    return { success: true, data: updated };
  }

  // 删除连接
  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    await this.ensureInit();

    // 清除健康检查定时器
    const interval = this.healthCheckIntervals.get(id);
    if (interval) {
      clearInterval(interval);
      this.healthCheckIntervals.delete(id);
    }

    const deleted = this.connections.delete(id);
    if (!deleted) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '连接不存在' }
      };
    }

    await this.save();
    return { success: true };
  }

  // 设置健康检查
  private setupHealthCheck(connectionId: string, intervalMs = 60000): void {
    // 清除现有的定时器
    const existing = this.healthCheckIntervals.get(connectionId);
    if (existing) {
      clearInterval(existing);
    }

    const interval = setInterval(async () => {
      const connection = this.connections.get(connectionId);
      if (!connection) {
        clearInterval(interval);
        return;
      }

      const healthCheck = await this.testConnection(
        connection.url,
        connection.config.apiKey
      );

      connection.status = healthCheck.success ? 'connected' : 'error';
      if (healthCheck.success) {
        connection.metadata = { ...connection.metadata, ...healthCheck.data };
        connection.lastConnected = new Date().toISOString();
      }

      this.connections.set(connectionId, connection);
      await this.save();
    }, intervalMs);

    this.healthCheckIntervals.set(connectionId, interval);
  }

  // 手动触发健康检查
  async runHealthCheck(id: string): Promise<ApiResponse<{ status: string }>> {
    await this.ensureInit();

    const connection = this.connections.get(id);
    if (!connection) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '连接不存在' }
      };
    }

    const healthCheck = await this.testConnection(
      connection.url,
      connection.config.apiKey
    );

    connection.status = healthCheck.success ? 'connected' : 'error';
    if (healthCheck.success) {
      connection.metadata = { ...connection.metadata, ...healthCheck.data };
      connection.lastConnected = new Date().toISOString();
    }

    this.connections.set(id, connection);
    await this.save();

    return {
      success: true,
      data: { status: connection.status }
    };
  }

  // 获取连接统计
  async getConnectionStats(): Promise<{
    total: number;
    connected: number;
    error: number;
    local: number;
    cloud: number;
    hybrid: number;
  }> {
    await this.ensureInit();
    const connections = await this.getAllConnections();

    return {
      total: connections.length,
      connected: connections.filter(c => c.status === 'connected').length,
      error: connections.filter(c => c.status === 'error').length,
      local: connections.filter(c => c.type === 'local').length,
      cloud: connections.filter(c => c.type === 'cloud').length,
      hybrid: connections.filter(c => c.type === 'hybrid').length
    };
  }

  // 通过连接发送消息到 OpenClaw - 使用 /invoke 端点调用 llm-chat skill
  async sendMessage(
    connectionId: string,
    message: string,
    options?: {
      channel?: string;
      threadId?: string;
      systemPrompt?: string;
    }
  ): Promise<ApiResponse<{ messageId: string; response: string }>> {
    await this.ensureInit();

    const connection = this.connections.get(connectionId);
    if (!connection) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '连接不存在' }
      };
    }

    if (connection.status !== 'connected') {
      return {
        success: false,
        error: { code: 'NOT_CONNECTED', message: '连接未建立' }
      };
    }

    try {
      const controller = new AbortController();
      const timeoutMs = Math.max(connection.config.timeout || 30000, 120000);
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (connection.config.apiKey) {
        headers['Authorization'] = `Bearer ${connection.config.apiKey}`;
      }

      // 使用 OpenClaw 的 /invoke 端点调用 AI
      const response = await fetch(`${connection.url}/invoke`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          skill: 'llm-chat',
          params: {
            messages: [
              ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
              { role: 'user', content: message }
            ],
            max_tokens: 2048,
            temperature: 0.7
          },
          channel: options?.channel
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // 解析 OpenClaw 响应格式
      let responseText = '';
      if (data.success && data.data?.result) {
        // llm-chat skill 返回格式
        responseText = data.data.result.content || data.data.result.text || data.data.result;
      } else if (data.content?.[0]?.text) {
        // Kimi API 格式
        responseText = data.content[0].text;
      } else if (typeof data === 'string') {
        responseText = data;
      } else {
        responseText = JSON.stringify(data);
      }

      return {
        success: true,
        data: {
          messageId: data.id || Date.now().toString(),
          response: responseText
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MESSAGE_FAILED',
          message: error instanceof Error ? error.message : '发送消息失败'
        }
      };
    }
  }

  // 获取可用技能列表
  async getAvailableSkills(connectionId: string): Promise<ApiResponse<string[]>> {
    await this.ensureInit();

    const connection = this.connections.get(connectionId);
    if (!connection) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '连接不存在' }
      };
    }

    try {
      const headers: Record<string, string> = {};
      if (connection.config.apiKey) {
        headers['Authorization'] = `Bearer ${connection.config.apiKey}`;
      }

      const response = await fetch(`${connection.url}/skills`, { headers });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.skills || []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_SKILLS_FAILED',
          message: error instanceof Error ? error.message : '获取技能列表失败'
        }
      };
    }
  }
}

export const openclawService = new OpenClawService();
