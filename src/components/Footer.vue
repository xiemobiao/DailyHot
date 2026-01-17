<template>
  <footer class="site-footer">
    <!-- 渐变分隔线 -->
    <div class="footer-divider">
      <div class="divider-glow"></div>
    </div>

    <div class="footer-content">
      <!-- 主要信息 -->
      <div class="footer-main">
        <div class="footer-brand">
          <span class="brand-name" v-html="packageJson.description" />
          <span class="brand-separator">·</span>
          <span
            class="brand-author"
            @click="jumpLink(packageJson.github)"
            v-html="packageJson.author"
          />
        </div>

        <p class="footer-desc">追踪全网热点，让信息触手可及</p>
      </div>

      <!-- 链接区域 -->
      <div class="footer-links">
        <a class="footer-link" @click="jumpLink(packageJson.github)">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>GitHub</span>
        </a>
      </div>
    </div>

    <!-- 备案信息 -->
    <div class="footer-icp" v-if="icp">
      <span class="icp-link" v-html="icp" @click="jumpLink('https://beian.miit.gov.cn/')" />
    </div>

    <!-- 版权信息 -->
    <div class="footer-copyright">
      <span>Made with</span>
      <svg class="heart-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      <span>by {{ packageJson.author }}</span>
    </div>
  </footer>
</template>

<script setup>
import packageJson from "@/../package.json";

const icp = ref(import.meta.env.VITE_ICP ? import.meta.env.VITE_ICP : null);

// 链接跳转
const jumpLink = (url) => {
  window.open(url);
};
</script>

<style lang="scss" scoped>
.site-footer {
  position: relative;
  z-index: 1;
  padding: 0 5vw 40px;
  max-width: 1800px;
  margin: 60px auto 0;
}

// 渐变分隔线
.footer-divider {
  position: relative;
  height: 1px;
  margin-bottom: 40px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(238, 90, 36, 0.3) 20%,
    rgba(165, 94, 234, 0.3) 50%,
    rgba(0, 210, 211, 0.3) 80%,
    transparent 100%
  );
}

.divider-glow {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 20px;
  background: radial-gradient(ellipse at center, rgba(238, 90, 36, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

// 内容区域
.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.footer-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

.brand-name {
  font-weight: 600;
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

.brand-separator {
  color: rgba(255, 255, 255, 0.3);

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.3);
  }
}

.brand-author {
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.6);
  }

  &:hover {
    color: #ff6b6b;
  }
}

.footer-desc {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.45);
  }
}

// 链接区域
.footer-links {
  display: flex;
  gap: 16px;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  [data-theme="light"] & {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.08);
    color: rgba(26, 26, 46, 0.7);

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #1a1a2e;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
  }

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(238, 90, 36, 0.3);
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
}

// 备案信息
.footer-icp {
  text-align: center;
  margin-bottom: 16px;
}

.icp-link {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: color 0.3s ease;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.35);

    &:hover {
      color: rgba(26, 26, 46, 0.6);
    }
  }

  &:hover {
    color: rgba(255, 255, 255, 0.6);
  }
}

// 版权信息
.footer-copyright {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.35);
  }
}

.heart-icon {
  width: 14px;
  height: 14px;
  color: #ff6b6b;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

// 响应式
@media (max-width: 768px) {
  .site-footer {
    padding: 0 4vw 32px;
    margin-top: 40px;
  }

  .footer-content {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }

  .footer-main {
    align-items: center;
  }

  .footer-brand {
    flex-direction: column;
    gap: 4px;
  }

  .brand-separator {
    display: none;
  }
}
</style>
