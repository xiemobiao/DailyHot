import axios from "@/api/request";

/**
 * 用户注册
 * @param {string} email 邮箱
 * @param {string} password 密码
 * @param {string} nickname 昵称（可选）
 */
export const register = (email, password, nickname) => {
  return axios({
    method: "POST",
    url: "/user/register",
    data: { email, password, nickname },
  });
};

/**
 * 用户登录
 * @param {string} email 邮箱
 * @param {string} password 密码
 */
export const login = (email, password) => {
  return axios({
    method: "POST",
    url: "/user/login",
    data: { email, password },
  });
};

/**
 * 获取当前用户信息
 */
export const getProfile = () => {
  return axios({
    method: "GET",
    url: "/user/profile",
  });
};

/**
 * 更新用户信息
 * @param {Object} data 要更新的数据
 * @param {string} data.nickname 昵称
 * @param {string} data.avatar 头像 URL
 */
export const updateProfile = (data) => {
  return axios({
    method: "PUT",
    url: "/user/profile",
    data,
  });
};

/**
 * 修改密码
 * @param {string} oldPassword 旧密码
 * @param {string} newPassword 新密码
 */
export const changePassword = (oldPassword, newPassword) => {
  return axios({
    method: "PUT",
    url: "/user/password",
    data: { oldPassword, newPassword },
  });
};

/**
 * 登出
 */
export const logout = () => {
  return axios({
    method: "POST",
    url: "/user/logout",
  });
};
