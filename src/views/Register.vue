<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-header">
        <h1 class="register-title">创建账号</h1>
        <p class="register-subtitle">注册以开启个性化体验</p>
      </div>

      <n-form ref="formRef" :model="formData" :rules="rules" class="register-form">
        <n-form-item path="email" label="邮箱">
          <n-input
            v-model:value="formData.email"
            placeholder="请输入邮箱"
            :input-props="{ autocomplete: 'email' }"
          >
            <template #prefix>
              <n-icon :component="Mail" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="nickname" label="昵称">
          <n-input
            v-model:value="formData.nickname"
            placeholder="请输入昵称（可选）"
            :input-props="{ autocomplete: 'nickname' }"
          >
            <template #prefix>
              <n-icon :component="User" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="password" label="密码">
          <n-input
            v-model:value="formData.password"
            type="password"
            show-password-on="click"
            placeholder="请输入密码（至少 6 位）"
            :input-props="{ autocomplete: 'new-password' }"
          >
            <template #prefix>
              <n-icon :component="Lock" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="confirmPassword" label="确认密码">
          <n-input
            v-model:value="formData.confirmPassword"
            type="password"
            show-password-on="click"
            placeholder="请再次输入密码"
            :input-props="{ autocomplete: 'new-password' }"
            @keyup.enter="handleRegister"
          >
            <template #prefix>
              <n-icon :component="Lock" />
            </template>
          </n-input>
        </n-form-item>

        <n-button
          type="primary"
          block
          :loading="loading"
          @click="handleRegister"
          class="register-btn"
        >
          注册
        </n-button>
      </n-form>

      <div class="register-footer">
        <span>已有账号？</span>
        <router-link to="/login" class="link">立即登录</router-link>
      </div>

      <router-link to="/" class="back-home">
        <n-icon :component="Left" />
        返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { Mail, Lock, User, Left } from "@icon-park/vue-next";
import { register } from "@/api/user";
import { useRouter } from "vue-router";

const router = useRouter();
const formRef = ref(null);
const loading = ref(false);

const formData = reactive({
  email: "",
  nickname: "",
  password: "",
  confirmPassword: "",
});

const validatePasswordSame = (rule, value) => {
  return value === formData.password;
};

const rules = {
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" },
  ],
  nickname: [
    { max: 20, message: "昵称长度不能超过 20 位", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度至少 6 位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    {
      validator: validatePasswordSame,
      message: "两次输入的密码不一致",
      trigger: "blur",
    },
  ],
};

const handleRegister = async () => {
  try {
    await formRef.value?.validate();

    loading.value = true;
    const res = await register(
      formData.email,
      formData.password,
      formData.nickname || undefined
    );

    if (res.code === 200) {
      $message.success("注册成功，请登录");
      router.push("/login");
    } else {
      $message.error(res.message || "注册失败");
    }
  } catch (error) {
    if (error?.length) {
      // 表单验证错误
      return;
    }
    console.error("注册错误:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

  [data-theme="light"] & {
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  }
}

.register-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;

  [data-theme="light"] & {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(0, 0, 0, 0.06);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  }
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  background: linear-gradient(135deg, #ee5a24, #f368e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.5);
  }
}

.register-form {
  :deep(.n-form-item-label__text) {
    color: rgba(255, 255, 255, 0.7);

    [data-theme="light"] & {
      color: rgba(26, 26, 46, 0.7);
    }
  }

  :deep(.n-input) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);

    [data-theme="light"] & {
      background: rgba(0, 0, 0, 0.02);
      border-color: rgba(0, 0, 0, 0.1);
    }

    &:hover,
    &:focus-within {
      border-color: #ee5a24;
    }
  }
}

.register-btn {
  margin-top: 16px;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #ee5a24, #f368e0);
  border: none;
  border-radius: 12px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(238, 90, 36, 0.3);
  }
}

.register-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.5);
  }

  .link {
    color: #ee5a24;
    text-decoration: none;
    font-weight: 500;
    margin-left: 4px;

    &:hover {
      text-decoration: underline;
    }
  }
}

.back-home {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 24px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  transition: color 0.3s;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.4);
  }

  &:hover {
    color: #ee5a24;
  }
}
</style>
