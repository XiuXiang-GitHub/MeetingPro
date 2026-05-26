// 执行清单列表
Page({
  data: { list: [], loading: true },
  onShow() { this.loadList(); },
  async loadList() {
    this.setData({ loading: true });
    try {
      const res = await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "checklist.list" } });
      this.setData({ list: res.result?.data || [], loading: false });
    } catch (e) { this.setData({ loading: false }); }
  },
  async onCreate() {
    wx.showModal({
      title: "创建执行清单",
      content: "将从标准化模板创建会前/会中/会后三阶段清单，继续？",
      success: async (res) => {
        if (res.confirm) {
          const r = await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "checklist.createFromTemplate", data: { title: "新会议执行清单" } } });
          if (r.result.success) { wx.showToast({ title: "创建成功" }); this.loadList(); }
        }
      },
    });
  },
  onViewDetail(e) {
    wx.navigateTo({ url: `/pages/checklist/detail/index?id=${e.currentTarget.dataset.id}` });
  },
});
