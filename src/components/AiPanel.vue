<template>
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="title"
    :style="{ maxWidth: '500px', width: '90%' }"
    :bordered="false"
    :segmented="{ content: true, footer: 'soft' }"
    class="ai-panel-modal"
  >
    <!-- 加载状态 -->
    <div v-if="loading" class="ai-loading">
      <div class="loading-spinner"></div>
      <p class="loading-text">AI 正在分析中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="ai-error">
      <n-icon :component="CloseOne" :size="48" class="error-icon" />
      <p class="error-text">{{ error }}</p>
      <n-button size="small" @click="handleRefresh">重试</n-button>
    </div>

    <!-- 分析结果 -->
    <div v-else-if="analysis" class="ai-content">
      <!-- 摘要 -->
      <section v-if="analysis.summary" class="ai-section">
        <div class="section-header">
          <n-icon :component="FileText" :size="18" />
          <h4>内容摘要</h4>
        </div>
        <p class="summary-text">{{ analysis.summary }}</p>
      </section>

      <!-- 情感分析 -->
      <section v-if="analysis.sentiment" class="ai-section">
        <div class="section-header">
          <n-icon :component="Emotion" :size="18" />
          <h4>舆论倾向</h4>
        </div>
        <div class="sentiment-wrapper">
          <div class="sentiment-label" :class="sentimentClass">
            {{ sentimentText }}
          </div>
          <div class="sentiment-bar-bg">
            <div
              class="sentiment-bar-fill"
              :class="sentimentClass"
              :style="{ width: sentimentPercent + '%' }"
            ></div>
          </div>
          <span class="sentiment-score">{{ sentimentPercent }}%</span>
        </div>
      </section>

      <!-- 智能分类 -->
      <section v-if="analysis.category && analysis.category.length" class="ai-section">
        <div class="section-header">
          <n-icon :component="Tag" :size="18" />
          <h4>智能分类</h4>
        </div>
        <div class="tags-wrapper">
          <n-tag
            v-for="tag in analysis.category"
            :key="tag"
            round
            :bordered="false"
            class="category-tag"
          >
            {{ tag }}
          </n-tag>
        </div>
      </section>

      <!-- 关键词 -->
      <section v-if="analysis.keywords && analysis.keywords.length" class="ai-section">
        <div class="section-header">
          <n-icon :component="Key" :size="18" />
          <h4>关键词</h4>
        </div>
        <div class="tags-wrapper">
          <n-tag
            v-for="keyword in analysis.keywords"
            :key="keyword"
            size="small"
            :bordered="false"
            class="keyword-tag"
          >
            {{ keyword }}
          </n-tag>
        </div>
      </section>
    </div>

    <!-- 空状态 -->
    <div v-else class="ai-empty">
      <n-icon :component="Robot" :size="48" class="empty-icon" />
      <p class="empty-text">暂无分析结果</p>
    </div>

    <template #footer>
      <div class="ai-footer">
        <span v-if="analysis?.updateTime" class="update-time">
          分析时间：{{ formatTime(analysis.updateTime) }}
        </span>
        <span v-if="analysis?.fromCache" class="cache-badge">
          <n-icon :component="Database" :size="12" />
          缓存
        </span>
        <n-button
          size="small"
          quaternary
          @click="handleRefresh"
          :loading="loading"
          :disabled="loading"
        >
          <template #icon>
            <n-icon :component="Refresh" />
          </template>
          重新分析
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup>
import {
  Robot,
  Refresh,
  FileText,
  Emotion,
  Tag,
  Key,
  CloseOne,
  Database,
} from "@icon-park/vue-next";
import { analyzeItem } from "@/api/ai";
import { mainStore } from "@/store";

const store = mainStore();

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    default: () => ({}),
  },
  source: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "AI 智能分析",
  },
});

const emit = defineEmits(["update:show"]);

// 状态
const loading = ref(false);
const error = ref(null);
const analysis = ref(null);

// 显示状态
const showModal = computed({
  get: () => props.show,
  set: (val) => emit("update:show", val),
});

// 情感分析相关计算
const sentimentClass = computed(() => {
  if (!analysis.value?.sentiment) return "";
  return {
    positive: "sentiment-positive",
    negative: "sentiment-negative",
    neutral: "sentiment-neutral",
  }[analysis.value.sentiment];
});

const sentimentText = computed(() => {
  if (!analysis.value?.sentiment) return "";
  return {
    positive: "正面",
    negative: "负面",
    neutral: "中立",
  }[analysis.value.sentiment];
});

const sentimentPercent = computed(() => {
  if (!analysis.value?.sentimentScore) return 50;
  return Math.round(analysis.value.sentimentScore * 100);
});

// 格式化时间
const formatTime = (time) => {
  if (!time) return "";
  const date = new Date(time);
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 获取分析结果
const fetchAnalysis = async () => {
  if (!props.item?.id || !props.source) return;

  // 先检查本地缓存
  const cached = store.getAiCache(props.source, props.item.id);
  if (cached) {
    analysis.value = cached;
    return;
  }

  loading.value = true;
  error.value = null;
  store.setAiLoading(props.source, props.item.id, true);

  try {
    const features = store.enabledAiFeatures;
    if (features.length === 0) {
      error.value = "请在设置中开启 AI 功能";
      return;
    }

    const result = await analyzeItem(
      {
        id: props.item.id,
        title: props.item.title,
        desc: props.item.desc,
        url: props.item.url,
      },
      props.source,
      features
    );

    if (result.code === 200 && result.data) {
      analysis.value = result.data;
      // 缓存到 store
      store.cacheAiResult(props.source, props.item.id, result.data);
    } else {
      error.value = result.message || "分析失败，请重试";
    }
  } catch (err) {
    console.error("AI analysis error:", err);
    error.value = err.message || "分析失败，请重试";
  } finally {
    loading.value = false;
    store.setAiLoading(props.source, props.item.id, false);
  }
};

// 刷新分析
const handleRefresh = () => {
  // 清除缓存
  store.cacheAiResult(props.source, props.item.id, null);
  analysis.value = null;
  fetchAnalysis();
};

// 监听显示状态
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      fetchAnalysis();
    }
  }
);

// 监听 item 变化
watch(
  () => props.item?.id,
  () => {
    if (props.show) {
      analysis.value = null;
      fetchAnalysis();
    }
  }
);
</script>

<style lang="scss" scoped>
.ai-panel-modal {
  :deep(.n-card) {
    background: rgba(20, 20, 35, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);

    [data-theme="light"] & {
      background: rgba(255, 255, 255, 0.98);
      border-color: rgba(0, 0, 0, 0.06);
    }
  }

  :deep(.n-card-header__main) {
    font-weight: 600;
    background: linear-gradient(135deg, #ee5a24, #a55eea);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

// 加载状态
.ai-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(238, 90, 36, 0.2);
  border-top-color: #ee5a24;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.6);
  }
}

// 错误状态
.ai-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
}

.error-icon {
  color: rgba(238, 90, 36, 0.6);
}

.error-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.6);
  }
}

// 空状态
.ai-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.3);

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.3);
  }
}

.empty-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.5);
  }
}

// 分析内容
.ai-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ai-section {
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: rgba(255, 255, 255, 0.9);

    [data-theme="light"] & {
      color: rgba(26, 26, 46, 0.9);
    }

    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }

    .n-icon {
      color: #ee5a24;
    }
  }
}

// 摘要
.summary-text {
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  line-height: 1.7;
  margin: 0;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  border-left: 3px solid #ee5a24;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.75);
    background: rgba(0, 0, 0, 0.03);
  }
}

// 情感分析
.sentiment-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sentiment-label {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  min-width: 50px;
  text-align: center;

  &.sentiment-positive {
    background: rgba(0, 210, 211, 0.2);
    color: #00d2d3;
  }

  &.sentiment-negative {
    background: rgba(238, 90, 36, 0.2);
    color: #ee5a24;
  }

  &.sentiment-neutral {
    background: rgba(255, 159, 67, 0.2);
    color: #ff9f43;
  }
}

.sentiment-bar-bg {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;

  [data-theme="light"] & {
    background: rgba(0, 0, 0, 0.08);
  }
}

.sentiment-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;

  &.sentiment-positive {
    background: linear-gradient(90deg, #00d2d3, #54e360);
  }

  &.sentiment-negative {
    background: linear-gradient(90deg, #ee5a24, #ff6b6b);
  }

  &.sentiment-neutral {
    background: linear-gradient(90deg, #ff9f43, #f368e0);
  }
}

.sentiment-score {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  min-width: 36px;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.6);
  }
}

// 标签
.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-tag {
  background: linear-gradient(135deg, rgba(238, 90, 36, 0.15), rgba(165, 94, 234, 0.15)) !important;
  color: rgba(255, 255, 255, 0.85) !important;

  [data-theme="light"] & {
    background: linear-gradient(135deg, rgba(238, 90, 36, 0.1), rgba(165, 94, 234, 0.1)) !important;
    color: rgba(26, 26, 46, 0.85) !important;
  }
}

.keyword-tag {
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.7) !important;

  [data-theme="light"] & {
    background: rgba(0, 0, 0, 0.05) !important;
    color: rgba(26, 26, 46, 0.7) !important;
  }
}

// 底部
.ai-footer {
  display: flex;
  align-items: center;
  gap: 12px;
}

.update-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  flex: 1;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.45);
  }
}

.cache-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 11px;
  color: rgba(0, 210, 211, 0.8);
  background: rgba(0, 210, 211, 0.1);
  border-radius: 10px;
}
</style>
