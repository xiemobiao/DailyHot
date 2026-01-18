<template>
  <div class="user-avatar-wrapper">
    <!-- 已登录状态 -->
    <template v-if="store.isLoggedIn">
      <n-dropdown :options="dropdownOptions" @select="handleSelect">
        <div class="avatar-btn">
          <n-avatar
            :size="32"
            :src="store.user?.avatar"
            round
            class="user-avatar"
          >
            {{ avatarText }}
          </n-avatar>
        </div>
      </n-dropdown>
    </template>

    <!-- 未登录状态 -->
    <template v-else>
      <router-link to="/login" class="login-btn">
        <n-icon :component="User" :size="18" />
        <span>登录</span>
      </router-link>
    </template>
  </div>
</template>

<script setup>
import { h } from "vue";
import { NIcon } from "naive-ui";
import { User, Logout, Config } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import { useRouter } from "vue-router";

const store = mainStore();
const router = useRouter();

const avatarText = computed(() => {
  if (store.user?.nickname) {
    return store.user.nickname.charAt(0).toUpperCase();
  }
  if (store.user?.email) {
    return store.user.email.charAt(0).toUpperCase();
  }
  return "U";
});

const renderIcon = (icon) => {
  return () => h(NIcon, null, { default: () => h(icon) });
};

const dropdownOptions = [
  {
    label: store.user?.nickname || store.user?.email || "用户",
    key: "profile",
    icon: renderIcon(User),
  },
  {
    type: "divider",
    key: "d1",
  },
  {
    label: "个人设置",
    key: "settings",
    icon: renderIcon(Config),
  },
  {
    label: "退出登录",
    key: "logout",
    icon: renderIcon(Logout),
  },
];

const handleSelect = (key) => {
  switch (key) {
    case "profile":
    case "settings":
      router.push("/profile");
      break;
    case "logout":
      $dialog.warning({
        title: "退出登录",
        content: "确定要退出登录吗？",
        positiveText: "确定",
        negativeText: "取消",
        onPositiveClick: () => {
          store.logout();
          $message.success("已退出登录");
        },
      });
      break;
  }
};
</script>

<style lang="scss" scoped>
.user-avatar-wrapper {
  display: flex;
  align-items: center;
}

.avatar-btn {
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
}

.user-avatar {
  border: 2px solid rgba(238, 90, 36, 0.5);
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, #ee5a24, #f368e0);
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(238, 90, 36, 0.15), rgba(165, 94, 234, 0.15));
  border: 1px solid rgba(238, 90, 36, 0.3);
  border-radius: 20px;
  color: #ee5a24;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(135deg, rgba(238, 90, 36, 0.25), rgba(165, 94, 234, 0.25));
    border-color: rgba(238, 90, 36, 0.5);
    transform: translateY(-2px);
  }
}
</style>
