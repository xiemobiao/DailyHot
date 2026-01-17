#!/bin/bash

# DailyHot 一键安装脚本
# 使用方法: curl -fsSL https://raw.githubusercontent.com/xiemobiao/DailyHot/master/install.sh | bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

INSTALL_DIR="${DAILYHOT_DIR:-/opt/dailyhot}"

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║       DailyHot 一键安装脚本           ║"
echo "║       汇聚全网热点，热门尽览无余       ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# 检查 root 权限
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}提示: 建议使用 root 用户运行${NC}"
fi

# 检查 Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: 未检测到 Docker，请先安装 Docker${NC}"
        echo -e "${YELLOW}安装命令: curl -fsSL https://get.docker.com | sh${NC}"
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        echo -e "${RED}错误: 未检测到 Docker Compose V2${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Docker 环境检测通过${NC}"
}

# 检查 Git
check_git() {
    if ! command -v git &> /dev/null; then
        echo -e "${YELLOW}正在安装 Git...${NC}"
        if command -v apt-get &> /dev/null; then
            apt-get update && apt-get install -y git
        elif command -v yum &> /dev/null; then
            yum install -y git
        elif command -v apk &> /dev/null; then
            apk add git
        else
            echo -e "${RED}错误: 无法自动安装 Git，请手动安装${NC}"
            exit 1
        fi
    fi
    echo -e "${GREEN}✓ Git 检测通过${NC}"
}

# 创建安装目录
setup_dir() {
    echo -e "${BLUE}安装目录: ${INSTALL_DIR}${NC}"

    if [ -d "$INSTALL_DIR" ]; then
        echo -e "${YELLOW}检测到已有安装，是否覆盖? (y/N)${NC}"
        read -r confirm
        if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
            echo -e "${YELLOW}已取消安装${NC}"
            exit 0
        fi
        rm -rf "$INSTALL_DIR"
    fi

    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
}

# 克隆代码
clone_repos() {
    echo -e "${BLUE}正在克隆代码...${NC}"

    git clone --depth 1 https://github.com/xiemobiao/DailyHotApi.git
    echo -e "${GREEN}✓ DailyHotApi 克隆完成${NC}"

    git clone --depth 1 https://github.com/xiemobiao/DailyHot.git
    echo -e "${GREEN}✓ DailyHot 克隆完成${NC}"
}

# 生成配置文件
generate_config() {
    echo ""
    echo -e "${YELLOW}请输入配置信息 (直接回车使用默认值)${NC}"
    echo ""

    read -p "API 端口 [6688]: " API_PORT
    API_PORT=${API_PORT:-6688}

    read -p "Web 端口 [6699]: " WEB_PORT
    WEB_PORT=${WEB_PORT:-6699}

    # 自动获取服务器 IP
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ip.sb 2>/dev/null || echo "localhost")
    read -p "API 地址 [http://${SERVER_IP}:${API_PORT}]: " API_URL
    API_URL=${API_URL:-http://${SERVER_IP}:${API_PORT}}

    # 生成 docker-compose.yml
    cat > docker-compose.yml << EOF
version: '3.8'

services:
  dailyhot-api:
    build:
      context: ./DailyHotApi
      dockerfile: Dockerfile
    container_name: dailyhot-api
    restart: unless-stopped
    ports:
      - "${API_PORT}:6688"
    environment:
      - NODE_ENV=production
      - PORT=6688
      - ALLOWED_DOMAIN=*
      - CACHE_TTL=3600
      - REQUEST_TIMEOUT=6000
    networks:
      - dailyhot-network

  dailyhot-web:
    build:
      context: ./DailyHot
      dockerfile: Dockerfile
      args:
        - VITE_GLOBAL_API=${API_URL}
    container_name: dailyhot-web
    restart: unless-stopped
    ports:
      - "${WEB_PORT}:80"
    depends_on:
      - dailyhot-api
    networks:
      - dailyhot-network

networks:
  dailyhot-network:
    driver: bridge
EOF

    echo -e "${GREEN}✓ 配置文件生成完成${NC}"
}

# 生成管理脚本
generate_manage_script() {
    cat > manage.sh << 'EOF'
#!/bin/bash

cd "$(dirname "$0")" || exit 1

case "$1" in
    start)   docker compose up -d ;;
    stop)    docker compose down ;;
    restart) docker compose restart ;;
    status)  docker compose ps ;;
    logs)
        if [ "$2" == "api" ]; then docker logs -f dailyhot-api
        elif [ "$2" == "web" ]; then docker logs -f dailyhot-web
        else docker compose logs -f
        fi ;;
    update)
        cd DailyHotApi && git pull && cd ..
        cd DailyHot && git pull && cd ..
        docker compose build && docker compose up -d
        echo "更新完成!" ;;
    rebuild) docker compose build --no-cache && docker compose up -d ;;
    uninstall)
        docker compose down -v
        echo "服务已停止，如需完全卸载请删除目录: $(pwd)" ;;
    *)
        echo "DailyHot 管理脚本"
        echo ""
        echo "用法: ./manage.sh <命令>"
        echo ""
        echo "命令:"
        echo "  start     启动服务"
        echo "  stop      停止服务"
        echo "  restart   重启服务"
        echo "  status    查看状态"
        echo "  logs      查看日志 (logs api / logs web)"
        echo "  update    更新并重启"
        echo "  rebuild   重新构建"
        echo "  uninstall 卸载服务" ;;
esac
EOF
    chmod +x manage.sh
}

# 构建并启动
build_and_start() {
    echo ""
    echo -e "${BLUE}正在构建镜像，请稍候...${NC}"
    docker compose build

    echo -e "${BLUE}正在启动服务...${NC}"
    docker compose up -d

    echo -e "${GREEN}✓ 服务启动成功${NC}"
}

# 显示完成信息
show_success() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         安装完成!                     ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${BLUE}访问地址:${NC}"
    echo -e "    前端: http://${SERVER_IP}:${WEB_PORT}"
    echo -e "    API:  http://${SERVER_IP}:${API_PORT}"
    echo ""
    echo -e "  ${BLUE}管理命令:${NC}"
    echo -e "    cd ${INSTALL_DIR}"
    echo -e "    ./manage.sh start    # 启动"
    echo -e "    ./manage.sh stop     # 停止"
    echo -e "    ./manage.sh logs     # 日志"
    echo -e "    ./manage.sh update   # 更新"
    echo ""
    echo -e "  ${YELLOW}提示: 如需配置域名访问，请设置 Nginx 反向代理${NC}"
    echo ""
}

# 主流程
main() {
    check_docker
    check_git
    setup_dir
    clone_repos
    generate_config
    generate_manage_script
    build_and_start
    show_success
}

main
