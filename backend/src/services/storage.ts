// ============================================
// 数据持久化服务 - JSON文件存储
// ============================================

import { writeFile, readFile, mkdir, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '../../data');

export interface StorageOptions {
  pretty?: boolean;
}

export class StorageService {
  private dataDir: string;

  constructor(customDir?: string) {
    this.dataDir = customDir || DATA_DIR;
  }

  // 确保数据目录存在
  private async ensureDir(): Promise<void> {
    try {
      await access(this.dataDir);
    } catch {
      await mkdir(this.dataDir, { recursive: true });
    }
  }

  // 获取文件路径
  private getFilePath(filename: string): string {
    return join(this.dataDir, `${filename}.json`);
  }

  // 保存数据
  async save<T>(filename: string, data: T, options: StorageOptions = {}): Promise<void> {
    await this.ensureDir();
    const filepath = this.getFilePath(filename);
    const content = JSON.stringify(data, null, options.pretty ? 2 : undefined);
    await writeFile(filepath, content, 'utf-8');
  }

  // 读取数据
  async load<T>(filename: string, defaultValue: T): Promise<T> {
    try {
      const filepath = this.getFilePath(filename);
      const content = await readFile(filepath, 'utf-8');
      return JSON.parse(content) as T;
    } catch {
      return defaultValue;
    }
  }

  // 保存 Map 数据
  async saveMap<T>(filename: string, map: Map<string, T>, options?: StorageOptions): Promise<void> {
    const data = Array.from(map.entries());
    await this.save(filename, data, options);
  }

  // 加载 Map 数据
  async loadMap<T>(filename: string): Promise<Map<string, T>> {
    const data = await this.load<[string, T][]>(filename, []);
    return new Map(data);
  }

  // 保存计数器
  async saveCounter(filename: string, counter: Map<string, number>): Promise<void> {
    const data = Array.from(counter.entries());
    await this.save(filename, data);
  }

  // 加载计数器
  async loadCounter(filename: string): Promise<Map<string, number>> {
    const data = await this.load<[string, number][]>(filename, []);
    return new Map(data);
  }
}

export const storageService = new StorageService();
