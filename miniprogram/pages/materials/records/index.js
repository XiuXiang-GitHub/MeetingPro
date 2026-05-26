// 领用归还记录
Page({
  data: { list: [], loading: true },
  onShow() { this.loadLogs(); },
  async loadLogs() {
    this.setData({ loading: true });
    try {
      const res = await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "material.logs" } });
      this.setData({ list: res.result?.data || [], loading: false });
    } catch (e) { this.setData({ loading: false }); }
  },
});
