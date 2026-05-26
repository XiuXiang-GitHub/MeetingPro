// 摆台预设模板 — 每种模板包含预定义家具数组 [{type, x, y, rotation}]
// 坐标基于 750rpx × 1000rpx 画布

const TEMPLATES = {
  theatre: {
    name: "剧场式",
    description: "多排座位朝向讲台，适合大型会议和演讲",
    furniture: [
      // 讲台
      { type: "podium", x: 295, y: 40, rotation: 0 },
      // 投影屏
      { type: "screen", x: 295, y: 20, rotation: 0 },
      // 第一排
      { type: "desk", x: 80, y: 200, rotation: 0 },
      { type: "desk", x: 200, y: 200, rotation: 0 },
      { type: "desk", x: 320, y: 200, rotation: 0 },
      { type: "desk", x: 440, y: 200, rotation: 0 },
      { type: "desk", x: 560, y: 200, rotation: 0 },
      // 第二排
      { type: "desk", x: 80, y: 300, rotation: 0 },
      { type: "desk", x: 200, y: 300, rotation: 0 },
      { type: "desk", x: 320, y: 300, rotation: 0 },
      { type: "desk", x: 440, y: 300, rotation: 0 },
      { type: "desk", x: 560, y: 300, rotation: 0 },
      // 第三排
      { type: "desk", x: 80, y: 400, rotation: 0 },
      { type: "desk", x: 200, y: 400, rotation: 0 },
      { type: "desk", x: 320, y: 400, rotation: 0 },
      { type: "desk", x: 440, y: 400, rotation: 0 },
      { type: "desk", x: 560, y: 400, rotation: 0 },
      // 签到台
      { type: "signin", x: 560, y: 520, rotation: 0 },
    ],
  },

  ushape: {
    name: "U型",
    description: "三面长桌围合，适合研讨会和小型讨论",
    furniture: [
      { type: "podium", x: 295, y: 60, rotation: 0 },
      { type: "screen", x: 295, y: 30, rotation: 0 },
      // 左侧长条桌
      { type: "long", x: 60, y: 200, rotation: 90 },
      // 底部
      { type: "long", x: 200, y: 500, rotation: 0 },
      // 右侧长条桌
      { type: "long", x: 500, y: 200, rotation: 90 },
      // 椅子
      { type: "chair", x: 80, y: 180, rotation: 0 },
      { type: "chair", x: 80, y: 260, rotation: 0 },
      { type: "chair", x: 80, y: 340, rotation: 0 },
      { type: "chair", x: 80, y: 420, rotation: 0 },
      { type: "chair", x: 580, y: 180, rotation: 0 },
      { type: "chair", x: 580, y: 260, rotation: 0 },
      { type: "chair", x: 580, y: 340, rotation: 0 },
      { type: "chair", x: 580, y: 420, rotation: 0 },
      { type: "chair", x: 220, y: 540, rotation: 0 },
      { type: "chair", x: 300, y: 540, rotation: 0 },
      { type: "chair", x: 380, y: 540, rotation: 0 },
      { type: "chair", x: 460, y: 540, rotation: 0 },
    ],
  },

  classroom: {
    name: "课桌式",
    description: "成排布置课桌，适合培训和教学",
    furniture: [
      { type: "podium", x: 295, y: 40, rotation: 0 },
      { type: "screen", x: 295, y: 20, rotation: 0 },
      // 第一排
      { type: "desk", x: 60, y: 200, rotation: 0 },
      { type: "desk", x: 220, y: 200, rotation: 0 },
      { type: "desk", x: 380, y: 200, rotation: 0 },
      { type: "desk", x: 540, y: 200, rotation: 0 },
      // 第二排
      { type: "desk", x: 60, y: 320, rotation: 0 },
      { type: "desk", x: 220, y: 320, rotation: 0 },
      { type: "desk", x: 380, y: 320, rotation: 0 },
      { type: "desk", x: 540, y: 320, rotation: 0 },
      // 第三排
      { type: "desk", x: 60, y: 440, rotation: 0 },
      { type: "desk", x: 220, y: 440, rotation: 0 },
      { type: "desk", x: 380, y: 440, rotation: 0 },
      { type: "desk", x: 540, y: 440, rotation: 0 },
    ],
  },

  roundtable: {
    name: "圆桌式",
    description: "多张圆桌分散布置，适合宴会和分组讨论",
    furniture: [
      { type: "round_8", x: 60, y: 120, rotation: 0 },
      { type: "round_8", x: 280, y: 100, rotation: 0 },
      { type: "round_8", x: 500, y: 120, rotation: 0 },
      { type: "round_8", x: 80, y: 360, rotation: 0 },
      { type: "round_8", x: 300, y: 340, rotation: 0 },
      { type: "round_8", x: 520, y: 360, rotation: 0 },
      { type: "round_8", x: 280, y: 560, rotation: 0 },
      { type: "podium", x: 580, y: 540, rotation: 0 },
      { type: "signin", x: 60, y: 580, rotation: 0 },
    ],
  },
};

function getTemplateList() {
  return Object.entries(TEMPLATES).map(([key, tpl]) => ({
    key,
    name: tpl.name,
    description: tpl.description,
    count: tpl.furniture.length,
  }));
}

module.exports = { TEMPLATES, getTemplateList };
