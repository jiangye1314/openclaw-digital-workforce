#!/usr/bin/env node
/**
 * Windows 打包脚本
 *
 * 使用方法:
 * 1. 在 Windows 机器上运行: node scripts/build-windows.js
 * 2. 或在 macOS 上安装 Wine 后运行: node scripts/build-windows.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 配置
const config = {
  appName: 'ShrimpBoss',
  platform: 'win32',
  arch: 'x64',
  outDir: 'release',
  electronVersion: '40.8.0',
};

// 创建临时应用目录
function prepareApp() {
  console.log('准备应用文件...');

  if (fs.existsSync('tmp-app')) {
    fs.rmSync('tmp-app', { recursive: true });
  }

  fs.mkdirSync('tmp-app', { recursive: true });
  fs.mkdirSync('tmp-app/frontend', { recursive: true });
  fs.mkdirSync('tmp-app/backend', { recursive: true });

  // 复制必要文件
  fs.cpSync('electron', 'tmp-app/electron', { recursive: true });
  fs.cpSync('frontend/dist', 'tmp-app/frontend/dist', { recursive: true });
  fs.cpSync('backend/dist', 'tmp-app/backend/dist', { recursive: true });
  fs.cpSync('package.json', 'tmp-app/package.json');

  console.log('应用文件准备完成');
}

// 打包 Windows 版本
function buildWindows() {
  console.log('开始打包 Windows 版本...');

  const packagerPath = path.join(__dirname, '../node_modules/electron-packager/bin/electron-packager.js');

  const command = `node "${packagerPath}" . "${config.appName}" ` +
    `--platform=${config.platform} ` +
    `--arch=${config.arch} ` +
    `--out=../${config.outDir} ` +
    `--overwrite ` +
    `--prune`;

  execSync(command, {
    cwd: 'tmp-app',
    stdio: 'inherit'
  });

  console.log('Windows 版本打包完成');
}

// 创建 NSIS 安装程序
function createInstaller() {
  console.log('创建 Windows 安装程序...');

  const releaseDir = path.join(__dirname, '../release');
  const appDir = path.join(releaseDir, 'ShrimpBoss-win32-x64');

  if (!fs.existsSync(appDir)) {
    console.error('应用目录不存在:', appDir);
    return;
  }

  // 创建简单的 ZIP 包
  const { execSync } = require('child_process');

  if (process.platform === 'win32') {
    // Windows 上使用 PowerShell
    const zipPath = path.join(releaseDir, 'ShrimpBoss-1.0.0-win-x64.zip');
    execSync(`powershell -Command "Compress-Archive -Path '${appDir}' -DestinationPath '${zipPath}' -Force"`, {
      stdio: 'inherit'
    });
  } else {
    // macOS/Linux 上使用 zip
    execSync(`cd "${releaseDir}" && zip -r ShrimpBoss-1.0.0-win-x64.zip ShrimpBoss-win32-x64/`, {
      stdio: 'inherit'
    });
  }

  console.log('Windows 安装包创建完成');
}

// 清理
function cleanup() {
  console.log('清理临时文件...');
  if (fs.existsSync('tmp-app')) {
    fs.rmSync('tmp-app', { recursive: true });
  }
}

// 主流程
async function main() {
  try {
    prepareApp();
    buildWindows();
    createInstaller();
    cleanup();

    console.log('\n✅ Windows 打包完成！');
    console.log('输出目录: release/');
  } catch (error) {
    console.error('打包失败:', error.message);
    process.exit(1);
  }
}

main();
