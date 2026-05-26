// 清单详情 — 勾选交互
Page({
  data: { checklist: null, items: [], loading: true, stages: ["pre", "during", "post"], stageLabels: { pre: "会前准备", during: "会中保障", post: "会后收尾" }, showIssues: false, issueItems: [], doneCount: 0, donePercent: 0 },
  onLoad(options) {
    this.loadDetail(options.id);
  },
  async loadDetail(id) {
    this.setData({ loading: true });
    try {
      const [checklistRes, itemsRes] = await Promise.all([
        wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "checklist.list" } }),
        new Promise((resolve) => {
          // In real app, query checklist_items by checklistId
          // Here we simulate with issues query
          wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "checklist.issues" } }).then(resolve);
        }),
      ]);
      const checklist = (checklistRes.result?.data || []).find(c => c._id === id);
      // Simulate items from the created checklist — in real app, query checklist_items where checklistId
      const stageOrder = { pre: 0, during: 1, post: 2 };
      const items = await this.loadItems(id);
      items.sort((a, b) => stageOrder[a.stage] - stageOrder[b.stage]);
      const doneCount = items.filter(function (i) { return i.status === "done"; }).length;
      const donePercent = items.length > 0 ? Math.round(doneCount / items.length * 100) : 0;
      this.setData({ checklist, items, loading: false, issueItems: items.filter(function (i) { return i.hasIssue; }), doneCount, donePercent });
    } catch (e) { this.setData({ loading: false }); }
  },
  async loadItems(checklistId) {
    return [];
  },
  computeProgress() {
    var items = this.data.items;
    var doneCount = items.filter(function (i) { return i.status === "done"; }).length;
    var donePercent = items.length > 0 ? Math.round(doneCount / items.length * 100) : 0;
    this.setData({ doneCount: doneCount, donePercent: donePercent });
  },
  async onToggle(e) {
    const item = e.currentTarget.dataset.item;
    const newStatus = item.status === "done" ? "pending" : "done";
    const items = this.data.items.map(function (i) { return i._id === item._id ? Object.assign({}, i, { status: newStatus }) : i; });
    this.setData({ items: items });
    this.computeProgress();
    await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "checklist.updateItem", data: { _id: item._id, status: newStatus } } });
  },
  onMarkIssue(e) {
    var self = this;
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: "标记问题",
      editable: true,
      placeholderText: "描述问题...",
      success: async function (res) {
        if (res.confirm) {
          const items = self.data.items.map(function (i) { return i._id === item._id ? Object.assign({}, i, { hasIssue: true, issueDesc: res.content || "" }) : i; });
          var issueItems = items.filter(function (i) { return i.hasIssue; });
          self.setData({ items: items, issueItems: issueItems });
          self.computeProgress();
          await wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "checklist.updateItem", data: { _id: item._id, hasIssue: true, issueDesc: res.content || "" } } });
        }
      },
    });
  },
  toggleIssues() { this.setData({ showIssues: !this.data.showIssues }); },
});
