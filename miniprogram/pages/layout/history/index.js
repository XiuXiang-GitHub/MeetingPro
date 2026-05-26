// 历史方案列表
Page({
  data: { list: [], loading: true, page: 0, hasMore: true },
  onShow() { this.loadList(); },
  async loadList() {
    this.setData({ loading: true, page: 0, list: [] });
    try {
      const res = await wx.cloud.callFunction({
        name: "meetingFunctions",
        data: { action: "layout.list", data: { skip: 0, limit: 20 } },
      });
      const data = res.result?.data || [];
      this.setData({ list: data, loading: false, hasMore: data.length >= 20 });
    } catch (e) {
      this.setData({ loading: false });
    }
  },
  async loadMore() {
    if (!this.data.hasMore || this.data.loading) return;
    const page = this.data.page + 1;
    this.setData({ loading: true });
    try {
      const res = await wx.cloud.callFunction({
        name: "meetingFunctions",
        data: { action: "layout.list", data: { skip: page * 20, limit: 20 } },
      });
      const data = res.result?.data || [];
      this.setData({
        list: [...this.data.list, ...data],
        page, loading: false,
        hasMore: data.length >= 20,
      });
    } catch (e) {
      this.setData({ loading: false });
    }
  },
  onLoadLayout(e) {
    var item = e.currentTarget.dataset.item;
    wx.setStorageSync("loadLayoutId", item._id);
    wx.switchTab({ url: "/pages/layout/editor/index" });
  },
  async onDelete(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: "确认删除",
      content: `将删除方案"${item.name}"`,
      success: async (res) => {
        if (res.confirm) {
          await wx.cloud.callFunction({
            name: "meetingFunctions",
            data: { action: "layout.delete", data: { _id: item._id } },
          });
          this.loadList();
        }
      },
    });
  },
});
