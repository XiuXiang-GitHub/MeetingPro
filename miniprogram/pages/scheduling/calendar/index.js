// 排班周历
Page({
  data: {
    currentWeekStart: "",
    days: [],
    roomDays: [],
    loading: true,
  },
  onShow() {
    this.initWeek();
    this.loadData();
  },
  initWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
        label: ["一", "二", "三", "四", "五", "六", "日"][i],
        day: d.getDate(),
        isToday: d.toDateString() === now.toDateString(),
      });
    }
    this.setData({ currentWeekStart: days[0].dateStr, days });
  },
  async loadData() {
    this.setData({ loading: true });
    try {
      var days = this.data.days;
      const [staffRes, dispatchRes] = await Promise.all([
        wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "staff.staffList" } }),
        wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "staff.dispatchList", data: { startDate: days[0].dateStr, endDate: days[6].dateStr } } }),
      ]);
      var dispatches = dispatchRes.result && dispatchRes.result.data || [];
      var staffLookup = {};
      var staffStatus = {};
      (staffRes.result && staffRes.result.data || []).forEach(function (s) {
        staffLookup[s._id] = s.name;
        staffStatus[s._id] = s.status || "在职";
      });

      // 预计算：每个场地每天的员工列表，跳过休假员工
      var dispatchMap = {};
      dispatches.forEach(function (d) {
        if (staffStatus[d.staffId] === "休假") return;
        var key = d.roomId + "|" + d.date;
        if (!dispatchMap[key]) dispatchMap[key] = [];
        dispatchMap[key].push({ _id: d._id, name: staffLookup[d.staffId] || "已离职", type: d.type });
      });

      var roomList = [{ _id: "main", name: "主会场" }, { _id: "vip", name: "贵宾厅" }];
      var roomDays = [];
      roomList.forEach(function (room) {
        var dayCells = [];
        days.forEach(function (day) {
          var key = room._id + "|" + day.dateStr;
          dayCells.push({
            dateStr: day.dateStr,
            day: day.day,
            isToday: day.isToday,
            staff: dispatchMap[key] || [],
          });
        });
        roomDays.push({ _id: room._id, name: room.name, dayCells: dayCells });
      });

      this.setData({ roomDays: roomDays, loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },
  onAddDispatch() {
    wx.navigateTo({ url: "/pages/scheduling/staff-list/index?mode=dispatch&dispatchType=add" });
  },
  onDeleteDispatch(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    wx.showModal({
      title: "删除排班",
      content: "将删除 " + name + " 的排班记录",
      success: function (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "meetingFunctions",
            data: { action: "staff.deleteDispatch", data: { _id: id } },
            success: function () {
              wx.showToast({ title: "已删除", icon: "success" });
              that.loadData();
            },
          });
        }
      },
    });
  },
  onBorrow() {
    wx.navigateTo({ url: "/pages/scheduling/staff-list/index?mode=dispatch&dispatchType=borrow" });
  },
  onShowStaff() {
    wx.navigateTo({ url: "/pages/scheduling/staff-list/index" });
  },
  weekNav(e) {
    const dir = e.currentTarget.dataset.dir;
    const d = new Date(this.data.currentWeekStart);
    d.setDate(d.getDate() + (dir === "next" ? 7 : -7));
    const days = this.data.days.map((day, i) => {
      const nd = new Date(d);
      nd.setDate(d.getDate() + i);
      return { ...day, dateStr: `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, "0")}-${String(nd.getDate()).padStart(2, "0")}`, day: nd.getDate() };
    });
    this.setData({ currentWeekStart: days[0].dateStr, days }, () => this.loadData());
  },
});
