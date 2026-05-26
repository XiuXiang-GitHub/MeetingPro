// 新建/编辑预定
Page({
  data: {
    form: { roomId: "", title: "", date: "", timeSlot: "", attendees: "", company: "", contact: "" },
    roomList: [],
    roomIndex: 0,
    timeSlotIndex: 0,
    timeSlots: ["08:00-10:00", "10:00-12:00", "13:00-15:00", "15:00-17:00", "18:00-20:00", "全天"],
  },
  onLoad() {
    var d = new Date();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    var today = d.getFullYear() + "-" + (m < 10 ? "0" + m : "" + m) + "-" + (day < 10 ? "0" + day : "" + day);
    var defaultRooms = [{ _id: "main", name: "主会场" }, { _id: "vip", name: "贵宾厅" }];
    this.setData({ "form.date": today, "form.timeSlot": "08:00-10:00", roomList: defaultRooms, "form.roomId": defaultRooms[0]._id });
  },
  onInput(e) { var f = e.currentTarget.dataset.field; this.setData({ ["form." + f]: e.detail.value }); },
  onRoomSelect(e) {
    var idx = e.detail.value;
    this.setData({ roomIndex: idx, "form.roomId": this.data.roomList[idx]._id });
  },
  onDateChange(e) {
    this.setData({ "form.date": e.detail.value });
  },
  onTimeSlotSelect(e) {
    var idx = e.detail.value;
    this.setData({ timeSlotIndex: idx, "form.timeSlot": this.data.timeSlots[idx] });
  },
  async onSubmit() {
    if (!this.data.form.title || !this.data.form.date || !this.data.form.timeSlot || !this.data.form.roomId) {
      wx.showToast({ title: "请填写必填信息", icon: "none" }); return;
    }
    try {
      var f = this.data.form;
      var sendData = { roomId: f.roomId, title: f.title, date: f.date, timeSlot: f.timeSlot, attendees: Number(f.attendees) || 0, company: f.company, contact: f.contact };
      var res = await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "booking.create", data: sendData } });
      if (res.result.success) { wx.showToast({ title: "预定成功", icon: "success" }); setTimeout(function () { wx.navigateBack(); }, 1500); }
      else { wx.showToast({ title: res.result.errMsg || "时间冲突", icon: "none" }); }
    } catch (e) { wx.showToast({ title: "提交失败", icon: "none" }); }
  },
});
