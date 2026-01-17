<template>
  <div class="home-page">
    <!-- 页面标题区域 -->
    <div class="page-hero" v-if="store.newsArr[0] && store.newsArr.filter((item) => item.show)[0]">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
          </span>
          <span class="title-text">实时热点</span>
        </h1>
        <p class="hero-subtitle">
          追踪全网热门，{{ visibleCount }} 个平台实时更新
        </p>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-value">{{ visibleCount }}</span>
          <span class="stat-label">数据源</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">24/7</span>
          <span class="stat-label">实时更新</span>
        </div>
      </div>
    </div>

    <!-- 卡片网格 -->
    <div
      class="cards-grid"
      v-if="store.newsArr[0] && store.newsArr.filter((item) => item.show)[0]"
    >
      <div
        class="card-item"
        v-for="(item, index) in store.newsArr.filter((item) => item.show)"
        :key="item.name"
        :style="{
          '--delay': `${getStaggerDelay(index)}s`,
          '--col': getGridColumn(index),
        }"
      >
        <HotList :hotData="item" />
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <h2 class="empty-title">暂无内容</h2>
      <p class="empty-text">请在设置中开启至少一个数据源</p>
      <button class="reset-btn" @click="reset">
        <span>重置配置</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import HotList from "@/components/HotList.vue";

const store = mainStore();

// 计算可见的数据源数量
const visibleCount = computed(() => {
  return store.newsArr.filter((item) => item.show).length;
});

// 计算交错动画延迟
const getStaggerDelay = (index) => {
  const row = Math.floor(index / 5);
  const col = index % 5;
  // 对角线效果
  return (row + col) * 0.08;
};

// 计算网格列位置（用于动画方向）
const getGridColumn = (index) => {
  return (index % 5) + 1;
};

// 重置
const reset = () => {
  $dialog.warning({
    title: "重置站点",
    content:
      "确认重置站点？你的自定义数据将会恢复为默认状态！（当设置页面能正常进入并显示时请不要执行此操作！）",
    positiveText: "重置",
    negativeText: "取消",
    onPositiveClick: () => {
      if ($timeInterval) clearInterval($timeInterval);
      localStorage.clear();
      location.reload();
    },
  });
};
</script>

<style lang="scss" scoped>
.home-page {
  position: relative;
  z-index: 1;
  padding-bottom: 40px;
}

// 页面头部区域
.page-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  padding: 32px;
  background: rgba(20, 20, 35, 0.5);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  animation: heroReveal 0.6s ease forwards;

  // 浅色模式
  [data-theme="light"] & {
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(0, 0, 0, 0.06);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  }
}

@keyframes heroReveal {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hero-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(238, 90, 36, 0.2), rgba(165, 94, 234, 0.2));
  border-radius: 12px;

  svg {
    width: 24px;
    height: 24px;
    color: #ff6b6b;
  }
}

.title-text {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  [data-theme="light"] & {
    background: linear-gradient(135deg, #1a1a2e 0%, #3d3d5c 100%);
    -webkit-background-clip: text;
    background-clip: text;
  }
}

.hero-subtitle {
  margin: 0;
  padding-left: 52px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.5);
  }
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  background: linear-gradient(135deg, #ff6b6b, #a55eea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.45);
  }
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.1), transparent);

  [data-theme="light"] & {
    background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.1), transparent);
  }
}

// 卡片网格
.cards-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;

  @media (max-width: 1500px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
}

.card-item {
  opacity: 0;
  animation: cardReveal 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: var(--delay);
}

@keyframes cardReveal {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
    filter: blur(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 60px 40px;
  background: rgba(20, 20, 35, 0.5);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  animation: fadeIn 0.5s ease;

  [data-theme="light"] & {
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(0, 0, 0, 0.06);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  color: rgba(238, 90, 36, 0.4);

  svg {
    width: 100%;
    height: 100%;
  }
}

.empty-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);

  [data-theme="light"] & {
    color: #1a1a2e;
  }
}

.empty-text {
  margin: 0 0 32px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.5);
  }
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(238, 90, 36, 0.8), rgba(165, 94, 234, 0.8));
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow:
      0 12px 32px rgba(238, 90, 36, 0.3),
      0 0 40px rgba(238, 90, 36, 0.2);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .page-hero {
    flex-direction: column;
    gap: 24px;
    text-align: center;
    padding: 24px;
  }

  .hero-content {
    align-items: center;
  }

  .hero-subtitle {
    padding-left: 0;
  }

  .title-text {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .page-hero {
    padding: 20px;
    margin-bottom: 24px;
  }

  .hero-title {
    flex-direction: column;
    gap: 8px;
  }

  .stat-value {
    font-size: 20px;
  }
}
</style>
