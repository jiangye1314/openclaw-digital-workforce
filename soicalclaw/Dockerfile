# 后端服务 Dockerfile
FROM node:20-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json
COPY backend/package.json ./

# 安装生产依赖
RUN pnpm install --production

# 复制后端构建文件
COPY backend/dist ./dist
COPY backend/data ./data

# 暴露端口
EXPOSE 3001

# 启动后端服务
CMD ["node", "dist/server.js"]
