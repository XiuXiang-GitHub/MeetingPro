// 排班 & 借调
Page({
  data: {
    dispatchType: "add",
    form: { staffId: "", staffName: "", roomId: "", date: "", timeSlot: "", reason: "" },
    staffList: [],
    roomList: [],
    roomIndex: 0,
    timeSlotIndex: 0,
    timeSlots: ["08:00-12:00", "13:00-17:00", "18:00-21:00", "全天"],
  },
  onLoad(options) {
    var dispatchType = options.dispatchType || "add";
    if (options.staffId) {
      this.setData({ dispatchType: dispatchType, "form.staffId": options.staffId, "form.staffName": options.staffName || "" });
    }
    var d = new Date();
    var today = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    this.setData({ "form.date": today });
    this.loadStaff();
    this.loadRooms();
  },
  async loadStaff() {
    var res = await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "staff.staffList" } });
    var allStaff = res.result && res.result.data || [];
    // 过滤掉休假员工，不能排班
    var activeStaff = allStaff.filter(function (s) { return s.status !== "休假"; });
    this.setData({ staffList: activeStaff });
  },
  async loadRooms() {
    try {
      var res = await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "booking.list" } });
      var rooms = (res.result && res.result.data) || [];
      if (rooms.length === 0) {
        rooms = [{ _id: "main", name: "主会场" }, { _id: "vip", name: "贵宾厅" }];
      }
      this.setData({ roomList: rooms, "form.roomId": rooms[0]._id, "form.timeSlot": "08:00-12:00" });
    } catch (e) {
      var defaultRooms = [{ _id: "main", name: "主会场" }, { _id: "vip", name: "贵宾厅" }];
      this.setData({ roomList: defaultRooms, "form.roomId": defaultRooms[0]._id, "form.timeSlot": "08:00-12:00" });
    }
  },
  onInput(e) { var f = e.currentTarget.dataset.field; this.setData({ ["form." + f]: e.detail.value }); },
  onStaffSelect(e) {
    var idx = e.detail.value;
    var s = this.data.staffList[idx];
    this.setData({ "form.staffId": s._id, "form.staffName": s.name });
  },
  onRoomSelect(e) {
    var idx = e.detail.value;
    var r = this.data.roomList[idx];
    this.setData({ roomIndex: idx, "form.roomId": r._id });
  },
  onDateChange(e) {
    this.setData({ "form.date": e.detail.value });
  },
  onTimeSlotSelect(e) {
    var idx = e.detail.value;
    this.setData({ timeSlotIndex: idx, "form.timeSlot": this.data.timeSlots[idx] });
  },
  async onSubmit() {
    if (!this.data.form.staffId || !this.data.form.roomId || !this.data.form.date) {
      wx.showToast({ title: "请填写完整信息", icon: "none" });
      return;
    }
    var action = this.data.dispatchType === "borrow" ? "staff.dispatchBorrow" : "staff.dispatchAdd";
    try {
      var res = await wx.cloud.callFunction({
        name: "meetingFunctions",
        data: { action: action, data: this.data.form },
      });
      if (res.result.success) {
        wx.showToast({ title: this.data.dispatchType === "borrow" ? "借调成功" : "排班成功", icon: "success" });
        setTimeout(function () { wx.navigateBack({ delta: 2 }); }, 1500);
      } else {
        wx.showToast({ title: res.result.errMsg || "提交失败", icon: "none" });
      }
    } catch (e) {
      wx.showToast({ title: "提交失败", icon: "none" });
    }
  },
});
