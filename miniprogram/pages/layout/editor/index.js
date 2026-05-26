// 摆台编辑器 — 核心页面
var { FURNITURE_TYPES, FURNITURE_GROUPS, createFurniture, snapToGrid, checkSpacing, calcStats } = require("../../../utils/furniture");
var { TEMPLATES } = require("../../../utils/templates");
var { summarizeMaterials } = require("../../../utils/materials-config");

// 预计算家具库数据
var flatGroups = FURNITURE_GROUPS.map(function (group) {
  return {
    label: group.label,
    items: group.items.map(function (typeKey) {
      var def = FURNITURE_TYPES[typeKey];
      return {
        key: typeKey,
        name: def.name,
        color: def.color,
        borderRadius: def.borderRadius || "4rpx",
        previewW: def.w / 3,
        previewH: def.h / 3,
      };
    }),
  };
});

Page({
  data: {
    furnitureList: [],
    selectedId: "",
    showLibrary: true,
    showMaterialModal: false,
    materialList: [],
    spacingWarnings: [],
    stats: { totalSeats: 0, totalItems: 0 },
    layoutName: "未命名方案",
    canvasWidth: 750,
    canvasHeight: 1000,
    flatGroups: flatGroups,
    templateOptions: [
      { key: "theatre", name: "剧场式" },
      { key: "ushape", name: "U型" },
      { key: "classroom", name: "课桌式" },
      { key: "roundtable", name: "圆桌式" },
    ],
    selectedInfo: "",
    typeCounts: {},
    hasUndo: false,
    isEmpty: true,
  },

  _dragState: {},
  _undoState: null,

  onLoad(options) {
    var sys = wx.getSystemInfoSync();
    var w = 750;
    var h = Math.floor(sys.windowHeight * (750 / sys.windowWidth));
    this.setData({ canvasWidth: w, canvasHeight: h });
  },

  onShow() {
    var loadId = wx.getStorageSync("loadLayoutId");
    if (loadId) {
      wx.removeStorageSync("loadLayoutId");
      this.loadLayout(loadId);
    }
  },

  async loadLayout(id) {
    wx.showLoading({ title: "加载中..." });
    try {
      var res = await wx.cloud.callFunction({
        name: "meetingFunctions",
        data: { action: "layout.get", data: { _id: id } },
      });
      wx.hideLoading();
      if (res.result && res.result.success) {
        var layout = res.result.data;
        this.setData({
          furnitureList: layout.furniture || [],
          layoutName: layout.name || "未命名方案",
          isEmpty: !layout.furniture || layout.furniture.length === 0,
        });
        this.refreshStats();
        wx.showToast({ title: "方案已加载", icon: "success" });
      } else {
        wx.showToast({ title: "加载失败", icon: "none" });
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: "加载失败", icon: "none" });
    }
  },

  // 保存当前状态用于撤销
  _saveUndo() {
    this._undoState = this.data.furnitureList.slice();
    this.setData({ hasUndo: true });
  },

  // === 家具库操作 ===
  onSelectFurniture(e) {
    this._saveUndo();
    var type = e.currentTarget.dataset.type;
    var typeDef = FURNITURE_TYPES[type];
    var cx = snapToGrid((this.data.canvasWidth - typeDef.w) / 2);
    var cy = snapToGrid((this.data.canvasHeight - typeDef.h) / 2);
    var item = createFurniture(type, cx, cy);
    if (!item) return;

    var furnitureList = this.data.furnitureList.concat(item);
    this.setData({ furnitureList: furnitureList, selectedId: item.id, isEmpty: false, showLibrary: false });
    this.refreshStats();
  },

  // === 模板操作 ===
  onSelectTemplate(e) {
    var key = e.currentTarget.dataset.key;
    var tpl = TEMPLATES[key];
    if (!tpl) return;
    var that = this;

    wx.showModal({
      title: "加载模板：" + tpl.name,
      content: "将清空当前画布并加载模板布局，继续？",
      success: function (res) {
        if (res.confirm) {
          that._saveUndo();
          var furnitureList = tpl.furniture.map(function (f, i) {
            return createFurniture(f.type, f.x, f.y, key + "_" + i);
          });
          that.setData({ furnitureList: furnitureList, selectedId: "", isEmpty: furnitureList.length === 0 });
          that.refreshStats();
        }
      },
    });
  },

  // === 家具选中 & 拖拽 ===
  onSelectItem(e) {
    var id = e.currentTarget.dataset.id;
    var item = this.data.furnitureList.find(function (f) { return f.id === id; });
    var info = item ? item.name + "  (" + item.x + ", " + item.y + ")" : "";
    this.setData({ selectedId: id, selectedInfo: info });
  },

  onChange(e) {
    var id = e.currentTarget.dataset.id;
    this._dragState[id] = { x: e.detail.x, y: e.detail.y };
  },

  onTouchEnd(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var pos = this._dragState[id];
    if (pos) {
      var snappedX = snapToGrid(pos.x);
      var snappedY = snapToGrid(pos.y);
      this._saveUndo();
      var furnitureList = this.data.furnitureList.map(function (f) {
        if (f.id === id) {
          return { ...f, x: snappedX, y: snappedY };
        }
        return f;
      });
      this.setData({ furnitureList: furnitureList, selectedInfo: "拖放到 (" + snappedX + ", " + snappedY + ")" });
      delete this._dragState[id];
    }
    this.refreshStats();
  },

  // === 撤销 ===
  onUndo() {
    if (!this._undoState || this._undoState.length === 0) {
      wx.showToast({ title: "没有可撤销的操作", icon: "none" });
      return;
    }
    var prev = this._undoState;
    this._undoState = null;
    this.setData({ furnitureList: prev, selectedId: "", hasUndo: false, isEmpty: prev.length === 0, selectedInfo: "" });
    this.refreshStats();
  },

  // === 旋转 ===
  onRotate() {
    if (!this.data.selectedId) return;
    this._saveUndo();
    var furnitureList = this.data.furnitureList.map(function (f) {
      if (f.id === this.data.selectedId) {
        return { ...f, rotation: (f.rotation + 90) % 360 };
      }
      return f;
    }, this);
    this.setData({ furnitureList: furnitureList });
    this.refreshStats();
  },

  // === 复制 ===
  onCopy() {
    if (!this.data.selectedId) return;
    this._saveUndo();
    var target = this.data.furnitureList.find(function (f) { return f.id === this.data.selectedId; }, this);
    if (!target) return;
    var copy = createFurniture(target.type, target.x + 40, target.y + 40);
    if (!copy) return;
    copy.rotation = target.rotation;
    var furnitureList = this.data.furnitureList.concat(copy);
    this.setData({ furnitureList: furnitureList, selectedId: copy.id, isEmpty: false });
    this.refreshStats();
  },

  // === 删除 ===
  onDelete() {
    if (!this.data.selectedId) return;
    var that = this;
    wx.showModal({
      title: "确认删除",
      content: "将删除此家具",
      success: function (res) {
        if (res.confirm) {
          that._saveUndo();
          var furnitureList = that.data.furnitureList.filter(function (f) { return f.id !== that.data.selectedId; });
          that.setData({ furnitureList: furnitureList, selectedId: "", selectedInfo: "", isEmpty: furnitureList.length === 0 });
          that.refreshStats();
        }
      },
    });
  },

  // === 清空画布 ===
  onClear() {
    var that = this;
    wx.showModal({
      title: "确认清空",
      content: "将清空画布上所有家具",
      success: function (res) {
        if (res.confirm) {
          that._saveUndo();
          that.setData({ furnitureList: [], selectedId: "", selectedInfo: "", isEmpty: true });
          that.refreshStats();
        }
      },
    });
  },

  // === 更新统计、间距、家具计数 ===
  refreshStats() {
    var stats = calcStats(this.data.furnitureList);
    var spacingWarnings = checkSpacing(this.data.furnitureList);
    var typeCounts = {};
    this.data.furnitureList.forEach(function (f) {
      typeCounts[f.type] = (typeCounts[f.type] || 0) + 1;
    });
    this.setData({ stats: stats, spacingWarnings: spacingWarnings, typeCounts: typeCounts });
  },
  updateStats() { this.refreshStats(); },

  // === 物料清单 ===
  onMaterialChecklist() {
    var summary = summarizeMaterials(this.data.furnitureList);
    var list = [];
    for (var name in summary) {
      list.push({ name: name, qty: summary[name] });
    }
    this.setData({ showMaterialModal: true, materialList: list });
  },
  onCloseMaterial() {
    this.setData({ showMaterialModal: false });
  },

  // === 保存方案 ===
  async onSave() {
    wx.showLoading({ title: "保存中..." });
    try {
      var res = await wx.cloud.callFunction({
        name: "meetingFunctions",
        data: {
          action: "layout.save",
          data: {
            name: this.data.layoutName,
            furniture: this.data.furnitureList,
          },
        },
      });
      wx.hideLoading();
      if (res.result.success) {
        wx.showToast({ title: "保存成功", icon: "success" });
      } else {
        wx.showToast({ title: "保存失败", icon: "none" });
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: "网络错误", icon: "none" });
    }
  },

  onHistory() { wx.navigateTo({ url: "/pages/layout/history/index" }); },
  onNew() {
    var that = this;
    if (this.data.furnitureList.length === 0) return;
    wx.showModal({
      title: "新建方案",
      content: "将清空当前画布，继续？",
      success: function (res) {
        if (res.confirm) {
          that._saveUndo();
          that.setData({ furnitureList: [], selectedId: "", selectedInfo: "", isEmpty: true, layoutName: "未命名方案" });
          that.refreshStats();
        }
      },
    });
  },
  onToggleLibrary() { this.setData({ showLibrary: !this.data.showLibrary }); },
  onNameInput(e) { this.setData({ layoutName: e.detail.value }); },
});
