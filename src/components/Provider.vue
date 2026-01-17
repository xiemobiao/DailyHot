<!-- 全局配置组件 -->
<template>
  <n-config-provider
    abstract
    inline-theme-disabled
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="theme"
    :theme-overrides="themeOverrides"
  >
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider :max="1">
            <slot></slot>
            <NaiveProviderContent />
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup>
import {
  zhCN,
  dateZhCN,
  darkTheme,
  useOsTheme,
  useLoadingBar,
  useDialog,
  useMessage,
  useNotification,
} from "naive-ui";
import { mainStore } from "@/store";

const store = mainStore();
const osThemeRef = useOsTheme();

// 明暗切换
let theme = ref(null);
const changeTheme = () => {
  if (store.siteTheme === "light") {
    theme.value = null;
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (store.siteTheme === "dark") {
    theme.value = darkTheme;
    document.documentElement.setAttribute('data-theme', 'dark');
  }
};

// 根据系统决定明暗切换
const osThemeChange = (val) => {
  if (store.siteThemeAuto) {
    val == "dark" ? (store.siteTheme = "dark") : (store.siteTheme = "light");
  }
};

// 监听明暗变化
watch(
  () => store.siteTheme,
  () => {
    changeTheme();
  }
);

// 监听系统明暗变化
watch(
  () => osThemeRef.value,
  (val) => {
    osThemeChange(val);
  }
);

// 配置主题色 - 霓虹玻璃态风格
const themeOverrides = computed(() => ({
  common: {
    // 主色调
    primaryColor: "#ee5a24",
    primaryColorHover: "#ff6b6b",
    primaryColorSuppl: "#f368e0",
    primaryColorPressed: "#d63031",

    // 字体
    fontFamily: "'Outfit', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'Fira Code', monospace",

    // 圆角
    borderRadius: "12px",
    borderRadiusSmall: "8px",

    // 深色模式下的颜色
    ...(store.siteTheme === 'dark' ? {
      bodyColor: "#0f0f1a",
      cardColor: "rgba(20, 20, 35, 0.7)",
      modalColor: "rgba(20, 20, 35, 0.9)",
      popoverColor: "rgba(30, 30, 50, 0.95)",
      tableColor: "rgba(20, 20, 35, 0.5)",
      inputColor: "rgba(255, 255, 255, 0.05)",
      actionColor: "rgba(255, 255, 255, 0.06)",
      hoverColor: "rgba(255, 255, 255, 0.08)",
      tableColorHover: "rgba(255, 255, 255, 0.04)",
      tableColorStriped: "rgba(255, 255, 255, 0.02)",
      pressedColor: "rgba(255, 255, 255, 0.12)",
      borderColor: "rgba(255, 255, 255, 0.08)",
      dividerColor: "rgba(255, 255, 255, 0.06)",
      scrollbarColor: "rgba(238, 90, 36, 0.3)",
      scrollbarColorHover: "rgba(238, 90, 36, 0.5)",
    } : {
      bodyColor: "#f8f9fe",
      cardColor: "rgba(255, 255, 255, 0.9)",
      modalColor: "rgba(255, 255, 255, 0.95)",
      popoverColor: "rgba(255, 255, 255, 0.98)",
      inputColor: "rgba(0, 0, 0, 0.02)",
      actionColor: "rgba(0, 0, 0, 0.04)",
      hoverColor: "rgba(0, 0, 0, 0.06)",
      pressedColor: "rgba(0, 0, 0, 0.08)",
      borderColor: "rgba(0, 0, 0, 0.08)",
      dividerColor: "rgba(0, 0, 0, 0.06)",
    }),
  },
  Card: {
    borderRadius: "20px",
    paddingMedium: "20px",
    boxShadow: store.siteTheme === 'dark'
      ? "0 8px 32px rgba(0, 0, 0, 0.3)"
      : "0 8px 32px rgba(0, 0, 0, 0.08)",
  },
  Button: {
    borderRadiusMedium: "12px",
    borderRadiusSmall: "8px",
    borderRadiusLarge: "16px",
  },
  Dialog: {
    borderRadius: "20px",
    padding: "24px",
  },
  Message: {
    borderRadius: "12px",
    padding: "12px 20px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
  },
  Notification: {
    borderRadius: "16px",
    padding: "16px 20px",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
  },
  Dropdown: {
    borderRadius: "16px",
    padding: "8px",
    optionBorderRadius: "10px",
  },
  Tooltip: {
    borderRadius: "10px",
    padding: "8px 14px",
  },
  Input: {
    borderRadius: "12px",
  },
  Switch: {
    railColorActive: "linear-gradient(135deg, #ee5a24, #f368e0)",
  },
  Scrollbar: {
    width: "6px",
    borderRadius: "3px",
  },
}));

// 挂载 naive 组件的方法
const setupNaiveTools = () => {
  window.$loadingBar = useLoadingBar(); // 进度条
  window.$notification = useNotification(); // 通知
  window.$message = useMessage(); // 信息
  window.$dialog = useDialog(); // 对话框
};

const NaiveProviderContent = defineComponent({
  setup() {
    setupNaiveTools();
  },
  render() {
    return h("div", {
      class: {
        tools: true,
      },
    });
  },
});

onMounted(() => {
  changeTheme();
  osThemeChange(osThemeRef.value);
});
</script>
