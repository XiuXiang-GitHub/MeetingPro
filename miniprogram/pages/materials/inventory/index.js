// 物资库存台账
Page({
  data: {
    list: [], loading: true, keyword: "",
    showLend: false, showReturn: false, currentItem: null,
    lendForm: { qty: 0, person: "", bookingId: "" },
    returnForm: { qty: 0, person: "" },
    bookingList: [], bookingIndex: 0,
  },
  onShow() { this.loadList(); },
  async loadList() {
    this.setData({ loading: true });
    try {
      var res = await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "material.list", data: { keyword: this.data.keyword || void 0 } } });
      this.setData({ list: res.result && res.result.data || [], loading: false });
    } catch (e) { this.setData({ loading: false }); }
  },
  onSearch(e) { this.setData({ keyword: e.detail.value }); },
  onSearchConfirm() { this.loadList(); },
  async onLend(e) {
    var item = e.currentTarget.dataset.item;
    try {
      var res = await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "booking.list" } });
      var bookings = (res.result && res.result.data) || [];
      this.setData({
        showLend: true, currentItem: item,
        lendForm: { qty: 0, person: "", bookingId: bookings[0] ? bookings[0]._id : "" },
        bookingList: bookings, bookingIndex: 0,
      });
    } catch (e) {
      this.setData({ showLend: true, currentItem: item, lendForm: { qty: 0, person: "", bookingId: "" }, bookingList: [], bookingIndex: 0 });
    }
  },
  onReturn(e) { this.setData({ showReturn: true, currentItem: e.currentTarget.dataset.item, returnForm: { qty: 0, person: "" } }); },
  onLendInput(e) { var f = e.currentTarget.dataset.field; this.setData({ ["lendForm." + f]: e.detail.value }); },
  onReturnInput(e) { var f = e.currentTarget.dataset.field; this.setData({ ["returnForm." + f]: e.detail.value }); },
  onBookingSelect(e) {
    var idx = e.detail.value;
    var list = this.data.bookingList;
    this.setData({ bookingIndex: idx, "lendForm.bookingId": list[idx] ? list[idx]._id : "" });
  },
  async submitLend() {
    var form = this.data.lendForm;
    if (!form.qty || !form.person) { wx.showToast({ title: "请填写完整", icon: "none" }); return; }
    try {
      await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "material.logLend", data: { materialId: this.data.currentItem._id, qty: Number(form.qty), person: form.person, bookingId: form.bookingId } } });
      wx.showToast({ title: "领用成功", icon: "success" });
      this.setData({ showLend: false });
      this.loadList();
    } catch (e) { wx.showToast({ title: "操作失败", icon: "none" }); }
  },
  async submitReturn() {
    var form = this.data.returnForm;
    if (!form.qty || !form.person) { wx.showToast({ title: "请填写完整", icon: "none" }); return; }
    try {
      await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "material.logReturn", data: { materialId: this.data.currentItem._id, qty: Number(form.qty), person: form.person } } });
      wx.showToast({ title: "归还成功", icon: "success" });
      this.setData({ showReturn: false });
      this.loadList();
    } catch (e) { wx.showToast({ title: "操作失败", icon: "none" }); }
  },
  onRecords() { wx.navigateTo({ url: "/pages/materials/records/index" }); },
  onCloseLend() { this.setData({ showLend: false }); },
  onCloseReturn() { this.setData({ showReturn: false }); },
});
