// 家具物料配置表 — 每件家具关联的物料清单
// key = 家具 type，value = { 物料名: 数量 }

const MATERIALS_CONFIG = {
  round_8: {
    "圆桌台面(8座)": 1,
    "桌布(圆)": 1,
    "玻璃转盘": 1,
    "椅子": 8,
    "骨碟": 8,
    "筷子架": 8,
    "红酒杯": 8,
    "水杯": 8,
    "口布": 8,
  },
  round_10: {
    "圆桌台面(10座)": 1,
    "桌布(圆)": 1,
    "玻璃转盘": 1,
    "椅子": 10,
    "骨碟": 10,
    "筷子架": 10,
    "红酒杯": 10,
    "水杯": 10,
    "口布": 10,
  },
  long: {
    "长条桌台面": 1,
    "桌布(长条)": 1,
    "椅子": 6,
    "桌牌": 6,
    "矿泉水": 6,
    "笔记本": 6,
    "铅笔": 6,
  },
  square: {
    "方桌台面": 1,
    "桌布(方)": 1,
    "椅子": 4,
  },
  desk: {
    "课桌台面": 1,
    "椅子": 2,
    "矿泉水": 2,
  },
  podium: {
    "讲台": 1,
    "麦克风": 1,
    "演讲提示屏": 1,
    "翻页笔": 1,
  },
  screen: {
    "投影幕布": 1,
    "投影仪": 1,
    "HDMI线": 1,
  },
  signin: {
    "签到桌": 1,
    "桌布(小)": 1,
    "签到簿": 1,
    "签字笔": 2,
    "桌花": 1,
  },
  chair: {
    "椅子": 1,
  },
};

// 根据家具列表汇总物料
function summarizeMaterials(furnitureList) {
  const summary = {};
  furnitureList.forEach((f) => {
    const config = MATERIALS_CONFIG[f.type];
    if (!config) return;
    Object.entries(config).forEach(([item, qty]) => {
      summary[item] = (summary[item] || 0) + qty;
    });
  });
  return summary;
}

module.exports = { MATERIALS_CONFIG, summarizeMaterials };
