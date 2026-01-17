<template>
  <Provider>
    <div class="app-container">
      <!-- 动态背景粒子 -->
      <div class="bg-particles">
        <div class="particle" v-for="i in 6" :key="i" :style="getParticleStyle(i)"></div>
      </div>

      <!-- 顶部导航 -->
      <Header />

      <!-- 主内容区域 -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </main>

      <!-- 底部 -->
      <Footer />

      <!-- 回到顶部按钮 -->
      <Transition name="fade">
        <button v-show="showBackTop" class="back-to-top" @click="scrollToTop">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </Transition>
    </div>
  </Provider>
</template>

<script setup>
import { mainStore } from "@/store";
import Provider from "@/components/Provider.vue";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

const store = mainStore();

// 回到顶部按钮状态
const showBackTop = ref(false);

// 监听滚动
const handleScroll = () => {
  showBackTop.value = window.scrollY > 300;
};

// 回到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// 生成粒子样式
const getParticleStyle = (index) => {
  const positions = [
    { top: '10%', left: '10%', size: 300, duration: 20 },
    { top: '60%', left: '80%', size: 400, duration: 25 },
    { top: '30%', left: '60%', size: 200, duration: 18 },
    { top: '80%', left: '20%', size: 350, duration: 22 },
    { top: '15%', left: '75%', size: 250, duration: 28 },
    { top: '70%', left: '50%', size: 300, duration: 24 },
  ];
  const pos = positions[index - 1];
  return {
    top: pos.top,
    left: pos.left,
    width: `${pos.size}px`,
    height: `${pos.size}px`,
    animationDuration: `${pos.duration}s`,
  };
};

onMounted(() => {
  store.checkNewsUpdate();

  // 写入默认
  nextTick(() => {
    if (store.newsArr.length === 0) {
      store.newsArr = store.defaultNewsArr;
    }
  });

  // 添加滚动监听
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
.app-container {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

// 动态背景粒子
.bg-particles {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at center, rgba(238, 90, 36, 0.08) 0%, transparent 70%);
  animation: particleFloat ease-in-out infinite;
  filter: blur(40px);

  &:nth-child(2) {
    background: radial-gradient(circle at center, rgba(165, 94, 234, 0.06) 0%, transparent 70%);
  }

  &:nth-child(3) {
    background: radial-gradient(circle at center, rgba(0, 210, 211, 0.05) 0%, transparent 70%);
  }

  &:nth-child(4) {
    background: radial-gradient(circle at center, rgba(255, 107, 129, 0.06) 0%, transparent 70%);
  }

  &:nth-child(5) {
    background: radial-gradient(circle at center, rgba(255, 159, 67, 0.05) 0%, transparent 70%);
  }

  &:nth-child(6) {
    background: radial-gradient(circle at center, rgba(165, 94, 234, 0.04) 0%, transparent 70%);
  }
}

@keyframes particleFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.95);
  }
  75% {
    transform: translate(20px, 10px) scale(1.05);
  }
}

// 主内容区域
.main-content {
  position: relative;
  z-index: 1;
  padding: 0 5vw;
  max-width: 1800px;
  margin: 0 auto;
  min-height: calc(100vh - 300px);
}

// 页面过渡动画
.page-enter-active,
.page-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
  filter: blur(4px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  filter: blur(4px);
}

// 回到顶部按钮
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 14px;
  background: rgba(20, 20, 35, 0.8);
  backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 40px rgba(238, 90, 36, 0.1);

  // 浅色模式
  [data-theme="light"] & {
    background: rgba(255, 255, 255, 0.9);
    color: rgba(26, 26, 46, 0.7);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    transform: translateY(-4px);
    background: linear-gradient(135deg, rgba(238, 90, 36, 0.8), rgba(165, 94, 234, 0.8));
    color: #fff;
    box-shadow:
      0 8px 32px rgba(238, 90, 36, 0.3),
      0 0 60px rgba(238, 90, 36, 0.2);
  }

  &:active {
    transform: translateY(-2px) scale(0.95);
  }
}

// 淡入淡出过渡
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式
@media (max-width: 768px) {
  .main-content {
    padding: 0 4vw;
  }

  .back-to-top {
    right: 16px;
    bottom: 16px;
    width: 44px;
    height: 44px;
  }
}
</style>
