App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
  },

  globalData: {
    env: "dev-meet-sz-01-d6gl3c9h2cd0a2b59",
    userInfo: null
  }
});
