<template>
  <div
    class="hot-card-wrapper"
    :id="`hot-list-${hotData.name}`"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
  >
    <!-- 发光边框 -->
    <div class="card-glow" :style="glowStyle"></div>

    <!-- 卡片主体 -->
    <div class="hot-card" :style="cardStyle" @click="toList">
      <!-- 卡片内部光晕 -->
      <div class="card-shine" :style="shineStyle"></div>

      <!-- 头部 -->
      <header class="card-header">
        <div class="source-info">
          <div class="source-icon-wrapper">
            <n-avatar
              class="source-icon"
              :src="`/logo/${hotData.name}.png`"
              fallback-src="/ico/icon_error.png"
            />
            <div class="icon-ring"></div>
          </div>
          <span class="source-name">{{ hotData.label }}</span>
        </div>
        <div class="header-actions">
          <!-- 翻译按钮 - 仅国际热榜显示 -->
          <n-tooltip v-if="isInternational && store.aiEnabled" placement="bottom">
            <template #trigger>
              <button
                class="translate-btn"
                :class="{ active: showTranslated, loading: isTranslating }"
                @click.stop="handleTranslate"
                :disabled="isTranslating"
              >
                <n-icon v-if="isTranslating" :component="Loading" :size="14" class="spin" />
                <n-icon v-else :component="Translate" :size="14" />
              </button>
            </template>
            {{ showTranslated ? '显示原文' : '翻译为中文' }}
          </n-tooltip>
          <div class="source-type" v-if="hotListData?.type">
            <span>{{ hotListData.type }}</span>
          </div>
          <div class="source-type skeleton" v-else></div>
        </div>
      </header>

      <!-- 内容区域 -->
      <div class="card-content">
        <n-scrollbar class="news-scrollbar" ref="scrollbarRef">
          <Transition name="fade" mode="out-in">
            <!-- 错误状态 -->
            <div v-if="loadingError" class="state-error">
              <div class="error-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="error-text">加载失败了</p>
              <button class="retry-btn" @click.stop="getHotListsData(hotData.name)">
                <n-icon :component="Refresh" :size="14" />
                <span>重试</span>
              </button>
            </div>

            <!-- 加载状态 -->
            <div v-else-if="!hotListData || listLoading" class="state-loading">
              <div class="skeleton-item" v-for="i in 10" :key="i" :style="{ animationDelay: `${i * 0.05}s` }"></div>
            </div>

            <!-- 列表内容 -->
            <div v-else class="news-list" :id="hotData.name + 'Lists'">
              <div
                class="news-item"
                v-for="(item, index) in hotListData.data.slice(0, 15)"
                :key="item"
                :style="{ animationDelay: `${index * 0.03}s` }"
                @click.stop="jumpLink(item)"
              >
                <span
                  class="item-rank"
                  :class="{
                    'rank-1': index === 0,
                    'rank-2': index === 1,
                    'rank-3': index === 2
                  }"
                >
                  {{ index + 1 }}
                </span>
                <span class="item-title" :style="{ fontSize: store.listFontSize + 'px' }">
                  {{ getDisplayTitle(item, index) }}
                </span>
                <AiButton
                  v-if="store.aiEnabled"
                  :source="hotData.name"
                  :item-id="item.id"
                  :loading="store.getAiLoading(hotData.name, item.id)"
                  @click="handleAiClick(item)"
                  class="item-ai-btn"
                />
                <div class="item-hover-line"></div>
              </div>
            </div>
          </Transition>
        </n-scrollbar>
      </div>

      <!-- 底部 -->
      <footer class="card-footer">
        <Transition name="fade" mode="out-in">
          <div v-if="!hotListData" class="footer-loading">
            <div class="skeleton-line"></div>
          </div>
          <div v-else class="footer-content">
            <span class="update-time">{{ updateTime || '获取中...' }}</span>
            <div class="footer-actions">
              <button
                v-if="hotListData.data.length > 15"
                class="action-btn"
                @click.stop="toList"
              >
                <n-icon :component="More" :size="16" />
              </button>
              <button class="action-btn refresh" @click.stop="getNewData">
                <n-icon :component="Refresh" :size="16" />
              </button>
            </div>
          </div>
        </Transition>
      </footer>
    </div>

    <!-- AI 分析面板 -->
    <AiPanel
      v-model:show="showAiPanel"
      :item="selectedAiItem"
      :source="hotData.name"
      :title="`AI 分析 - ${selectedAiItem?.title?.slice(0, 20) || ''}...`"
    />
  </div>
</template>

<script setup>
import { Refresh, More, Translate, Loading } from "@icon-park/vue-next";
import { getHotLists } from "@/api";
import { batchTranslate } from "@/api/translate";
import { formatTime } from "@/utils/getTime";
import { mainStore } from "@/store";
import { useRouter } from "vue-router";
import AiButton from "@/components/AiButton.vue";
import AiPanel from "@/components/AiPanel.vue";

const router = useRouter();
const store = mainStore();
const props = defineProps({
  hotData: {
    type: Object,
    default: () => ({}),
  },
});

// 状态
const updateTime = ref(null);
const lastClickTime = ref(localStorage.getItem(`${props.hotData.name}Btn`) || 0);
const hotListData = ref(null);
const scrollbarRef = ref(null);
const listLoading = ref(false);
const loadingError = ref(false);

// AI 相关状态
const showAiPanel = ref(false);
const selectedAiItem = ref(null);

// 翻译相关状态
const isTranslating = ref(false);
const showTranslated = ref(false);
const translatedTitles = ref(new Map()); // 存储翻译结果 index -> translated

// 判断是否为国际热榜
const isInternational = computed(() => {
  const newsItem = store.newsArr.find((item) => item.name === props.hotData.name);
  return newsItem?.region === "international";
});

// 3D 效果状态
const isHovering = ref(false);
const mouseX = ref(0);
const mouseY = ref(0);
const cardRef = ref(null);

// 计算卡片 3D 变换样式
const cardStyle = computed(() => {
  if (!isHovering.value) {
    return {
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    };
  }
  const rotateX = (mouseY.value - 0.5) * -10;
  const rotateY = (mouseX.value - 0.5) * 10;
  return {
    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
  };
});

// 光晕位置样式
const glowStyle = computed(() => {
  if (!isHovering.value) {
    return { opacity: 0 };
  }
  return {
    opacity: 1,
    background: `radial-gradient(600px circle at ${mouseX.value * 100}% ${mouseY.value * 100}%, rgba(238, 90, 36, 0.15), transparent 40%)`,
  };
});

// 光泽效果样式
const shineStyle = computed(() => {
  if (!isHovering.value) {
    return { opacity: 0 };
  }
  return {
    opacity: 1,
    background: `radial-gradient(400px circle at ${mouseX.value * 100}% ${mouseY.value * 100}%, rgba(255, 255, 255, 0.1), transparent 40%)`,
  };
});

// 鼠标事件处理
const handleMouseEnter = () => {
  isHovering.value = true;
};

const handleMouseLeave = () => {
  isHovering.value = false;
};

const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  mouseX.value = (e.clientX - rect.left) / rect.width;
  mouseY.value = (e.clientY - rect.top) / rect.height;
};

// 获取热榜数据
const getHotListsData = async (name, isNew = false) => {
  try {
    loadingError.value = false;
    const item = store.newsArr.find((item) => item.name == name);
    const result = await getHotLists(item.name, isNew, item.params);
    if (result.code === 200) {
      listLoading.value = false;
      hotListData.value = result;
      if (scrollbarRef.value) {
        scrollbarRef.value.scrollTo({ position: "top", behavior: "smooth" });
      }
    } else {
      loadingError.value = true;
      $message.error(result.title + result.message);
    }
  } catch (error) {
    loadingError.value = true;
    $message.error("热榜加载失败，请重试");
  }
};

// 获取最新数据
const getNewData = () => {
  const now = Date.now();
  if (now - lastClickTime.value > 60000) {
    listLoading.value = true;
    getHotListsData(props.hotData.name, true);
    lastClickTime.value = now;
    localStorage.setItem(`${props.hotData.name}Btn`, now);
  } else {
    $message.info("请稍后再刷新");
  }
};

// 链接跳转
const jumpLink = (data) => {
  if (!data.url || !data.mobileUrl) return $message.error("链接不存在");
  const url = window.innerWidth > 680 ? data.url : data.mobileUrl;
  if (store.linkOpenType === "open") {
    window.open(url, "_blank");
  } else if (store.linkOpenType === "href") {
    window.location.href = url;
  }
};

// AI 分析
const handleAiClick = (item) => {
  if (!store.aiEnabled) {
    $message.info("请先在设置中开启 AI 功能");
    return;
  }
  selectedAiItem.value = item;
  showAiPanel.value = true;
};

// 获取显示的标题（原文或译文）
const getDisplayTitle = (item, index) => {
  if (showTranslated.value && translatedTitles.value.has(index)) {
    return translatedTitles.value.get(index);
  }
  return item.title;
};

// 处理翻译
const handleTranslate = async () => {
  // 如果已翻译，切换显示状态
  if (translatedTitles.value.size > 0) {
    showTranslated.value = !showTranslated.value;
    return;
  }

  // 开始翻译
  if (!hotListData.value?.data || isTranslating.value) return;

  isTranslating.value = true;

  try {
    const titles = hotListData.value.data.slice(0, 15).map((item) => item.title);
    const result = await batchTranslate(titles, props.hotData.name);

    if (result.code === 200 && result.data) {
      // 存储翻译结果
      result.data.forEach((item, index) => {
        translatedTitles.value.set(index, item.translated);
      });
      showTranslated.value = true;
      $message.success("翻译完成");
    } else {
      $message.error(result.message || "翻译失败");
    }
  } catch (error) {
    console.error("Translation error:", error);
    $message.error("翻译服务暂不可用");
  } finally {
    isTranslating.value = false;
  }
};

// 前往全部列表
const toList = () => {
  if (props.hotData.name) {
    router.push({
      path: "/list",
      query: { type: props.hotData.name },
    });
  } else {
    $message.error("数据出错，请重试");
  }
};

// 判断列表是否显示
const checkListShow = () => {
  const typeName = props.hotData.name;
  const listId = "hot-list-" + typeName;
  const listDom = document.getElementById(listId);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log(`👀 ${typeName} 可见，开始加载`);
        getHotListsData(props.hotData.name);
        observer.unobserve(entry.target);
      }
    });
  });
  observer.observe(listDom);
};

// 监听时间变化更新
watch(
  () => store.timeData,
  () => {
    if (hotListData.value) {
      updateTime.value = formatTime(hotListData.value.updateTime);
    }
  }
);

onMounted(() => {
  checkListShow();
});
</script>

<style lang="scss" scoped>
.hot-card-wrapper {
  position: relative;
  border-radius: 20px;
}

// 外发光效果
.card-glow {
  position: absolute;
  inset: -1px;
  border-radius: 21px;
  pointer-events: none;
  transition: opacity 0.4s ease;
  z-index: 0;
}

// 卡片主体
.hot-card {
  position: relative;
  background: rgba(20, 20, 35, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  will-change: transform;
  overflow: hidden;

  &:hover {
    border-color: rgba(238, 90, 36, 0.3);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 60px rgba(238, 90, 36, 0.1);
  }

  // 浅色模式
  [data-theme="light"] & {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(0, 0, 0, 0.06);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);

    &:hover {
      border-color: rgba(238, 90, 36, 0.2);
      box-shadow:
        0 12px 32px rgba(0, 0, 0, 0.1),
        0 0 40px rgba(238, 90, 36, 0.05);
    }
  }
}

// 卡片内光泽
.card-shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
  z-index: 1;
}

// 头部
.card-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.source-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.source-icon-wrapper {
  position: relative;
}

.source-icon {
  width: 28px !important;
  height: 28px !important;
  border-radius: 8px;
  background: transparent;
  transition: transform 0.3s ease;

  .hot-card:hover & {
    transform: scale(1.1) rotate(5deg);
  }
}

.icon-ring {
  position: absolute;
  inset: -4px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(238, 90, 36, 0.5), rgba(165, 94, 234, 0.5)) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;

  .hot-card:hover & {
    opacity: 1;
  }
}

.source-name {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.5px;

  [data-theme="light"] & {
    color: #1a1a2e;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.translate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;

  [data-theme="light"] & {
    background: rgba(0, 0, 0, 0.04);
    color: rgba(26, 26, 46, 0.5);
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(0, 210, 211, 0.2), rgba(165, 94, 234, 0.2));
    color: #fff;
    transform: scale(1.1);

    [data-theme="light"] & {
      color: #1a1a2e;
    }
  }

  &.active {
    background: linear-gradient(135deg, rgba(0, 210, 211, 0.3), rgba(165, 94, 234, 0.3));
    color: #00d2d3;

    [data-theme="light"] & {
      color: #00a8a9;
    }
  }

  &.loading {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .spin {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.source-type {
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  letter-spacing: 0.5px;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.6);
    background: rgba(0, 0, 0, 0.04);
  }

  &.skeleton {
    width: 50px;
    height: 22px;
    background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;

    [data-theme="light"] & {
      background: linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%);
      background-size: 200% 100%;
    }
  }
}

// 内容区域
.card-content {
  position: relative;
  z-index: 2;
  height: 320px;
}

.news-scrollbar {
  height: 100%;

  :deep(.n-scrollbar-rail) {
    right: -8px;
    width: 4px;
  }

  :deep(.n-scrollbar-rail__scrollbar) {
    background: linear-gradient(180deg, rgba(238, 90, 36, 0.5), rgba(165, 94, 234, 0.5));
    border-radius: 2px;
  }
}

// 加载状态
.state-loading {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 8px;
}

.skeleton-item {
  height: 28px;
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// 错误状态
.state-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: rgba(238, 90, 36, 0.6);

  svg {
    width: 100%;
    height: 100%;
  }
}

.error-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(238, 90, 36, 0.2), rgba(165, 94, 234, 0.2));
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(238, 90, 36, 0.3), rgba(165, 94, 234, 0.3));
    transform: translateY(-2px);
  }
}

// 新闻列表
.news-list {
  padding-right: 8px;
}

.news-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: itemReveal 0.4s ease forwards;
  opacity: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    transform: translateX(4px);

    .item-title {
      color: #fff;

      [data-theme="light"] & {
        color: #1a1a2e;
      }
    }

    .item-hover-line {
      width: 100%;
    }
  }

  // 浅色模式悬停背景
  [data-theme="light"] & {
    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  &:active {
    transform: translateX(4px) scale(0.99);
  }
}

@keyframes itemReveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.item-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  transition: all 0.3s ease;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.5);
    background: rgba(0, 0, 0, 0.05);
  }

  &.rank-1 {
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    color: #fff;
    box-shadow: 0 4px 12px rgba(238, 90, 36, 0.3);
  }

  &.rank-2 {
    background: linear-gradient(135deg, #ff9f43, #f368e0);
    color: #fff;
    box-shadow: 0 4px 12px rgba(255, 159, 67, 0.3);
  }

  &.rank-3 {
    background: linear-gradient(135deg, #a55eea, #00d2d3);
    color: #fff;
    box-shadow: 0 4px 12px rgba(165, 94, 234, 0.3);
  }
}

.item-title {
  flex: 1;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  line-height: 1.5;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.75);
  }
}

.item-ai-btn {
  opacity: 0;
  transition: opacity 0.2s ease;

  .news-item:hover & {
    opacity: 1;
  }
}

.item-hover-line {
  position: absolute;
  bottom: 0;
  left: 44px;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, rgba(238, 90, 36, 0.6), rgba(165, 94, 234, 0.6));
  border-radius: 1px;
  transition: width 0.3s ease;
}

// 底部
.card-footer {
  position: relative;
  z-index: 2;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.footer-loading {
  .skeleton-line {
    height: 20px;
    width: 100px;
    background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
    background-size: 200% 100%;
    border-radius: 4px;
    animation: shimmer 1.5s infinite;
  }
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.update-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.5px;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.45);
  }
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;

  [data-theme="light"] & {
    background: rgba(0, 0, 0, 0.04);
    color: rgba(26, 26, 46, 0.5);

    &:hover {
      background: rgba(0, 0, 0, 0.08);
      color: #1a1a2e;
    }
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0) scale(0.95);
  }

  &.refresh:hover {
    background: linear-gradient(135deg, rgba(238, 90, 36, 0.2), rgba(165, 94, 234, 0.2));
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
