<div align="center">
<img alt="logo" height="120" src="./public/favicon.png" width="120"/>
<h2>今日热榜</h2>
<p>汇聚全网热点，热门尽览无余</p>
<br />
<img src="./screenshots/main.jpg" style="border-radius: 16px" />
</div>

## 功能特性

- 🔥 聚合 60+ 热门平台数据源
- 🌍 支持国内/国际热榜 Tab 切换
- 🎨 深色/浅色主题切换
- 📱 响应式设计，支持移动端
- ⚙️ 可自定义数据源排序和显隐
- 🐳 Docker 一键部署

## 数据源

### 国内热榜
微博、知乎、百度、抖音、B站、今日头条、36氪、少数派、IT之家、虎嗅、豆瓣、贴吧、小红书等 50+ 数据源

### 国际热榜
Reddit、Hacker News、GitHub Trending、Product Hunt、Dev.to、Lobsters、BBC News、Mastodon

## 示例

> 这里是示例站点

- [今日热榜 - https://hot.imsyy.top/](https://hot.imsyy.top/)

## 本地开发

```bash
# 安装依赖
pnpm install

# 开发
pnpm dev

# 打包
pnpm build
```

## Docker 部署

### 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- Git

### 快速部署

1. 克隆前后端仓库：

```bash
mkdir -p /opt/1panel/apps/dailyhot && cd /opt/1panel/apps/dailyhot
git clone https://github.com/xiemobiao/DailyHotApi.git
git clone https://github.com/xiemobiao/DailyHot.git
```

2. 创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  dailyhot-api:
    build:
      context: ./DailyHotApi
      dockerfile: Dockerfile
    container_name: dailyhot-api
    restart: unless-stopped
    ports:
      - "6688:6688"
    environment:
      - NODE_ENV=production
      - PORT=6688
      - ALLOWED_DOMAIN=*
      - CACHE_TTL=3600
      - REQUEST_TIMEOUT=6000

  dailyhot-web:
    build:
      context: ./DailyHot
      dockerfile: Dockerfile
      args:
        - VITE_GLOBAL_API=http://your-api-domain:6688
    container_name: dailyhot-web
    restart: unless-stopped
    ports:
      - "6699:80"
    depends_on:
      - dailyhot-api

networks:
  default:
    driver: bridge
```

3. 启动服务：

```bash
docker compose up -d --build
```

### 服务端口

| 服务 | 端口 | 说明 |
|-----|------|------|
| API | 6688 | 后端接口服务 |
| Web | 6699 | 前端静态服务 |

### 服务管理

```bash
# 启动
docker compose up -d

# 停止
docker compose down

# 重启
docker compose restart

# 查看日志
docker compose logs -f

# 更新代码并重启
cd DailyHotApi && git pull && cd ..
cd DailyHot && git pull && cd ..
docker compose build && docker compose up -d
```

## 反向代理配置

### Nginx / OpenResty

```nginx
# API 服务
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:6688;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# 前端服务
server {
    listen 80;
    server_name hot.example.com;

    location / {
        proxy_pass http://127.0.0.1:6699;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Vercel 部署

现已支持 Vercel 一键部署，无需服务器

> 请注意，需要修改环境变量中的 API 地址

![Powered by Vercel](./public/ico/powered-by-vercel.svg)

## 环境变量

### 前端

| 变量 | 说明 |
|-----|------|
| VITE_GLOBAL_API | API 服务地址（构建时设置） |

### API 服务

| 变量 | 默认值 | 说明 |
|-----|-------|------|
| PORT | 6688 | 服务端口 |
| ALLOWED_DOMAIN | * | 允许的跨域域名 |
| CACHE_TTL | 3600 | 缓存时间（秒） |
| REQUEST_TIMEOUT | 6000 | 请求超时（毫秒） |

## 相关仓库

- 前端：https://github.com/xiemobiao/DailyHot
- 后端：https://github.com/xiemobiao/DailyHotApi

## License

MIT
