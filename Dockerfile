# 构建阶段
FROM node:20-alpine AS builder

RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

# 设置 API 地址（构建时替换为你的后端地址）
ARG VITE_GLOBAL_API=http://your-server-ip:6688
ENV VITE_GLOBAL_API=${VITE_GLOBAL_API}

RUN pnpm build

# 运行阶段 - 使用轻量级静态服务器
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
