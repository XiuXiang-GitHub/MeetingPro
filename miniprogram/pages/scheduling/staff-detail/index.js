// 员工详情/编辑
Page({
  data: {
    isEdit: false,
    form: { name: "", phone: "", role: "服务员", skills: [], status: "在职" },
    roles: ["领班", "服务员", "布台工", "保洁"],
    statuses: ["在职", "休假", "借调中"],
    skillInput: "",
  },
  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true });
      this.loadStaff(options.id);
    }
  },
  async loadStaff(id) {
    // 简化：通过 staff.staffList 获取（实际应有个 staff.get）
    const res = await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "staff.staffList" } });
    const staff = (res.result?.data || []).find(s => s._id === id);
    if (staff) this.setData({ form: { ...this.data.form, ...staff } });
  },
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },
  onRoleSelect(e) {
    this.setData({ "form.role": e.currentTarget.dataset.value });
  },
  onStatusSelect(e) {
    this.setData({ "form.status": e.currentTarget.dataset.value });
  },
  onSkillInput(e) { this.setData({ skillInput: e.detail.value }); },
  onAddSkill() {
    if (!this.data.skillInput) return;
    const skills = [...this.data.form.skills, this.data.skillInput];
    this.setData({ "form.skills": skills, skillInput: "" });
  },
  onRemoveSkill(e) {
    const idx = e.currentTarget.dataset.idx;
    const skills = this.data.form.skills.filter((_, i) => i !== idx);
    this.setData({ "form.skills": skills });
  },
  async onDelete() {
    var that = this;
    wx.showModal({
      title: "确认删除",
      content: '将删除员工"' + this.data.form.name + '"及其所有排班记录',
      success: function (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "meetingFunctions",
            data: { action: "staff.staffDelete", data: { _id: that.data.form._id } },
            success: function () {
              wx.showToast({ title: "已删除", icon: "success" });
              setTimeout(function () { wx.navigateBack(); }, 1000);
            },
          });
        }
      },
    });
  },
  async onSave() {
    if (!this.data.form.name || !this.data.form.phone) {
      wx.showToast({ title: "姓名和电话必填", icon: "none" });
      return;
    }
    var action = this.data.isEdit ? "staff.staffUpdate" : "staff.staffAdd";
    try {
      var res = await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: action, data: this.data.form } });
      if (res.result && res.result.success) {
        wx.showToast({ title: "保存成功", icon: "success" });
        setTimeout(function () { wx.navigateBack(); }, 1500);
      } else {
        wx.showToast({ title: (res.result && res.result.errMsg) || "未知错误", icon: "none" });
      }
    } catch (e) {
      wx.showToast({ title: "调用失败，请检查云函数是否已部署", icon: "none" });
    }
  },
});
