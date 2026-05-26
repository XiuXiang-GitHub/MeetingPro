// 员工列表 & 选择（用于排班指派）
Page({
  data: {
    list: [],
    loading: true,
    roles: ["全部", "领班", "服务员", "布台工", "保洁"],
    activeRole: "全部",
    statusFilter: "全部",
    mode: "",
  },
  onLoad(options) {
    this.setData({ mode: options.mode || "", dispatchType: options.dispatchType || "add" });
  },
  onShow() {
    this.loadList();
  },
  async loadList() {
    this.setData({ loading: true });
    try {
      const data = { skip: 0, limit: 50 };
      if (this.data.activeRole !== "全部") data.role = this.data.activeRole;
      const res = await wx.cloud.callFunction({
        name: "meetingFunctions",
        data: { action: "staff.staffList", data },
      });
      const list = res.result?.data || [];
      list.forEach(function (item) {
        if (item.status === "在职") item.statusTagClass = "tag-success";
        else if (item.status === "休假") item.statusTagClass = "tag-warn";
        else item.statusTagClass = "tag-neutral";
      });
      this.setData({ list, loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },
  onRoleChange(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({ activeRole: role }, () => this.loadList());
  },
  onSelectStaff(e) {
    const item = e.currentTarget.dataset.item;
    if (this.data.mode === "dispatch") {
      // 返回选中的员工，用于排班添加
      wx.navigateTo({ url: "/pages/scheduling/dispatch/index?staffId=" + item._id + "&staffName=" + item.name + "&dispatchType=" + this.data.dispatchType });
    } else {
      wx.navigateTo({ url: `/pages/scheduling/staff-detail/index?id=${item._id}` });
    }
  },
  onDeleteStaff(e) {
    var that = this;
    var item = e.currentTarget.dataset.item;
    wx.showModal({
      title: "确认删除",
      content: '将删除员工"' + item.name + '"及其所有排班记录',
      success: function (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "meetingFunctions",
            data: { action: "staff.staffDelete", data: { _id: item._id } },
            success: function () {
              wx.showToast({ title: "已删除", icon: "success" });
              that.loadList();
            },
          });
        }
      },
    });
  },
  onAdd() {
    wx.navigateTo({ url: "/pages/scheduling/staff-detail/index" });
  },
});
