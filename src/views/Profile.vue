<template>
  <div class="profile-page">
    <div class="profile-card">
      <router-link to="/" class="back-btn">
        <n-icon :component="Left" />
        返回首页
      </router-link>

      <!-- 用户信息头部 -->
      <div class="profile-header">
        <div class="avatar-wrapper">
          <n-avatar
            :size="80"
            :src="store.user?.avatar"
            :fallback-src="defaultAvatar"
            round
          >
            {{ avatarText }}
          </n-avatar>
        </div>
        <h2 class="user-name">{{ store.user?.nickname || store.user?.email }}</h2>
        <p class="user-email">{{ store.user?.email }}</p>
      </div>

      <!-- 编辑资料 -->
      <div class="profile-section">
        <h3 class="section-title">
          <n-icon :component="Edit" />
          编辑资料
        </h3>
        <n-form
          ref="profileFormRef"
          :model="profileForm"
          label-placement="left"
          label-width="80"
        >
          <n-form-item label="昵称">
            <n-input
              v-model:value="profileForm.nickname"
              placeholder="请输入昵称"
            />
          </n-form-item>
          <n-form-item label="头像 URL">
            <n-input
              v-model:value="profileForm.avatar"
              placeholder="请输入头像图片链接"
            />
          </n-form-item>
          <n-button
            type="primary"
            :loading="profileLoading"
            @click="handleUpdateProfile"
            class="save-btn"
          >
            保存修改
          </n-button>
        </n-form>
      </div>

      <!-- 修改密码 -->
      <div class="profile-section">
        <h3 class="section-title">
          <n-icon :component="Lock" />
          修改密码
        </h3>
        <n-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-placement="left"
          label-width="80"
        >
          <n-form-item label="旧密码" path="oldPassword">
            <n-input
              v-model:value="passwordForm.oldPassword"
              type="password"
              show-password-on="click"
              placeholder="请输入旧密码"
            />
          </n-form-item>
          <n-form-item label="新密码" path="newPassword">
            <n-input
              v-model:value="passwordForm.newPassword"
              type="password"
              show-password-on="click"
              placeholder="请输入新密码（至少 6 位）"
            />
          </n-form-item>
          <n-form-item label="确认密码" path="confirmPassword">
            <n-input
              v-model:value="passwordForm.confirmPassword"
              type="password"
              show-password-on="click"
              placeholder="请再次输入新密码"
            />
          </n-form-item>
          <n-button
            type="warning"
            :loading="passwordLoading"
            @click="handleChangePassword"
            class="save-btn"
          >
            修改密码
          </n-button>
        </n-form>
      </div>

      <!-- 退出登录 -->
      <div class="profile-section logout-section">
        <n-button
          type="error"
          quaternary
          @click="handleLogout"
          class="logout-btn"
        >
          <template #icon>
            <n-icon :component="Logout" />
          </template>
          退出登录
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Left, Edit, Lock, Logout } from "@icon-park/vue-next";
import { updateProfile, changePassword } from "@/api/user";
import { mainStore } from "@/store";
import { useRouter } from "vue-router";

const store = mainStore();
const router = useRouter();

// 如果未登录，跳转到登录页
if (!store.isLoggedIn) {
  router.push("/login");
}

const defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

const avatarText = computed(() => {
  if (store.user?.nickname) {
    return store.user.nickname.charAt(0).toUpperCase();
  }
  if (store.user?.email) {
    return store.user.email.charAt(0).toUpperCase();
  }
  return "U";
});

// 编辑资料表单
const profileFormRef = ref(null);
const profileLoading = ref(false);
const profileForm = reactive({
  nickname: store.user?.nickname || "",
  avatar: store.user?.avatar || "",
});

// 修改密码表单
const passwordFormRef = ref(null);
const passwordLoading = ref(false);
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const validatePasswordSame = (rule, value) => {
  return value === passwordForm.newPassword;
};

const passwordRules = {
  oldPassword: [
    { required: true, message: "请输入旧密码", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度至少 6 位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: validatePasswordSame,
      message: "两次输入的密码不一致",
      trigger: "blur",
    },
  ],
};

// 更新资料
const handleUpdateProfile = async () => {
  try {
    profileLoading.value = true;
    const data = {};
    if (profileForm.nickname !== store.user?.nickname) {
      data.nickname = profileForm.nickname;
    }
    if (profileForm.avatar !== store.user?.avatar) {
      data.avatar = profileForm.avatar;
    }

    if (Object.keys(data).length === 0) {
      $message.info("没有需要更新的内容");
      return;
    }

    const res = await updateProfile(data);
    if (res.code === 200) {
      store.setUser(res.data);
      $message.success("资料更新成功");
    } else {
      $message.error(res.message || "更新失败");
    }
  } catch (error) {
    console.error("更新资料错误:", error);
  } finally {
    profileLoading.value = false;
  }
};

// 修改密码
const handleChangePassword = async () => {
  try {
    await passwordFormRef.value?.validate();

    passwordLoading.value = true;
    const res = await changePassword(
      passwordForm.oldPassword,
      passwordForm.newPassword
    );

    if (res.code === 200) {
      $message.success("密码修改成功，请重新登录");
      store.logout();
      router.push("/login");
    } else {
      $message.error(res.message || "修改密码失败");
    }
  } catch (error) {
    if (error?.length) {
      return;
    }
    console.error("修改密码错误:", error);
  } finally {
    passwordLoading.value = false;
  }
};

// 退出登录
const handleLogout = () => {
  $dialog.warning({
    title: "退出登录",
    content: "确定要退出登录吗？",
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: () => {
      store.logout();
      $message.success("已退出登录");
      router.push("/");
    },
  });
};

// 监听用户变化，同步表单
watch(
  () => store.user,
  (newUser) => {
    if (newUser) {
      profileForm.nickname = newUser.nickname || "";
      profileForm.avatar = newUser.avatar || "";
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

  [data-theme="light"] & {
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  }
}

.profile-card {
  width: 100%;
  max-width: 500px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  position: relative;

  [data-theme="light"] & {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(0, 0, 0, 0.06);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  }
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  margin-bottom: 24px;
  transition: color 0.3s;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.5);
  }

  &:hover {
    color: #ee5a24;
  }
}

.profile-header {
  text-align: center;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;

  [data-theme="light"] & {
    border-color: rgba(0, 0, 0, 0.06);
  }
}

.avatar-wrapper {
  margin-bottom: 16px;

  :deep(.n-avatar) {
    border: 3px solid rgba(238, 90, 36, 0.5);
    font-size: 28px;
    font-weight: 600;
    background: linear-gradient(135deg, #ee5a24, #f368e0);
  }
}

.user-name {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 4px;
  color: rgba(255, 255, 255, 0.9);

  [data-theme="light"] & {
    color: #1a1a2e;
  }
}

.user-email {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.5);
  }
}

.profile-section {
  padding: 24px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  [data-theme="light"] & {
    border-color: rgba(0, 0, 0, 0.06);
  }

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px;
  color: rgba(255, 255, 255, 0.85);

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.85);
  }

  .n-icon {
    color: #ee5a24;
  }
}

:deep(.n-form-item-label__text) {
  color: rgba(255, 255, 255, 0.6);

  [data-theme="light"] & {
    color: rgba(26, 26, 46, 0.6);
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

.save-btn {
  margin-top: 8px;
  border-radius: 10px;
}

.logout-section {
  text-align: center;
}

.logout-btn {
  font-size: 15px;
}
</style>
