<template>
  <n-tooltip trigger="hover" :disabled="loading">
    <template #trigger>
      <button
        class="ai-btn"
        :class="{ loading, analyzed: hasCache }"
        @click.stop="handleClick"
        :disabled="loading"
      >
        <n-icon v-if="loading" :component="Loading" :size="14" class="spin" />
        <n-icon v-else :component="Robot" :size="14" />
      </button>
    </template>
    {{ hasCache ? '查看 AI 分析' : '获取 AI 分析' }}
  </n-tooltip>
</template>

<script setup>
import { Robot, Loading } from "@icon-park/vue-next";
import { mainStore } from "@/store";

const store = mainStore();

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
  itemId: {
    type: [String, Number],
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);

// 是否有缓存
const hasCache = computed(() => {
  return store.getAiCache(props.source, props.itemId) !== null;
});

const handleClick = () => {
  emit("click");
};
</script>

<style lang="scss" scoped>
.ai-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(238, 90, 36, 0.15), rgba(165, 94, 234, 0.15));
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;

  [data-theme="light"] & {
    background: linear-gradient(135deg, rgba(238, 90, 36, 0.1), rgba(165, 94, 234, 0.1));
    color: rgba(26, 26, 46, 0.6);
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(238, 90, 36, 0.3), rgba(165, 94, 234, 0.3));
    color: #fff;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(238, 90, 36, 0.2);

    [data-theme="light"] & {
      color: #1a1a2e;
    }
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  &.loading {
    background: linear-gradient(135deg, rgba(238, 90, 36, 0.2), rgba(165, 94, 234, 0.2));
  }

  &.analyzed {
    background: linear-gradient(135deg, rgba(0, 210, 211, 0.2), rgba(165, 94, 234, 0.2));
    color: rgba(0, 210, 211, 0.9);

    [data-theme="light"] & {
      background: linear-gradient(135deg, rgba(0, 180, 180, 0.15), rgba(165, 94, 234, 0.15));
      color: rgba(0, 150, 150, 0.9);
    }
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
</style>
