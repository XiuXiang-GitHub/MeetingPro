// 更多 — 功能入口网格
Page({
  data: {
    menus: [
      { icon: "📅", title: "会议档期", desc: "场地预定与档期管理", url: "/pages/schedule/calendar/index" },
      { icon: "👥", title: "员工档案", desc: "人员信息与技能管理", url: "/pages/scheduling/staff-list/index" },
      { icon: "📦", title: "物资管理", desc: "库存台账与领用记录", url: "/pages/materials/inventory/index" },
      { icon: "✅", title: "执行清单", desc: "会前中后标准化流程", url: "/pages/checklist/list/index" },
      { icon: "📊", title: "数据报表", desc: "使用率效率收入统计", url: "/pages/report/index/index" },
    ]
  },
  onNavigate(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({ url: url });
  }
});
