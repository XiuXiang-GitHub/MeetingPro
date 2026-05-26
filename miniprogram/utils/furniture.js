// 家具类型定义 — 精密图纸摆台编辑器

const FURNITURE_TYPES = {
  round_8: {
    name: "圆桌(8座)",
    seats: 8,
    w: 160,
    h: 160,
    color: "#c8ddf0",
    borderRadius: "50%",
    icon: "⭕",
  },
  round_10: {
    name: "圆桌(10座)",
    seats: 10,
    w: 200,
    h: 200,
    color: "#c8ddf0",
    borderRadius: "50%",
    icon: "⭕",
  },
  long: {
    name: "长条桌",
    seats: 6,
    w: 240,
    h: 80,
    color: "#d4e0ed",
    borderRadius: "4rpx",
    icon: "▬",
  },
  square: {
    name: "方桌",
    seats: 4,
    w: 120,
    h: 120,
    color: "#d4e0ed",
    borderRadius: "4rpx",
    icon: "◼",
  },
  desk: {
    name: "课桌",
    seats: 2,
    w: 100,
    h: 60,
    color: "#d4e0ed",
    borderRadius: "4rpx",
    icon: "▭",
  },
  podium: {
    name: "讲台",
    seats: 0,
    w: 100,
    h: 60,
    color: "#f0e4c8",
    borderRadius: "4rpx",
    icon: "🎤",
  },
  screen: {
    name: "投影屏",
    seats: 0,
    w: 120,
    h: 20,
    color: "#d8dce3",
    borderRadius: "2rpx",
    icon: "📺",
  },
  signin: {
    name: "签到台",
    seats: 0,
    w: 120,
    h: 60,
    color: "#e8dcc8",
    borderRadius: "4rpx",
    icon: "📋",
  },
  chair: {
    name: "单椅",
    seats: 1,
    w: 40,
    h: 40,
    color: "#e2eaf2",
    borderRadius: "50%",
    icon: "🪑",
  },
};

// 家具库分组（用于左侧面板）
const FURNITURE_GROUPS = [
  {
    label: "桌椅",
    items: ["round_8", "round_10", "long", "square", "desk", "chair"],
  },
  {
    label: "台类",
    items: ["podium", "signin"],
  },
  {
    label: "设备",
    items: ["screen"],
  },
];

// 生成新家具实例
function createFurniture(type, x, y, id) {
  const def = FURNITURE_TYPES[type];
  if (!def) return null;
  return {
    id: id || `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type,
    name: def.name,
    w: def.w,
    h: def.h,
    x,
    y,
    rotation: 0, // 0 | 90 | 180 | 270
    color: def.color,
    borderRadius: def.borderRadius || "4rpx",
    seats: def.seats,
  };
}

// 吸附到网格 (20rpx)
function snapToGrid(value) {
  return Math.round(value / 20) * 20;
}

// 计算两家具中心距离
function distanceBetween(a, b) {
  const ax = a.x + a.w / 2;
  const ay = a.y + a.h / 2;
  const bx = b.x + b.w / 2;
  const by = b.y + b.h / 2;
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

// 检测所有家具之间的最小间距
function checkSpacing(furnitureList) {
  const warnings = [];
  for (let i = 0; i < furnitureList.length; i++) {
    for (let j = i + 1; j < furnitureList.length; j++) {
      const dist = distanceBetween(furnitureList[i], furnitureList[j]);
      if (dist < 60) {
        warnings.push({
          a: furnitureList[i].id,
          b: furnitureList[j].id,
          distance: Math.round(dist),
        });
      }
    }
  }
  return warnings;
}

// 统计座位数和家具数
function calcStats(furnitureList) {
  return {
    totalSeats: furnitureList.reduce((sum, f) => sum + f.seats, 0),
    totalItems: furnitureList.length,
  };
}

module.exports = {
  FURNITURE_TYPES,
  FURNITURE_GROUPS,
  createFurniture,
  snapToGrid,
  distanceBetween,
  checkSpacing,
  calcStats,
};
