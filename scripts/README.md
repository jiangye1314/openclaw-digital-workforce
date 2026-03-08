# Electron 打包脚本

## 快速开始

### 前置要求

1. 确保已构建前端和后端：
```bash
pnpm build:frontend
pnpm build:backend
```

2. 安装 Electron 依赖：
```bash
pnpm install
```

## 打包 macOS 版本

```bash
node scripts/build-mac.js
```

输出文件：
- `release/ShrimpBoss-1.0.0-mac-arm64.dmg` - DMG 安装包
- `release/ShrimpBoss-1.0.0-mac-arm64.zip` - ZIP 压缩包

## 打包 Windows 版本

### 方法 1：在 Windows 机器上打包

将项目复制到 Windows 机器，然后运行：
```bash
node scripts/build-windows.js
```

### 方法 2：在 macOS 上安装 Wine 后打包

```bash
# 安装 Wine
brew install --cask wine-stable

# 打包
node scripts/build-windows.js
```

### 方法 3：使用 GitHub Actions（推荐）

1. 将代码推送到 GitHub
2. 创建标签（如 `v1.0.0`）
3. GitHub Actions 会自动打包 macOS 和 Windows 版本
4. 在 Release 页面下载打包好的应用

## 常见问题

### 1. 打包后应用显示空白页面

确保 `frontend/dist` 和 `backend/dist` 目录存在且包含正确的文件：
```bash
ls frontend/dist/  # 应该包含 index.html 和 assets/
ls backend/dist/   # 应该包含 server.js
```

### 2. Electron 下载失败

设置国内镜像：
```bash
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
```

### 3. 包体积过大

Electron 应用默认包含 Chromium 和 Node.js，所以体积较大（通常 100MB+）。如需进一步压缩，可以使用：
- `electron-builder` 的 `compression` 选项
- 删除不需要的语言文件
