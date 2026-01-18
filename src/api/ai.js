import axios from "@/api/request";

/**
 * 获取 AI 服务状态
 * @returns {Promise} AI 服务状态信息
 */
export const getAiStatus = () => {
  return axios({
    method: "GET",
    url: "/ai/status",
  });
};

/**
 * AI 分析单条热点
 * @param {object} item 热点数据 { id, title, desc, url }
 * @param {string} source 数据源名称
 * @param {array} features 分析功能 ['summary', 'sentiment', 'category']
 * @returns {Promise} AI 分析结果
 */
export const analyzeItem = (item, source, features = ["summary", "sentiment", "category"]) => {
  return axios({
    method: "POST",
    url: "/ai/analyze",
    data: {
      item,
      source,
      features,
    },
  });
};

/**
 * AI 批量分析热点
 * @param {array} items 热点数据数组
 * @param {string} source 数据源名称
 * @param {array} features 分析功能
 * @returns {Promise} AI 分析结果数组
 */
export const batchAnalyze = (items, source, features = ["summary", "sentiment", "category"]) => {
  return axios({
    method: "POST",
    url: "/ai/analyze/batch",
    data: {
      items,
      source,
      features,
    },
  });
};
