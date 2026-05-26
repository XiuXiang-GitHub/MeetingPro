// 会议档期月历
Page({
  data: {
    year: 2026, month: 5,
    grid: [],
    selectedDate: "",
    bookingsOnDate: [],
    roomStatus: {},
    loading: true,
  },
  onShow() { this.renderCalendar(); },
  async renderCalendar() {
    var year = this.data.year;
    var month = this.data.month;
    var daysInMonth = new Date(year, month, 0).getDate();
    var firstDay = new Date(year, month - 1, 1).getDay() || 7;
    var grid = [];

    for (var i = 1; i < firstDay; i++) grid.push({ day: 0 });
    for (var d = 1; d <= daysInMonth; d++) {
      var mStr = month < 10 ? "0" + month : "" + month;
      var dStr = d < 10 ? "0" + d : "" + d;
      grid.push({ day: d, dateStr: year + "-" + mStr + "-" + dStr, status: "free" });
    }

    this.setData({ grid: grid, loading: true });
    try {
      var mStr2 = month < 10 ? "0" + month : "" + month;
      var endDStr = daysInMonth < 10 ? "0" + daysInMonth : "" + daysInMonth;
      var startDate = year + "-" + mStr2 + "-01";
      var endDate = year + "-" + mStr2 + "-" + endDStr;
      var res = await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "booking.list", data: { startDate: startDate, endDate: endDate } } });

      var bookings = (res.result && res.result.data) || [];
      var roomStatus = {};
      bookings.forEach(function (b) {
        var key = b.date;
        if (!roomStatus[key]) roomStatus[key] = { count: 0, total: 2 };
        roomStatus[key].count++;
        roomStatus[key].status = roomStatus[key].count >= roomStatus[key].total ? "full" : "partial";
      });

      var newGrid = grid.map(function (g) {
        if (!g.dateStr || !roomStatus[g.dateStr]) return g;
        g.status = roomStatus[g.dateStr].status;
        return g;
      });

      var selDate = this.data.selectedDate;
      var bookingsOnDate = [];
      if (selDate) {
        bookingsOnDate = bookings.filter(function (b) { return b.date === selDate; });
      }
      this.setData({ grid: newGrid, roomStatus: roomStatus, bookings: bookings, bookingsOnDate: bookingsOnDate, loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },
  onSelectDate(e) {
    var dateStr = e.currentTarget.dataset.dateStr;
    if (!dateStr) return;
    var bookingsOnDate = (this.data.bookings || []).filter(function (b) { return b.date === dateStr; });
    this.setData({ selectedDate: dateStr, bookingsOnDate: bookingsOnDate });
  },
  onDeleteBooking(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var title = e.currentTarget.dataset.title;
    wx.showModal({
      title: "删除会议",
      content: '将删除会议"' + title + '"',
      success: function (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "meetingFunctions",
            data: { action: "booking.delete", data: { _id: id } },
            success: function () {
              wx.showToast({ title: "已删除", icon: "success" });
              that.setData({ selectedDate: "", bookingsOnDate: [] });
              that.renderCalendar();
            },
          });
        }
      },
    });
  },
  monthNav(e) {
    var dir = e.currentTarget.dataset.dir;
    var year = this.data.year;
    var month = this.data.month;
    month += dir === "next" ? 1 : -1;
    if (month < 1) { month = 12; year--; }
    if (month > 12) { month = 1; year++; }
    this.setData({ year: year, month: month }, function () { this.renderCalendar(); }.bind(this));
  },
  onAddBooking() {
    wx.navigateTo({ url: "/pages/schedule/booking/index" });
  },
});
