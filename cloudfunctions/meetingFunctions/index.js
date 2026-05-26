const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const modules = {
  dbInit: require("./modules/dbInit"),
  rooms: require("./modules/rooms"),
  layout: require("./modules/layout"),
  staff: require("./modules/staff"),
  booking: require("./modules/booking"),
  material: require("./modules/material"),
  checklist: require("./modules/checklist"),
  report: require("./modules/report"),
};

var inited = false;

exports.main = async (event, context) => {
  // 仅首次冷启动时初始化数据库集合（后续预热调用跳过）
  if (!inited) {
    inited = true;
    try {
      await db.collection("_init").doc("init").get();
    } catch (e) {
      try { await modules.dbInit.init({}, { db, _, cloud }); } catch (e2) {}
      try { await db.collection("_init").add({ data: { _id: "init", done: true } }); } catch (e3) {}
    }
  }

  const { action, data } = event;
  var parts = (action || "").split(".");
  var module = parts[0];
  var method = parts[1];

  if (!modules[module] || !modules[module][method]) {
    return { success: false, errMsg: "Unknown action: " + action };
  }

  try {
    return await modules[module][method](data, { db, _, cloud });
  } catch (e) {
    return { success: false, errMsg: e.message || e };
  }
};
