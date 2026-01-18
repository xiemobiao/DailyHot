<template>
  <div class="setting">
    <div class="title">全局设置</div>
    <n-h6 prefix="bar"> 基础设置 </n-h6>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">明暗模式</n-text>
        </div>
        <n-select
          class="set"
          v-model:value="siteTheme"
          :options="themeOptions"
          @update:value="siteThemeAuto = false"
        />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">明暗模式跟随系统</n-text>
          <n-text class="tip" :depth="3"> 明暗模式是否跟随系统当前模式 </n-text>
        </div>
        <n-switch
          v-model:value="siteThemeAuto"
          :round="false"
          @update:value="themeAutoOpen"
        />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">链接跳转方式</n-text>
          <n-text class="tip" :depth="3"> 选择榜单列表内容的跳转方式 </n-text>
        </div>
        <n-select
          class="set"
          v-model:value="linkOpenType"
          :options="linkOptions"
        />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">固定导航栏</n-text>
          <n-text class="tip" :depth="3"> 导航栏是否固定 </n-text>
        </div>
        <n-switch v-model:value="headerFixed" :round="false" />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top" style="flex-direction: column; align-items: flex-start">
        <div class="name">
          <n-text class="text">列表文本大小</n-text>
          <n-card
            class="tip"
            :style="{
              backgroundColor: 'var(--n-border-color)',
              margin: '12px 0',
            }"
          >
            <n-text :style="{ fontSize: listFontSize + 'px' }">
              我是将要显示的文字的大小
            </n-text>
          </n-card>
        </div>

        <n-slider
          v-model:value="listFontSize"
          :tooltip="false"
          :max="20"
          :min="14"
          :step="0.01"
          :marks="{
            14: '小一点',
            16: '默认',
            20: '最大',
          }"
        />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">榜单排序</n-text>
          <n-text class="tip" :depth="3">
            拖拽以排序，开关用以控制在页面中的显示状态
          </n-text>
        </div>
        <n-popconfirm @positive-click="restoreDefault">
          <template #trigger>
            <n-button class="control" size="small"> 恢复默认 </n-button>
          </template>
          确认将排序恢复到默认状态？
        </n-popconfirm>
      </div>
      <!-- 区域 Tab 切换 -->
      <div class="region-tabs-setting">
        <n-tabs
          v-model:value="settingRegion"
          type="segment"
          size="small"
          animated
        >
          <n-tab name="all">全部</n-tab>
          <n-tab name="domestic">国内</n-tab>
          <n-tab name="international">国际</n-tab>
        </n-tabs>
      </div>
      <draggable
        :list="filteredNewsForSetting"
        :animation="200"
        class="mews-group"
        item-key="order"
        @end="saveSoreData()"
      >
        <template #item="{ element }">
          <div
            class="item"
            :class="{ active: element.show }"
          >
            <div class="item-glow"></div>
            <div class="item-content">
              <div class="desc">
                <div class="logo-wrapper">
                  <img class="logo" :src="`/logo/${element.name}.png`" alt="logo" />
                </div>
                <n-text class="news-name" v-html="element.label" />
                <n-tag
                  v-if="element.region === 'international'"
                  size="tiny"
                  type="info"
                  :bordered="false"
                  class="region-tag"
                >
                  国际
                </n-tag>
              </div>
              <n-switch
                class="switch"
                :round="false"
                v-model:value="element.show"
                @update:value="saveSoreData(element.label, element.show)"
              />
            </div>
          </div>
        </template>
      </draggable>
    </n-card>
    <n-h6 prefix="bar"> AI 功能设置 </n-h6>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">AI 智能分析</n-text>
          <n-text class="tip" :depth="3">
            开启后可获取热点内容的 AI 摘要、情感分析等
          </n-text>
        </div>
        <n-switch v-model:value="aiEnabled" :round="false" />
      </div>
    </n-card>
    <n-card class="set-item" v-if="aiEnabled">
      <div class="top" style="flex-direction: column; align-items: flex-start">
        <div class="name" style="width: 100%">
          <n-text class="text">AI 功能选项</n-text>
          <n-text class="tip" :depth="3">
            选择需要启用的 AI 分析功能
          </n-text>
        </div>
        <div class="ai-features">
          <n-checkbox v-model:checked="aiFeatures.summary">
            AI 摘要
          </n-checkbox>
          <n-checkbox v-model:checked="aiFeatures.sentiment">
            情感分析
          </n-checkbox>
          <n-checkbox v-model:checked="aiFeatures.category">
            智能分类
          </n-checkbox>
        </div>
      </div>
    </n-card>
    <n-card class="set-item" v-if="aiEnabled">
      <div class="top">
        <div class="name">
          <n-text class="text">清除 AI 缓存</n-text>
          <n-text class="tip" :depth="3">
            清除本地存储的 AI 分析结果
          </n-text>
        </div>
        <n-button size="small" @click="clearAiCache">
          清除缓存
        </n-button>
      </div>
    </n-card>
    <n-h6 prefix="bar"> 杂项设置 </n-h6>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">重置所有数据</n-text>
          <n-text class="tip" :depth="3">
            重置所有数据，你的自定义设置都将会丢失
          </n-text>
        </div>
        <n-popconfirm @positive-click="reset">
          <template #trigger>
            <n-button type="warning"> 重置 </n-button>
          </template>
          确认重置所有数据？你的自定义设置都将会丢失！
        </n-popconfirm>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { mainStore } from "@/store";
import { useOsTheme } from "naive-ui";
import draggable from "vuedraggable";
import { ref, computed } from "vue";

const store = mainStore();
const osThemeRef = useOsTheme();
const {
  siteTheme,
  siteThemeAuto,
  newsArr,
  linkOpenType,
  headerFixed,
  listFontSize,
  aiEnabled,
  aiFeatures,
} = storeToRefs(store);

// 设置页面的区域筛选
const settingRegion = ref("all");

// 根据区域筛选数据源
const filteredNewsForSetting = computed(() => {
  if (settingRegion.value === "all") {
    return newsArr.value;
  }
  return newsArr.value.filter((item) => item.region === settingRegion.value);
});

// 深浅模式
const themeOptions = ref([
  {
    label: "浅色模式",
    value: "light",
  },
  {
    label: "深色模式",
    value: "dark",
  },
]);

// 榜单跳转
const linkOptions = [
  {
    label: "新页面打开",
    value: "open",
  },
  {
    label: "当前页打开",
    value: "href",
  },
];

// 开启明暗自动跟随
const themeAutoOpen = (val) => {
  console.log(osThemeRef.value);
  if (val) {
    siteTheme.value = osThemeRef.value;
  }
};

// 恢复默认排序
const restoreDefault = () => {
  newsArr.value = newsArr.value.sort((a, b) => a.order - b.order);
  $message.success("恢复默认榜单排序成功");
};

// 将排序结果写入
const saveSoreData = (name = null, open = false) => {
  $message.success(
    name ? `${name}榜单已${open ? "开启" : "关闭"}` : "榜单排序成功"
  );
};

// 重置数据
const reset = () => {
  if (typeof $timeInterval !== "undefined") clearInterval($timeInterval);
  localStorage.clear();
  location.reload();
};

// 清除 AI 缓存
const clearAiCache = () => {
  store.clearAiCache();
  $message.success("AI 分析缓存已清除");
};
</script>

<style lang="scss" scoped>
.setting {
  .title {
    margin-top: 30px;
    margin-bottom: 20px;
    font-size: 40px;
    font-weight: bold;
  }

  .n-h {
    padding-left: 16px;
    font-size: 20px;
    margin-left: 4px;
  }

  .set-item {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 12px;

    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .name {
        font-size: 18px;
        display: flex;
        flex-direction: column;

        .tip {
          font-size: 12px;
          border-radius: 8px;
        }
      }

      .set {
        max-width: 200px;
      }
    }

    .ai-features {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 12px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      width: 100%;

      [data-theme="light"] & {
        background: rgba(0, 0, 0, 0.02);
      }
    }

    .region-tabs-setting {
      margin: 16px 0;
      display: flex;
      justify-content: flex-start;

      :deep(.n-tabs) {
        width: auto;

        .n-tabs-rail {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 3px;

          [data-theme="light"] & {
            background: rgba(0, 0, 0, 0.04);
          }
        }

        .n-tabs-capsule {
          border-radius: 6px !important;
          background: linear-gradient(135deg, #ee5a24, #f368e0) !important;
        }

        .n-tabs-tab {
          padding: 6px 16px !important;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);

          [data-theme="light"] & {
            color: rgba(0, 0, 0, 0.5);
          }

          &.n-tabs-tab--active {
            color: #fff !important;
          }
        }
      }
    }

    .mews-group {
      margin-top: 16px;
      display: grid;
      grid-template-columns: repeat(5, minmax(0px, 1fr));
      gap: 24px;

      @media (max-width: 1666px) {
        grid-template-columns: repeat(4, minmax(0px, 1fr));
      }

      @media (max-width: 1200px) {
        grid-template-columns: repeat(3, minmax(0px, 1fr));
      }

      @media (max-width: 890px) {
        grid-template-columns: repeat(2, minmax(0px, 1fr));
      }

      @media (max-width: 620px) {
        grid-template-columns: repeat(1, minmax(0px, 1fr));
      }

      .item {
        position: relative;
        cursor: pointer;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;

        [data-theme="light"] & {
          background: rgba(0, 0, 0, 0.02);
          border-color: rgba(0, 0, 0, 0.06);
        }

        &:hover {
          border-color: rgba(238, 90, 36, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        // 选中状态
        &.active {
          background: linear-gradient(135deg, rgba(238, 90, 36, 0.08) 0%, rgba(165, 94, 234, 0.06) 100%);
          border-color: rgba(238, 90, 36, 0.25);
          box-shadow:
            0 4px 16px rgba(238, 90, 36, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);

          [data-theme="light"] & {
            background: linear-gradient(135deg, rgba(238, 90, 36, 0.06) 0%, rgba(165, 94, 234, 0.04) 100%);
            border-color: rgba(238, 90, 36, 0.2);
            box-shadow:
              0 4px 16px rgba(238, 90, 36, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.5);
          }

          .item-glow {
            opacity: 1;
          }

          .logo-wrapper {
            background: linear-gradient(135deg, rgba(238, 90, 36, 0.15), rgba(165, 94, 234, 0.15));

            &::after {
              opacity: 1;
            }
          }

          .news-name {
            color: #fff;

            [data-theme="light"] & {
              color: #1a1a2e;
            }
          }
        }

        // 未选中状态
        &:not(.active) {
          .desc {
            opacity: 0.6;
          }
        }

        .item-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(238, 90, 36, 0.5), rgba(165, 94, 234, 0.5), transparent);
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .item-content {
          display: flex;
          align-items: center;
          padding: 16px;
        }

        .desc {
          display: flex;
          align-items: center;
          width: 100%;
          transition: all 0.3s ease;

          .logo-wrapper {
            position: relative;
            width: 40px;
            height: 40px;
            margin-right: 12px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;

            [data-theme="light"] & {
              background: rgba(0, 0, 0, 0.03);
            }

            &::after {
              content: '';
              position: absolute;
              inset: -2px;
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
          }

          .logo {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            transition: transform 0.3s ease;
          }

          .news-name {
            font-size: 14px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.75);
            transition: color 0.3s ease;

            [data-theme="light"] & {
              color: rgba(26, 26, 46, 0.75);
            }
          }

          .region-tag {
            margin-left: 8px;
            font-size: 10px;
            padding: 0 6px;
            height: 18px;
            line-height: 18px;
          }
        }

        .switch {
          margin-left: auto;
          flex-shrink: 0;
        }
      }
    }
  }
}

// 全局开关样式覆盖
.mews-group {
  :deep(.n-switch) {
    .n-switch__rail {
      background-color: rgba(120, 120, 130, 0.3) !important;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15);
    }
  }

  :deep(.n-switch.n-switch--active) {
    .n-switch__rail {
      background: linear-gradient(135deg, #ee5a24, #f39c12) !important;
      box-shadow:
        0 2px 12px rgba(238, 90, 36, 0.5),
        0 0 20px rgba(238, 90, 36, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
    }
  }
}
</style>
