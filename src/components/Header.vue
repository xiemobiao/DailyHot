<template>
  <header class="header-wrapper" :class="{ scrolled: isScrolled }">
    <div class="header-glass">
      <!-- 动态光晕背景 -->
      <div class="header-glow"></div>

      <section class="header-content">
        <!-- Logo 区域 -->
        <div class="logo-area" @click="router.push('/')">
          <div class="logo-container">
            <img src="/ico/favicon.png" alt="logo" class="logo-img" />
            <div class="logo-pulse"></div>
          </div>
          <div class="brand-info">
            <div class="brand-main">
              <span class="brand-name">今日热榜</span>
              <span class="brand-badge">LIVE</span>
            </div>
            <span class="brand-slogan">汇聚全网热点，热门尽览无余</span>
          </div>
        </div>

        <!-- 中间区域：时间 + 统计 -->
        <div class="center-area">
          <!-- 精简时间显示 -->
          <div class="time-display" v-if="store.timeData">
            <div class="time-clock">
              <span class="clock-time">{{ store.timeData.time.hour }}:{{ store.timeData.time.minute }}</span>
              <span class="clock-seconds">{{ store.timeData.time.second }}</span>
            </div>
            <div class="time-meta">
              <span class="meta-date">{{ store.timeData.time.month }}/{{ store.timeData.time.day }}</span>
              <span class="meta-dot"></span>
              <span class="meta-lunar">{{ store.timeData.lunar.text }}</span>
              <span class="meta-dot"></span>
              <span class="meta-weekday">{{ store.timeData.time.weekday }}</span>
            </div>
          </div>
          <div class="time-display loading" v-else>
            <div class="loading-shimmer"></div>
          </div>

          <!-- 统计数据 -->
          <div class="stats-area" v-if="visibleCount > 0">
            <div class="stat-chip">
              <span class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </span>
              <span class="stat-num">{{ visibleCount }}</span>
              <span class="stat-text">源</span>
            </div>
            <div class="stat-chip accent">
              <span class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </span>
              <span class="stat-text">24/7</span>
            </div>
          </div>
        </div>

        <!-- 控制按钮区域 -->
        <div class="controls-area">
          <n-space :size="8" justify="end" align="center">
            <!-- 刷新按钮 -->
            <n-tooltip v-if="showRefresh" placement="bottom">
              <template #trigger>
                <button class="control-btn" @click="router.go(0)">
                  <n-icon :component="Refresh" :size="18" />
                </button>
              </template>
              刷新页面
            </n-tooltip>

            <!-- 主题切换按钮 -->
            <n-tooltip placement="bottom">
              <template #trigger>
                <button
                  class="control-btn theme-btn"
                  @click="store.setSiteTheme(store.siteTheme === 'light' ? 'dark' : 'light')"
                >
                  <n-icon :component="store.siteTheme === 'light' ? Moon : SunOne" :size="18" />
                </button>
              </template>
              {{ store.siteTheme === "light" ? "深色模式" : "浅色模式" }}
            </n-tooltip>

            <!-- 设置按钮 -->
            <n-tooltip placement="bottom">
              <template #trigger>
                <button class="control-btn" @click="router.push('/setting')">
                  <n-icon :component="SettingTwo" :size="18" />
                </button>
              </template>
              全局设置
            </n-tooltip>

            <!-- 用户头像/登录 -->
            <UserAvatar />
          </n-space>
        </div>

        <!-- 移动端菜单 -->
        <div class="mobile-menu">
          <n-dropdown
            :options="menuOptions"
            size="large"
            trigger="click"
            placement="bottom-end"
            @select="menuOptionsSelect"
          >
            <button class="control-btn mobile-btn">
              <n-icon :component="HamburgerButton" :size="22" />
            </button>
          </n-dropdown>
        </div>
      </section>
    </div>
  </header>
</template>

<script setup>
import {
  SunOne,
  Moon,
  Refresh,
  SettingTwo,
  HamburgerButton,
  User,
} from "@icon-park/vue-next";
import { getCurrentTime } from "@/utils/getTime.js";
import { mainStore } from "@/store";
import { NText, NIcon } from "naive-ui";
import { useRouter } from "vue-router";
import UserAvatar from "@/components/UserAvatar.vue";

const router = useRouter();
const store = mainStore();
const timeInterval = ref(null);
const showRefresh = ref(false);
const isScrolled = ref(false);

// 计算可见的数据源数量
const visibleCount = computed(() => {
  return store.newsArr?.filter((item) => item.show).length || 0;
});

// 监听滚动
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

// 移动端时间模块
const timeRender = () => {
  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px 20px",
        background: "linear-gradient(135deg, rgba(238, 90, 36, 0.1) 0%, rgba(165, 94, 234, 0.1) 100%)",
        borderRadius: "12px",
        margin: "4px",
      },
    },
    [
      h(NText, { style: "font-size: 18px; font-weight: 600;" }, {
        default: () =>
          store.timeData ? store.timeData.time.text : "时间获取失败",
      }),
      h(
        NText,
        { depth: 3, style: "font-size: 12px; margin-top: 4px;" },
        {
          default: () =>
            store.timeData
              ? store.timeData.lunar.GanZhiYear +
                "年 " +
                store.timeData.lunar.text +
                " " +
                store.timeData.time.weekday
              : "日期获取失败",
        }
      ),
    ]
  );
};

// 移动端菜单
const menuOptions = computed(() => {
  const options = [
    {
      key: "header",
      type: "render",
      render: timeRender,
    },
    {
      key: "header-divider",
      type: "divider",
    },
    {
      label: "刷新页面",
      key: "refresh",
      icon: () => {
        return h(NIcon, null, {
          default: () => h(Refresh),
        });
      },
    },
    {
      label: () => {
        return h(NText, null, {
          default: () => (store.siteTheme === "light" ? "深色模式" : "浅色模式"),
        });
      },
      key: "changeTheme",
      icon: () => {
        return h(NIcon, null, {
          default: () => (store.siteTheme === "light" ? h(Moon) : h(SunOne)),
        });
      },
    },
    {
      label: "全局设置",
      key: "setting",
      icon: () => {
        return h(NIcon, null, {
          default: () => h(SettingTwo),
        });
      },
    },
  ];

  // 添加用户相关菜单
  options.push({
    key: "user-divider",
    type: "divider",
  });

  if (store.isLoggedIn) {
    options.push({
      label: store.user?.nickname || store.user?.email || "个人中心",
      key: "profile",
      icon: () => {
        return h(NIcon, null, {
          default: () => h(User),
        });
      },
    });
  } else {
    options.push({
      label: "登录 / 注册",
      key: "login",
      icon: () => {
        return h(NIcon, null, {
          default: () => h(User),
        });
      },
    });
  }

  return options;
});

// 移动端下拉菜单点击事件
const menuOptionsSelect = (val) => {
  if (val === "refresh") {
    router.go(0);
  } else if (val === "changeTheme") {
    store.setSiteTheme(store.siteTheme === "light" ? "dark" : "light");
  } else if (val === "setting") {
    router.push("/setting");
  } else if (val === "login") {
    router.push("/login");
  } else if (val === "profile") {
    router.push("/profile");
  }
};

// 监听路由参数变化
watch(
  () => router.currentRoute.value,
  (val) => {
    const isHome = val.path === "/";
    showRefresh.value = isHome ? true : false;
  }
);

onMounted(() => {
  window.$timeInterval = timeInterval.value = setInterval(() => {
    store.timeData = getCurrentTime();
  }, 1000);
  showRefresh.value = router.currentRoute.value?.path === "/" ? true : false;

  // 添加滚动监听
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  clearInterval(timeInterval.value);
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
.header-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 12px 5vw;
  max-width: 1800px;
  margin: 0 auto;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  &.scrolled {
    padding: 8px 5vw;

    .header-glass {
      background: rgba(12, 12, 20, 0.92);
      box-shadow:
        0 4px 24px rgba(0, 0, 0, 0.25),
        0 0 48px rgba(238, 90, 36, 0.06);
    }

    .logo-img {
      width: 32px !important;
      height: 32px !important;
    }

    .brand-name {
      font-size: 16px !important;
    }

    .brand-slogan {
      display: none;
    }

    .time-clock {
      .clock-time {
        font-size: 20px !important;
      }
      .clock-seconds {
        font-size: 12px !important;
      }
    }
  }
}

.header-glass {
  position: relative;
  background: rgba(12, 12, 20, 0.75);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 12px 24px;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  [data-theme="light"] & {
    background: rgba(255, 255, 255, 0.88);
    border-color: rgba(0, 0, 0, 0.04);
    box-shadow:
      0 2px 20px rgba(0, 0, 0, 0.04),
      0 0 1px rgba(0, 0, 0, 0.08);
  }
}

.header-glow {
  position: absolute;
  top: -100%;
  left: -50%;
  width: 200%;
  height: 300%;
  background: radial-gradient(
    ellipse at 20% 50%,
    rgba(238, 90, 36, 0.06) 0%,
    transparent 40%
  );
  pointer-events: none;
  animation: glowDrift 12s ease-in-out infinite alternate;
}

@keyframes glowDrift {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(15%, 5%) rotate(3deg); }
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

// Logo 区域
.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
  flex-shrink: 0;

  &:hover {
    transform: translateX(2px);

    .logo-pulse {
      transform: scale(1.3);
      opacity: 0.8;
    }

    .logo-img {
      transform: scale(1.08);
    }
  }
}

.logo-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 8px rgba(238, 90, 36, 0.25));
}

.logo-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: radial-gradient(circle, rgba(238, 90, 36, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: all 0.4s ease;
  animation: logoPulse 3s ease-in-out infinite;
}

@keyframes logoPulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.15); opacity: 0; }
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.85) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: font-size 0.3s ease;

  [data-theme="light"] & {
    background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
    -webkit-background-clip: text;
    background-clip: text;
  }
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #fff;
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  border-radius: 4px;
  animation: badgePulse 2s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
}

@keyframes badgePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.brand-slogan {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.3px;
  transition: opacity 0.3s ease;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.45);
  }
}

// 中间区域
.center-area {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  justify-content: center;
  max-width: 500px;
}

// 时间显示
.time-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(238, 90, 36, 0.15);
  }

  [data-theme="light"] & {
    background: rgba(0, 0, 0, 0.02);
    border-color: rgba(0, 0, 0, 0.04);

    &:hover {
      background: rgba(0, 0, 0, 0.04);
      border-color: rgba(238, 90, 36, 0.1);
    }
  }

  &.loading {
    min-width: 140px;
    min-height: 42px;
    justify-content: center;
  }
}

.time-clock {
  display: flex;
  align-items: center;
  gap: 2px;
}

.clock-time {
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.5px;
  color: #fff;
  font-variant-numeric: tabular-nums;
  transition: font-size 0.3s ease;

  [data-theme="light"] & {
    color: #1a1a2e;
  }
}

.clock-seconds {
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  color: rgba(238, 90, 36, 0.9);
  margin-left: 1px;
  padding: 2px 5px;
  background: rgba(238, 90, 36, 0.12);
  border-radius: 4px;
  font-variant-numeric: tabular-nums;
  transition: font-size 0.3s ease;
}

.time-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.08);

  [data-theme="light"] & {
    border-left-color: rgba(0, 0, 0, 0.06);
  }
}

.meta-date,
.meta-lunar,
.meta-weekday {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.3px;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.5);
  }
}

.meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);

  [data-theme="light"] & {
    background: rgba(26, 26, 46, 0.2);
  }
}

// 加载动画
.loading-shimmer {
  width: 100%;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;

  [data-theme="light"] & {
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.03) 0%,
      rgba(0, 0, 0, 0.06) 50%,
      rgba(0, 0, 0, 0.03) 100%
    );
    background-size: 200% 100%;
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// 统计区域
.stats-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
  }

  [data-theme="light"] & {
    background: rgba(0, 0, 0, 0.02);
    border-color: rgba(0, 0, 0, 0.04);

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  &.accent {
    background: rgba(238, 90, 36, 0.1);
    border-color: rgba(238, 90, 36, 0.15);

    .stat-icon svg {
      color: #ee5a24;
    }

    .stat-text {
      color: rgba(238, 90, 36, 0.9);
    }
  }
}

.stat-icon {
  display: flex;
  align-items: center;

  svg {
    width: 12px;
    height: 12px;
    color: rgba(255, 255, 255, 0.5);

    [data-theme="light"] & {
      color: rgba(26, 26, 46, 0.5);
    }
  }
}

.stat-num {
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: #fff;

  [data-theme="light"] & {
    color: #1a1a2e;
  }
}

.stat-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.5);
  }
}

// 控制按钮区域
.controls-area {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.control-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  [data-theme="light"] & {
    background: rgba(0, 0, 0, 0.03);
    color: rgba(26, 26, 46, 0.6);

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #1a1a2e;
    }
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0) scale(0.96);
  }

  &.theme-btn:hover {
    background: rgba(238, 90, 36, 0.15);
    color: #ee5a24;
  }
}

// 移动端菜单
.mobile-menu {
  display: none;
}

.mobile-btn {
  width: 40px;
  height: 40px;
}

// 响应式
@media (max-width: 900px) {
  .center-area {
    max-width: 320px;
  }

  .stats-area {
    display: none;
  }

  .time-meta {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-content {
    display: flex;
    justify-content: space-between;
  }

  .center-area,
  .controls-area {
    display: none;
  }

  .mobile-menu {
    display: block;
  }

  .brand-slogan {
    display: none;
  }
}

@media (max-width: 480px) {
  .header-wrapper {
    padding: 10px 4vw;
  }

  .header-glass {
    padding: 10px 14px;
    border-radius: 12px;
  }

  .logo-img {
    width: 32px;
    height: 32px;
  }

  .brand-name {
    font-size: 16px;
  }

  .brand-badge {
    font-size: 8px;
    padding: 1px 4px;
  }
}
</style>
