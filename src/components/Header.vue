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
            <div class="logo-ring"></div>
          </div>
          <div class="brand-text">
            <span class="brand-name">今日热榜</span>
            <span class="brand-slogan">汇聚全网热点，热门尽览无余</span>
          </div>
        </div>

        <!-- 时间显示区域 -->
        <div class="time-widget" v-if="store.timeData">
          <!-- 装饰性边框 -->
          <div class="time-frame">
            <div class="frame-corner top-left"></div>
            <div class="frame-corner top-right"></div>
            <div class="frame-corner bottom-left"></div>
            <div class="frame-corner bottom-right"></div>
          </div>

          <!-- 日期行 -->
          <div class="date-row">
            <span class="date-segment">{{ store.timeData.time.year }}</span>
            <span class="date-dot"></span>
            <span class="date-segment">{{ store.timeData.time.month }}</span>
            <span class="date-dot"></span>
            <span class="date-segment">{{ store.timeData.time.day }}</span>
          </div>

          <!-- 时间主体 -->
          <div class="time-main">
            <span class="time-digit">{{ store.timeData.time.hour }}</span>
            <span class="time-colon">:</span>
            <span class="time-digit">{{ store.timeData.time.minute }}</span>
            <span class="time-colon">:</span>
            <span class="time-digit seconds">{{ store.timeData.time.second }}</span>
          </div>

          <!-- 农历信息 -->
          <div class="lunar-row">
            <span class="lunar-badge">{{ store.timeData.lunar.GanZhiYear }}</span>
            <span class="lunar-divider">|</span>
            <span class="lunar-text">{{ store.timeData.lunar.text }}</span>
            <span class="lunar-divider">|</span>
            <span class="lunar-weekday">{{ store.timeData.time.weekday }}</span>
          </div>
        </div>
        <div class="time-widget loading" v-else>
          <div class="loading-pulse"></div>
        </div>

        <!-- 控制按钮区域 -->
        <div class="controls-area">
          <n-space :size="12" justify="end">
            <!-- 刷新按钮 -->
            <n-tooltip v-if="showRefresh" placement="bottom">
              <template #trigger>
                <button class="control-btn" @click="router.go(0)">
                  <n-icon :component="Refresh" :size="20" />
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
                  <n-icon :component="store.siteTheme === 'light' ? Moon : SunOne" :size="20" />
                  <div class="btn-glow"></div>
                </button>
              </template>
              {{ store.siteTheme === "light" ? "深色模式" : "浅色模式" }}
            </n-tooltip>

            <!-- 设置按钮 -->
            <n-tooltip placement="bottom">
              <template #trigger>
                <button class="control-btn" @click="router.push('/setting')">
                  <n-icon :component="SettingTwo" :size="20" />
                </button>
              </template>
              全局设置
            </n-tooltip>
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
} from "@icon-park/vue-next";
import { getCurrentTime } from "@/utils/getTime.js";
import { mainStore } from "@/store";
import { NText, NIcon } from "naive-ui";
import { useRouter } from "vue-router";

const router = useRouter();
const store = mainStore();
const timeInterval = ref(null);
const showRefresh = ref(false);
const isScrolled = ref(false);

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
const menuOptions = [
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

// 移动端下拉菜单点击事件
const menuOptionsSelect = (val) => {
  if (val === "refresh") {
    router.go(0);
  } else if (val === "changeTheme") {
    store.setSiteTheme(store.siteTheme === "light" ? "dark" : "light");
  } else if (val === "setting") {
    router.push("/setting");
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
  padding: 16px 5vw;
  max-width: 1800px;
  margin: 0 auto;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &.scrolled {
    padding: 8px 5vw;

    .header-glass {
      background: rgba(15, 15, 26, 0.85);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.3),
        0 0 60px rgba(238, 90, 36, 0.1);
    }

    .logo-img {
      width: 36px !important;
      height: 36px !important;
    }

    .brand-name {
      font-size: 18px !important;
    }

    .time-widget {
      padding: 8px 16px;
      min-width: 160px;
    }

    .time-digit {
      font-size: 24px !important;
      min-width: 32px;

      &.seconds {
        font-size: 18px !important;
        min-width: 24px;
      }
    }

    .time-colon {
      font-size: 20px !important;
    }

    .date-row,
    .lunar-row {
      transform: scale(0.9);
    }

    .frame-corner {
      width: 8px;
      height: 8px;
      &::before { width: 8px !important; }
      &::after { height: 8px !important; }
    }
  }
}

.header-glass {
  position: relative;
  background: rgba(15, 15, 26, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 16px 32px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: rgba(238, 90, 36, 0.3);
  }

  // 浅色模式
  [data-theme="light"] & {
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(0, 0, 0, 0.08);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);

    &:hover {
      border-color: rgba(238, 90, 36, 0.2);
    }
  }
}

.header-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 30% 50%,
    rgba(238, 90, 36, 0.08) 0%,
    transparent 50%
  );
  pointer-events: none;
  animation: headerGlowMove 8s ease-in-out infinite alternate;
}

@keyframes headerGlowMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(20%, 10%);
  }
}

.header-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 32px;
}

// Logo 区域
.logo-area {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateX(4px);

    .logo-container .logo-ring {
      transform: scale(1.2);
      opacity: 1;
    }

    .logo-img {
      transform: rotate(10deg) scale(1.1);
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
  width: 48px;
  height: 48px;
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 4px 12px rgba(238, 90, 36, 0.3));
}

.logo-ring {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(238, 90, 36, 0.5), rgba(165, 94, 234, 0.5)) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: all 0.4s ease;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-name {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
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

.brand-slogan {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.5);
  }
}

// 时间小部件
.time-widget {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
  border-radius: 16px;
  min-width: 200px;

  [data-theme="light"] & {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.01) 100%);
  }

  &.loading {
    min-height: 80px;
    justify-content: center;
  }
}

// 装饰性边框角落
.time-frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.frame-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  opacity: 0.6;

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: linear-gradient(135deg, #ee5a24, #a55eea);
  }

  &.top-left {
    top: 0;
    left: 0;
    &::before {
      top: 0;
      left: 0;
      width: 12px;
      height: 2px;
    }
    &::after {
      top: 0;
      left: 0;
      width: 2px;
      height: 12px;
    }
  }

  &.top-right {
    top: 0;
    right: 0;
    &::before {
      top: 0;
      right: 0;
      width: 12px;
      height: 2px;
    }
    &::after {
      top: 0;
      right: 0;
      width: 2px;
      height: 12px;
    }
  }

  &.bottom-left {
    bottom: 0;
    left: 0;
    &::before {
      bottom: 0;
      left: 0;
      width: 12px;
      height: 2px;
    }
    &::after {
      bottom: 0;
      left: 0;
      width: 2px;
      height: 12px;
    }
  }

  &.bottom-right {
    bottom: 0;
    right: 0;
    &::before {
      bottom: 0;
      right: 0;
      width: 12px;
      height: 2px;
    }
    &::after {
      bottom: 0;
      right: 0;
      width: 2px;
      height: 12px;
    }
  }
}

// 日期行
.date-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.date-segment {
  font-family: 'Outfit', 'SF Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.5);
  }
}

.date-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ee5a24, #a55eea);
  opacity: 0.6;
}

// 时间主体
.time-main {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 6px;
}

.time-digit {
  font-family: 'Outfit', 'SF Mono', monospace;
  font-size: 32px;
  font-weight: 300;
  letter-spacing: 1px;
  background: linear-gradient(180deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  min-width: 44px;
  text-align: center;
  transition: all 0.3s ease;

  [data-theme="light"] & {
    background: linear-gradient(180deg, #1a1a2e 0%, #3d3d5c 100%);
    -webkit-background-clip: text;
    background-clip: text;
  }

  &.seconds {
    font-size: 24px;
    min-width: 32px;
    opacity: 0.7;
    background: linear-gradient(180deg, #ee5a24 0%, #a55eea 100%);
    -webkit-background-clip: text;
    background-clip: text;
    animation: secondPulse 1s ease-in-out infinite;
  }
}

.time-colon {
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 200;
  color: rgba(255, 255, 255, 0.4);
  animation: colonBlink 1s ease-in-out infinite;
  margin: 0 2px;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.3);
  }
}

@keyframes colonBlink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes secondPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

// 农历行
.lunar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lunar-badge {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  padding: 2px 8px;
  background: linear-gradient(135deg, rgba(238, 90, 36, 0.15), rgba(165, 94, 234, 0.15));
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);

  [data-theme="light"] & {
    background: linear-gradient(135deg, rgba(238, 90, 36, 0.1), rgba(165, 94, 234, 0.1));
    color: rgba(26, 26, 46, 0.8);
  }
}

.lunar-divider {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.2);

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.2);
  }
}

.lunar-text {
  font-size: 11px;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5);

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.5);
  }
}

.lunar-weekday {
  font-size: 11px;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5);

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.5);
  }
}

// 加载动画
.loading-pulse {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(238, 90, 36, 0.3), rgba(165, 94, 234, 0.3));
  animation: loadingPulse 1.5s ease-in-out infinite;
}

@keyframes loadingPulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

// 控制按钮区域
.controls-area {
  display: flex;
  justify-content: flex-end;
}

.control-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  // 浅色模式
  [data-theme="light"] & {
    background: rgba(0, 0, 0, 0.04);
    color: rgba(26, 26, 46, 0.7);

    &:hover {
      background: rgba(0, 0, 0, 0.08);
      color: #1a1a2e;
    }
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(238, 90, 36, 0.5), rgba(165, 94, 234, 0.5));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0) scale(0.95);
  }

  &.theme-btn {
    .btn-glow {
      position: absolute;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(238, 90, 36, 0.4) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover .btn-glow {
      opacity: 1;
      animation: pulse-glow 2s ease-in-out infinite;
    }
  }
}

@keyframes pulse-glow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

// 移动端菜单
.mobile-menu {
  display: none;
}

.mobile-btn {
  width: 48px;
  height: 48px;
}

// 响应式
@media (max-width: 768px) {
  .header-content {
    display: flex;
    justify-content: space-between;
  }

  .logo-area {
    .brand-slogan {
      display: none;
    }
  }

  .time-widget,
  .controls-area {
    display: none;
  }

  .mobile-menu {
    display: block;
  }
}

@media (max-width: 480px) {
  .header-wrapper {
    padding: 12px 4vw;
  }

  .header-glass {
    padding: 12px 16px;
    border-radius: 16px;
  }

  .logo-img {
    width: 40px;
    height: 40px;
  }

  .brand-name {
    font-size: 18px;
  }
}
</style>
