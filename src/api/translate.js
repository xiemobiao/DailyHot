import axios from "@/api/request";

/**
 * 获取翻译服务状态
 * @returns {Promise} 翻译服务状态信息
 */
export const getTranslateStatus = () => {
  return axios({
    method: "GET",
    url: "/translate/status",
  });
};

/**
 * 批量翻译文本
 * @param {string[]} texts 需要翻译的文本数组
 * @param {string} source 数据源名称
 * @param {string} targetLang 目标语言，默认 zh-CN
 * @returns {Promise} 翻译结果数组
 */
export const batchTranslate = (texts, source, targetLang = "zh-CN") => {
  return axios({
    method: "POST",
    url: "/translate/batch",
    data: {
      texts,
      source,
      targetLang,
    },
  });
};
