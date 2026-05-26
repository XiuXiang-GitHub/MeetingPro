// 首页仪表盘
Page({
  data: {
    currentDate: "",
    todayBookings: [],
    urgentBookings: [],
    todayDispatches: [],
    lowStockItems: [],
    pendingChecklistCount: 0,
    monthlyRevenue: 0,
    loading: true,
  },
  onShow() {
    this.loadDashboard();
  },
  getToday() {
    var d = new Date();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : "" + m) + "-" + (day < 10 ? "0" + day : "" + day);
  },
  formatDateLabel() {
    var d = new Date();
    var weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    var m = d.getMonth() + 1;
    var day = d.getDate();
    var w = weekdays[d.getDay()];
    return m + "月" + day + "日 星期" + w;
  },
  async loadDashboard() {
    var today = this.getToday();
    this.setData({ currentDate: this.formatDateLabel() });
    try {
      var res = await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "report.dashboard", data: { today: today } } });
      var d = (res.result && res.result.data) || {};

      var allBookings = d.todayBookings || [];
      var now = new Date();
      var urgent = [];
      for (var i = 0; i < allBookings.length; i++) {
        var b = allBookings[i];
        var ts = b.timeSlot || "00:00";
        var parts = ts.split(":");
        var h = Number(parts[0]);
        var meetingTime = new Date(b.date);
        meetingTime.setHours(h, 0, 0, 0);
        var diffMs = meetingTime - now;
        if (diffMs > 0 && diffMs < 2 * 60 * 60 * 1000) {
          urgent.push(b);
        }
      }

      this.setData({
        todayBookings: allBookings,
        urgentBookings: urgent,
        todayDispatches: d.todayDispatches || [],
        lowStockItems: d.lowStockItems || [],
        monthlyRevenue: d.monthlyRevenue || 0,
        loading: false,
      });
    } catch (e) {
      this.setData({ loading: false });
    }
  },
  goTo(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({ url: url });
  },
  switchTab(e) {
    wx.switchTab({ url: e.currentTarget.dataset.url });
  },
});
