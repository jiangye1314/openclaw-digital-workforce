// ============================================
// AI 模型配置管理服务
// ============================================

import type { ModelConfig, ModelProvider, ApiResponse } from '@openclaw-digital-workforce/shared';
import { storageService } from './storage.js';

const STORAGE_KEY = 'model-configs';

export interface CreateModelInput {
  name: string;
  provider: ModelProvider;
  model: string;
  apiKey: string;
  baseUrl?: string;
  description?: string;
  isDefault?: boolean;
}

export class ModelService {
  private models: Map<string, ModelConfig> = new Map();
  private initialized = false;

  // 初始化 - 从文件加载数据
  async init(): Promise<void> {
    if (this.initialized) return;

    const data = await storageService.loadMap<ModelConfig>(STORAGE_KEY);
    this.models = data;

    this.initialized = true;
    console.log(`[ModelService] 已加载 ${data.size} 个模型配置`);
  }

  // 保存数据到文件
  private async save(): Promise<void> {
    await storageService.saveMap(STORAGE_KEY, this.models, { pretty: true });
  }

  // 确保已初始化
  private async ensureInit(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  // 创建模型配置
  async createModel(input: CreateModelInput): Promise<ApiResponse<ModelConfig>> {
    await this.ensureInit();
    try {
      const now = new Date().toISOString();

      // 如果设置为默认，取消其他默认配置
      if (input.isDefault) {
        for (const model of this.models.values()) {
          if (model.isDefault) {
            model.isDefault = false;
            model.updatedAt = now;
          }
        }
      }

      const model: ModelConfig = {
        id: crypto.randomUUID(),
        name: input.name,
        provider: input.provider,
        model: input.model,
        apiKey: input.apiKey,
        baseUrl: input.baseUrl,
        isDefault: input.isDefault || false,
        description: input.description,
        createdAt: now,
        updatedAt: now,
      };

      this.models.set(model.id, model);
      await this.save();

      return { success: true, data: model };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_MODEL_FAILED',
          message: error instanceof Error ? error.message : '创建模型配置失败'
        }
      };
    }
  }

  // 获取所有模型配置
  getAllModels(): ModelConfig[] {
    return Array.from(this.models.values());
  }

  // 获取单个模型配置
  getModel(id: string): ModelConfig | undefined {
    return this.models.get(id);
  }

  // 获取默认模型配置
  getDefaultModel(): ModelConfig | undefined {
    return this.getAllModels().find(m => m.isDefault);
  }

  // 按提供商获取模型配置
  getModelsByProvider(provider: ModelProvider): ModelConfig[] {
    return this.getAllModels().filter(m => m.provider === provider);
  }

  // 更新模型配置
  async updateModel(
    id: string,
    updates: Partial<Omit<ModelConfig, 'id' | 'createdAt'>>
  ): Promise<ApiResponse<ModelConfig>> {
    await this.ensureInit();
    const model = this.models.get(id);
    if (!model) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '模型配置不存在' }
      };
    }

    const now = new Date().toISOString();

    // 如果设置为默认，取消其他默认配置
    if (updates.isDefault) {
      for (const m of this.models.values()) {
        if (m.id !== id && m.isDefault) {
          m.isDefault = false;
          m.updatedAt = now;
        }
      }
    }

    const updated: ModelConfig = {
      ...model,
      ...updates,
      updatedAt: now
    };

    this.models.set(id, updated);
    await this.save();
    return { success: true, data: updated };
  }

  // 删除模型配置
  async deleteModel(id: string): Promise<ApiResponse<void>> {
    await this.ensureInit();
    const deleted = this.models.delete(id);
    if (!deleted) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '模型配置不存在' }
      };
    }

    await this.save();
    return { success: true };
  }

  // 测试模型连接
  async testModel(id: string): Promise<ApiResponse<{ valid: boolean; message: string }>> {
    await this.ensureInit();
    const model = this.models.get(id);
    if (!model) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: '模型配置不存在' }
      };
    }

    try {
      // 根据提供商进行简单的 API Key 格式验证
      let isValid = false;
      let message = '';

      switch (model.provider) {
        case 'kimi':
          // Kimi API Key 通常以 sk- 开头
          isValid = model.apiKey.startsWith('sk-') && model.apiKey.length > 20;
          message = isValid ? 'API Key 格式正确' : 'API Key 格式不正确';
          break;
        case 'anthropic':
          // Claude API Key 通常以 sk-ant- 开头
          isValid = model.apiKey.startsWith('sk-ant-') && model.apiKey.length > 20;
          message = isValid ? 'API Key 格式正确' : 'API Key 格式不正确';
          break;
        case 'openai':
          // OpenAI API Key 通常以 sk- 开头
          isValid = model.apiKey.startsWith('sk-') && model.apiKey.length > 20;
          message = isValid ? 'API Key 格式正确' : 'API Key 格式不正确';
          break;
        case 'custom':
          isValid = model.apiKey.length > 0;
          message = isValid ? '配置有效' : 'API Key 不能为空';
          break;
        default:
          isValid = model.apiKey.length > 0;
          message = isValid ? '配置有效' : 'API Key 不能为空';
      }

      return {
        success: true,
        data: { valid: isValid, message }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TEST_FAILED',
          message: error instanceof Error ? error.message : '测试失败'
        }
      };
    }
  }

  // 获取模型统计
  getModelStats(): {
    total: number;
    byProvider: Record<ModelProvider, number>;
    defaultCount: number;
  } {
    const all = this.getAllModels();
    const byProvider = {} as Record<ModelProvider, number>;

    for (const model of all) {
      byProvider[model.provider] = (byProvider[model.provider] || 0) + 1;
    }

    return {
      total: all.length,
      byProvider,
      defaultCount: all.filter(m => m.isDefault).length
    };
  }
}

export const modelService = new ModelService();
