// 数据报表
Page({
  data: { roomUsage: [], staffEfficiency: [], revenue: { records: [], total: 0 }, activeTab: "room", month: "2026-05", loading: true },
  onShow() { this.loadReports(); },
  async loadReports() {
    this.setData({ loading: true });
    try {
      const [roomRes, staffRes, revenueRes] = await Promise.all([
        wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "report.roomUsage", data: { month: this.data.month } } }),
        wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "report.staffEfficiency", data: { month: this.data.month } } }),
        wx.cloud.callFunction({ name: "meetingFunctions", data: { action: "report.revenue", data: { month: this.data.month } } }),
      ]);
      this.setData({
        roomUsage: roomRes.result?.data || [],
        staffEfficiency: staffRes.result?.data || [],
        revenue: revenueRes.result?.data || { records: [], total: 0 },
        loading: false,
      });
      if (this.data.roomUsage.length > 0) this.drawChart();
    } catch (e) { this.setData({ loading: false }); }
  },
  drawChart() {
    const query = wx.createSelectorQuery();
    query.select("#usageChart").fields({ node: true, size: true }).exec((res) => {
      if (!res[0] || !res[0].node) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext("2d");
      const dpr = wx.getSystemInfoSync().pixelRatio;
      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      ctx.scale(dpr, dpr);
      const w = res[0].width; const h = res[0].height;
      const data = this.data.roomUsage;
      const maxVal = Math.max(...data.map(d => d.usedDays), 1);
      const barW = (w - 80) / data.length - 20;
      ctx.clearRect(0, 0, w, h);
      data.forEach((d, i) => {
        const barH = (d.usedDays / maxVal) * (h - 60);
        const x = 60 + i * (barW + 20);
        ctx.fillStyle = "#8C9E7A";
        ctx.fillRect(x, h - 40 - barH, barW, barH);
        ctx.fillStyle = "#2C3328";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(d.name, x + barW / 2, h - 10);
        ctx.fillText(d.usedDays + "天", x + barW / 2, h - 40 - barH - 10);
      });
    });
  },
  onTab(e) { this.setData({ activeTab: e.currentTarget.dataset.tab }); },
  async onExport() {
    const { roomUsage, staffEfficiency, revenue } = this.data;
    const text = `【${this.data.month} 月度报表】\n\n场地使用:\n${roomUsage.map(r => `${r.name}: ${r.usedDays}天`).join("\n")}\n\n人员效率:\n${staffEfficiency.map(s => `${s.name}: ${s.sessions}场 ${s.workDays}天`).join("\n")}\n\n月度收入: ¥${revenue.total}`;
    wx.setClipboardData({ data: text, success: () => wx.showToast({ title: "已复制到剪贴板" }) });
  },
});
