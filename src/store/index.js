import { defineStore } from "pinia";

export const mainStore = defineStore("mainData", {
  state: () => {
    return {
      // 系统主题
      siteTheme: "light",
      siteThemeAuto: true,
      // 当前区域筛选
      currentRegion: "all", // all | domestic | international
      // 新闻类别
      defaultNewsArr: [
        // 国内数据源
        {
          label: "哔哩哔哩",
          name: "bilibili",
          order: 0,
          show: true,
          region: "domestic",
        },
        {
          label: "微博",
          name: "weibo",
          order: 1,
          show: true,
          region: "domestic",
        },
        {
          label: "抖音",
          name: "douyin",
          order: 2,
          show: true,
          region: "domestic",
        },
        {
          label: "知乎",
          name: "zhihu",
          order: 3,
          show: true,
          region: "domestic",
        },
        {
          label: "36氪",
          name: "36kr",
          order: 4,
          show: true,
          region: "domestic",
        },
        {
          label: "百度",
          name: "baidu",
          order: 5,
          show: true,
          region: "domestic",
        },
        {
          label: "少数派",
          name: "sspai",
          order: 6,
          show: true,
          region: "domestic",
        },
        {
          label: "IT之家",
          name: "ithome",
          order: 7,
          show: true,
          region: "domestic",
        },
        {
          label: "澎湃新闻",
          name: "thepaper",
          order: 8,
          show: true,
          region: "domestic",
        },
        {
          label: "今日头条",
          name: "toutiao",
          order: 9,
          show: true,
          region: "domestic",
        },
        {
          label: "百度贴吧",
          name: "tieba",
          order: 10,
          show: true,
          region: "domestic",
        },
        {
          label: "稀土掘金",
          name: "juejin",
          order: 11,
          show: true,
          region: "domestic",
        },
        {
          label: "腾讯新闻",
          name: "qq-news",
          order: 12,
          show: true,
          region: "domestic",
        },
        {
          label: "豆瓣电影",
          name: "douban-movie",
          order: 13,
          show: true,
          region: "domestic",
        },
        {
          label: "原神",
          name: "genshin",
          order: 14,
          show: true,
          region: "domestic",
        },
        {
          label: "崩坏：星穹铁道",
          name: "starrail",
          order: 16,
          show: true,
          region: "domestic",
        },
        {
          label: "LOL",
          name: "lol",
          order: 15,
          show: true,
          region: "domestic",
        },
        {
          label: "网易新闻",
          name: "netease-news",
          order: 17,
          show: true,
          region: "domestic",
        },
        {
          label: "微信读书",
          name: "weread",
          order: 18,
          show: true,
          region: "domestic",
        },
        {
          label: "豆瓣讨论小组",
          name: "douban-group",
          order: 19,
          show: true,
          region: "domestic",
        },
        {
          label: "NGA",
          name: "ngabbs",
          order: 20,
          show: true,
          region: "domestic",
        },
        {
          label: "HelloGitHub",
          name: "hellogithub",
          order: 21,
          show: true,
          region: "domestic",
        },
        {
          label: "简书",
          name: "jianshu",
          order: 22,
          show: true,
          region: "domestic",
        },
        {
          label: "知乎日报",
          name: "zhihu-daily",
          order: 23,
          show: true,
          region: "domestic",
        },
        {
          label: "Linux.do",
          name: "linuxdo",
          order: 24,
          show: true,
          region: "domestic",
          params: {
            period: "weekly",
          },
        },
        // 国际数据源
        {
          label: "Reddit",
          name: "reddit",
          order: 25,
          show: true,
          region: "international",
        },
        {
          label: "Hacker News",
          name: "hackernews",
          order: 26,
          show: true,
          region: "international",
        },
        {
          label: "Dev.to",
          name: "devto",
          order: 27,
          show: true,
          region: "international",
        },
        {
          label: "Lobsters",
          name: "lobsters",
          order: 28,
          show: true,
          region: "international",
        },
        {
          label: "BBC News",
          name: "bbc",
          order: 29,
          show: true,
          region: "international",
        },
        {
          label: "GitHub Trending",
          name: "github",
          order: 30,
          show: true,
          region: "international",
        },
        {
          label: "Product Hunt",
          name: "producthunt",
          order: 31,
          show: true,
          region: "international",
        },
        {
          label: "Mastodon",
          name: "mastodon",
          order: 32,
          show: true,
          region: "international",
        },
      ],
      newsArr: [],
      // 链接跳转方式
      linkOpenType: "open",
      // 页头固定
      headerFixed: true,
      // 时间数据
      timeData: null,
      // 字体大小
      listFontSize: 16,
    };
  },
  getters: {
    // 根据区域筛选数据源
    filteredNews: (state) => {
      if (state.currentRegion === "all") {
        return state.newsArr.filter((item) => item.show);
      }
      return state.newsArr.filter(
        (item) => item.show && item.region === state.currentRegion
      );
    },
    // 获取国内数据源
    domesticNews: (state) => {
      return state.newsArr.filter((item) => item.region === "domestic");
    },
    // 获取国际数据源
    internationalNews: (state) => {
      return state.newsArr.filter((item) => item.region === "international");
    },
  },
  actions: {
    // 设置区域筛选
    setRegion(region) {
      this.currentRegion = region;
    },
    // 更改系统主题
    setSiteTheme(val) {
      $message.info(`已切换至${val === "dark" ? "深色模式" : "浅色模式"}`, {
        showIcon: false,
      });
      this.siteTheme = val;
      this.siteThemeAuto = false;
    },
    // 检查更新
    checkNewsUpdate() {
      const mainData = JSON.parse(localStorage.getItem("mainData"));
      let updatedNum = 0;
      if (!mainData) return false;
      console.log("列表尝试更新", this.defaultNewsArr, this.newsArr);
      // 执行比较并迁移
      if (this.newsArr.length > 0) {
        for (const newItem of this.defaultNewsArr) {
          const exists = this.newsArr.some(
            (news) => newItem.label === news.label && newItem.name === news.name
          );
          if (!exists) {
            console.log("列表有更新：", newItem);
            updatedNum++;
            this.newsArr.push(newItem);
          }
        }
        // 同步现有数据源的 region 字段
        for (const news of this.newsArr) {
          const defaultItem = this.defaultNewsArr.find(
            (item) => item.name === news.name
          );
          if (defaultItem && !news.region) {
            news.region = defaultItem.region;
          }
        }
        if (updatedNum) $message.success(`成功更新 ${updatedNum} 个榜单数据`);
      } else {
        console.log("列表无内容，写入默认");
        this.newsArr = this.defaultNewsArr;
      }
    },
  },
  persist: [
    {
      storage: localStorage,
      paths: [
        "siteTheme",
        "siteThemeAuto",
        "newsArr",
        "linkOpenType",
        "headerFixed",
        "listFontSize",
        "currentRegion",
      ],
    },
  ],
});
