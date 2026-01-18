<template>
  <div class="home-page">
    <!-- 区域 Tab 切换 -->
    <div class="region-tabs-wrapper">
      <n-tabs
        :value="store.currentRegion"
        @update:value="store.setRegion"
        type="segment"
        animated
        size="medium"
      >
        <n-tab name="all">
          <span class="tab-content">全部</span>
        </n-tab>
        <n-tab name="domestic">
          <span class="tab-content">国内热榜</span>
        </n-tab>
        <n-tab name="international">
          <span class="tab-content">国际热榜</span>
        </n-tab>
      </n-tabs>
    </div>

    <!-- 卡片网格 -->
    <div
      class="cards-grid"
      v-if="store.filteredNews && store.filteredNews.length > 0"
      :key="store.currentRegion"
    >
      <div
        class="card-item"
        v-for="(item, index) in store.filteredNews"
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
  padding-top: 8px;
}

// 区域 Tab 切换
.region-tabs-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;

  :deep(.n-tabs) {
    width: auto;

    .n-tabs-rail {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 4px;

      [data-theme="light"] & {
        background: rgba(0, 0, 0, 0.04);
      }
    }

    .n-tabs-capsule {
      border-radius: 8px !important;
      background: linear-gradient(135deg, #ee5a24, #f368e0) !important;
    }

    .n-tabs-tab {
      padding: 10px 24px !important;
      font-size: 14px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s ease;

      [data-theme="light"] & {
        color: rgba(0, 0, 0, 0.5);
      }

      &:hover {
        color: rgba(255, 255, 255, 0.9);

        [data-theme="light"] & {
          color: rgba(0, 0, 0, 0.8);
        }
      }

      &.n-tabs-tab--active {
        color: #fff !important;
        font-weight: 600;
      }
    }

    .n-tabs-tab-wrapper {
      padding: 0;
    }
  }

  .tab-content {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  @media (max-width: 560px) {
    :deep(.n-tabs) {
      .n-tabs-tab {
        padding: 8px 16px !important;
        font-size: 13px;
      }
    }
  }
}

// 卡片网格
.cards-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 1500px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.card-item {
  opacity: 0;
  min-width: 0; // 防止内容溢出导致宽度变化
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
</style>
