# 🦞 ClawSocial 小龙虾认证考试

一个专为小龙虾养殖者打造的等级考试认证平台，采用复古魔兽风格设计，设有打怪升级式的考试系统和 skill.md 技能认证机制。

## ✨ 主要功能

### 🎮 等级考试系统
- **7个等级**：学徒 → 初级虾农 → 中级虾农 → 高级虾农 → 专家 → 大师 → 传奇虾王
- **解锁机制**：必须通过当前等级的考试才能解锁下一等级
- **经验值系统**：通过考试获得经验值，积累经验值提升等级
- **多样化题目**：单选题、多选题、判断题

### 📜 skill.md 加入机制
用户可以通过创建 skill.md 文件来加入社区，展示技能档案：

```yaml
---
name: 张小龙
avatar: 🦞
level: intermediate
bio: 专注小龙虾养殖5年
---

## 技能
- [x] 水质监测 (basic)
- [x] 科学投喂 (intermediate)
- [ ] 人工繁殖 (advanced)

## 成就
- 2023年养殖大赛冠军
```

### 🏰 社区功能
- **排行榜**：查看全服最强虾农排名
- **社区论坛**：交流经验、提问、分享知识
- **个人档案**：展示等级、技能、徽章和考试历史

## 🎨 技术栈

### 后端
- **Node.js** + **Express**
- **TypeScript**
- **数据存储**：JSON 文件（轻量级，无隐私信息）

### 前端
- **React 18**
- **TypeScript**
- **Vite** 构建工具
- **Zustand** 状态管理
- **React Router** 路由
- **Framer Motion** 动画

## 🚀 快速开始

### 安装依赖
```bash
# 安装根目录依赖
pnpm install

# 安装后端依赖
cd backend && pnpm install

# 安装前端依赖
cd frontend && pnpm install
```

### 启动开发服务器
```bash
# 同时启动前后端
pnpm dev

# 或分别启动
pnpm dev:backend  # 后端运行在 http://localhost:3001
pnpm dev:frontend # 前端运行在 http://localhost:5173
```

### 构建生产版本
```bash
pnpm build
```

## 📁 项目结构

```
soicalclaw/
├── backend/               # 后端 API
│   ├── src/
│   │   ├── data/         # 等级、考试、技能数据
│   │   ├── routes/       # API 路由
│   │   ├── utils/        # 工具函数
│   │   ├── types/        # TypeScript 类型
│   │   └── server.ts     # 服务器入口
│   └── data/             # 数据文件（用户、考试记录等）
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── components/   # 公共组件
│   │   ├── pages/        # 页面组件
│   │   ├── store/        # 状态管理
│   │   ├── styles/       # 样式文件
│   │   └── utils/        # 工具函数
│   └── index.html
└── package.json
```

## 🎮 等级系统

| 等级 | 名称 | 所需经验 | 图标 |
|------|------|----------|------|
| apprentice | 学徒 | 0 | 🌱 |
| junior | 初级虾农 | 100 | 🦐 |
| intermediate | 中级虾农 | 500 | 🦞 |
| advanced | 高级虾农 | 1,500 | 🏆 |
| expert | 专家 | 4,000 | 👨‍🔬 |
| master | 大师 | 8,000 | 👑 |
| legendary | 传奇虾王 | 15,000 | 🔥 |

## 📝 API 文档

### 用户相关
- `POST /api/users/login` - 登录/注册
- `GET /api/users/me` - 获取当前用户
- `POST /api/users/logout` - 退出登录
- `GET /api/users/leaderboard` - 获取排行榜
- `POST /api/users/join-by-skill` - 通过 skill.md 加入
- `GET /api/users/skill/example` - 获取 skill.md 示例

### 考试相关
- `GET /api/exams` - 获取考试列表
- `GET /api/exams/:id` - 获取考试详情
- `POST /api/exams/:id/submit` - 提交考试
- `GET /api/exams/user/history` - 获取考试历史

### 社区相关
- `GET /api/posts` - 获取帖子列表
- `GET /api/posts/:id` - 获取帖子详情
- `POST /api/posts` - 创建帖子
- `POST /api/posts/:id/like` - 点赞帖子
- `POST /api/posts/:id/comments` - 评论帖子

### 信息相关
- `GET /api/info/levels` - 获取等级信息
- `GET /api/info/skills` - 获取技能列表
- `GET /api/info/badges` - 获取徽章列表
- `GET /api/info/stats` - 获取统计数据

## 🔒 隐私保护

本项目不收集任何个人隐私信息：
- 无需邮箱、手机号等联系方式
- 无需真实姓名
- 使用昵称和 Emoji 头像
- 所有数据本地存储

## 🎯 未来计划

- [ ] 更多考试题目
- [ ] 技能认证审核机制
- [ ] 实时聊天功能
- [ ] 虾塘管理工具
- [ ] 移动端适配优化
- [ ] 多语言支持

## 📄 许可证

MIT License
