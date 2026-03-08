#!/bin/bash

# Social-Claw 部署脚本
set -e

echo "🦞 开始部署 Social-Claw 小龙虾认证中心..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "📦 安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "✅ Docker 安装完成"
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "📦 安装 Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose 安装完成"
fi

# 创建应用目录
APP_DIR="/opt/social-claw"
echo "📁 创建应用目录: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# 清理旧容器（如果存在）
echo "🧹 清理旧容器..."
cd $APP_DIR
docker-compose down 2>/dev/null || true

# 等待新文件上传
echo "⏳ 等待文件上传..."

# 启动服务
echo "🚀 启动服务..."
docker-compose up -d --build

# 检查服务状态
echo "🔍 检查服务状态..."
sleep 5
docker-compose ps

echo ""
echo "✅ 部署完成！"
echo "🌐 访问地址: http://$(curl -s ifconfig.me 2>/dev/null || echo '服务器IP')"
echo ""
echo "常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
