import matter from 'gray-matter';
import { SkillFile, ParsedSkill, Level } from '../types';

/**
 * 解析 skill.md 文件
 * 支持的格式：
 * ```yaml
 * ---
 * name: 张三
 * avatar: https://... (可选)
 * level: intermediate
 * bio: 个人简介
 * ---
 * ```
 *
 * ## 技能
 * - [x] 水质监测 (basic)
 * - [x] 科学投喂 (intermediate)
 * - [ ] 人工繁殖 (advanced)
 *
 * ## 成就
 * - 2023年养殖大赛冠军
 * - 发表论文3篇
 */

export function parseSkillFile(content: string): SkillFile {
  try {
    const { data, content: body } = matter(content);

    const skillFile: SkillFile = {
      name: data.name || '匿名用户',
      avatar: data.avatar || getDefaultAvatar(),
      level: validateLevel(data.level) || 'apprentice',
      bio: data.bio || '',
      skills: parseSkillsFromBody(body),
      achievements: parseAchievements(body)
    };

    return skillFile;
  } catch (error) {
    throw new Error('解析 skill.md 文件失败: ' + (error as Error).message);
  }
}

// 解析技能列表
function parseSkillsFromBody(body: string): ParsedSkill[] {
  const skills: ParsedSkill[] = [];

  // 查找技能部分
  const skillSection = extractSection(body, '技能', 'Skills');
  if (!skillSection) return skills;

  // 解析列表项
  const lines = skillSection.split('\n');
  for (const line of lines) {
    // 匹配 - [x] 技能名称 (等级) 或 - [x] 技能名称
    const match = line.match(/^\s*-\s*\[([ x])\]\s*(.+?)(?:\s*\((\w+)\))?\s*$/i);
    if (match) {
      const [, checked, name, level] = match;
      if (checked.toLowerCase() === 'x') {
        skills.push({
          name: name.trim(),
          level: validateSkillLevel(level) || 'basic',
          description: ''
        });
      }
    }
  }

  return skills;
}

// 解析成就列表
function parseAchievements(body: string): string[] {
  const achievements: string[] = [];

  const achievementSection = extractSection(body, '成就', 'Achievements');
  if (!achievementSection) return achievements;

  const lines = achievementSection.split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*-\s*(.+)$/);
    if (match) {
      achievements.push(match[1].trim());
    }
  }

  return achievements;
}

// 提取章节内容
function extractSection(body: string, ...headers: string[]): string | null {
  for (const header of headers) {
    const regex = new RegExp(`##\\s*${header}\\s*\\n(.*?)(?=\\n##|$)`, 's');
    const match = body.match(regex);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

// 验证等级
function validateLevel(level: string): Level | null {
  const validLevels: Level[] = [
    'apprentice', 'junior', 'intermediate', 'advanced',
    'expert', 'master', 'legendary'
  ];
  return validLevels.includes(level as Level) ? level as Level : null;
}

// 验证技能等级
function validateSkillLevel(level: string): 'basic' | 'intermediate' | 'advanced' | 'expert' | null {
  const validLevels = ['basic', 'intermediate', 'advanced', 'expert'];
  return validLevels.includes(level) ? level as 'basic' | 'intermediate' | 'advanced' | 'expert' : null;
}

// 获取默认头像
function getDefaultAvatar(): string {
  const avatars = [
    '🦐', '🦞', '🦀', '🐙', '🦑', '🐡', '🐠', '🐟'
  ];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

// 生成示例 skill.md 文件
export function generateExampleSkillFile(): string {
  return `---
name: 张小龙
avatar: 🦞
level: intermediate
bio: 专注小龙虾养殖5年，擅长水质管理和病害防治
---

# ClawSocial Skill Profile

## 技能

### 养殖技术
- [x] 虾塘建设 (basic)
- [x] 苗种投放 (basic)
- [x] 科学投喂 (intermediate)
- [ ] 人工繁殖 (advanced)

### 水质管理
- [x] 水质监测 (basic)
- [x] 水质调控 (intermediate)
- [x] 水草管理 (intermediate)
- [ ] 生态修复 (advanced)

### 疾病防治
- [x] 疾病预防 (basic)
- [x] 病害诊断 (intermediate)
- [ ] 病害治疗 (intermediate)
- [ ] 应急处理 (advanced)

### 设备维护
- [x] 增氧设备 (basic)
- [ ] 监控设备 (intermediate)
- [ ] 自动投喂 (advanced)

## 成就

- 2023年湖北省小龙虾养殖大赛二等奖
- 发表《稻虾共作模式研究》论文1篇
- 带动周边10户农户开展小龙虾养殖
- 年产小龙虾5000斤，纯收入10万元

## 联系方式

- 所在地：湖北省潜江市
- 擅长领域：水质管理、病害防治
- 愿意交流：非常乐意分享经验，欢迎交流
`;
}
