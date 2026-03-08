#!/usr/bin/env node
/**
 * macOS 打包脚本
 *
 * 使用方法:
 * node scripts/build-mac.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 配置
const config = {
  appName: 'ShrimpBoss',
  productName: '今天我是虾老板',
  platform: 'darwin',
  arch: 'arm64',
  outDir: 'release',
  electronVersion: '40.8.0',
};

// 检查前置条件
function checkPrerequisites() {
  console.log('检查前置条件...');

  if (!fs.existsSync('frontend/dist')) {
    console.error('错误: frontend/dist 不存在，请先运行 pnpm build:frontend');
    process.exit(1);
  }

  if (!fs.existsSync('backend/dist')) {
    console.error('错误: backend/dist 不存在，请先运行 pnpm build:backend');
    process.exit(1);
  }

  console.log('✓ 前置条件检查通过');
}

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

  // 读取并修改 package.json
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const newPkg = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    main: pkg.main,
    productName: config.productName,
  };
  fs.writeFileSync('tmp-app/package.json', JSON.stringify(newPkg, null, 2));

  console.log('✓ 应用文件准备完成');
}

// 打包 macOS 版本
function buildMacOS() {
  console.log('开始打包 macOS 版本...');

  const packagerPath = path.join(__dirname, '../node_modules/electron-packager/bin/electron-packager.js');

  const command = `node "${packagerPath}" . "${config.appName}" ` +
    `--platform=${config.platform} ` +
    `--arch=${config.arch} ` +
    `--out=../${config.outDir} ` +
    `--overwrite`;

  // 设置 Electron 镜像（国内加速）
  const env = {
    ...process.env,
    ELECTRON_MIRROR: 'https://npmmirror.com/mirrors/electron/',
  };

  execSync(command, {
    cwd: 'tmp-app',
    stdio: 'inherit',
    env,
  });

  console.log('✓ macOS 版本打包完成');
}

// 创建 DMG
function createDMG() {
  console.log('创建 DMG 安装包...');

  const releaseDir = path.join(__dirname, '../release');
  const appDir = path.join(releaseDir, `ShrimpBoss-${config.platform}-${config.arch}/ShrimpBoss.app`);

  if (!fs.existsSync(appDir)) {
    console.error('错误: 应用目录不存在:', appDir);
    return;
  }

  const dmgPath = path.join(releaseDir, `ShrimpBoss-1.0.0-mac-${config.arch}.dmg`);

  execSync(`hdiutil create -volname "${config.productName}" -srcfolder "${appDir}" -ov -format UDZO "${dmgPath}"`, {
    stdio: 'inherit',
  });

  console.log('✓ DMG 创建完成');
}

// 创建 ZIP
function createZIP() {
  console.log('创建 ZIP 压缩包...');

  const releaseDir = path.join(__dirname, '../release');
  const appDir = `ShrimpBoss-${config.platform}-${config.arch}`;

  execSync(`cd "${releaseDir}" && zip -r ShrimpBoss-1.0.0-mac-${config.arch}.zip ${appDir}/`, {
    stdio: 'inherit',
  });

  console.log('✓ ZIP 创建完成');
}

// 清理
function cleanup() {
  console.log('清理临时文件...');
  if (fs.existsSync('tmp-app')) {
    fs.rmSync('tmp-app', { recursive: true });
  }
}

// 显示结果
function showResults() {
  const releaseDir = path.join(__dirname, '../release');

  console.log('\n' + '='.repeat(50));
  console.log('✅ macOS 打包完成！');
  console.log('='.repeat(50));
  console.log('\n输出文件:');

  const files = fs.readdirSync(releaseDir);
  files.forEach(file => {
    const filePath = path.join(releaseDir, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      const size = (stats.size / 1024 / 1024).toFixed(1);
      console.log(`  ${file} (${size} MB)`);
    }
  });

  console.log(`\n输出目录: ${releaseDir}/`);
}

// 主流程
async function main() {
  try {
    checkPrerequisites();
    prepareApp();
    buildMacOS();
    createDMG();
    createZIP();
    cleanup();
    showResults();
  } catch (error) {
    console.error('\n❌ 打包失败:', error.message);
    process.exit(1);
  }
}

main();
