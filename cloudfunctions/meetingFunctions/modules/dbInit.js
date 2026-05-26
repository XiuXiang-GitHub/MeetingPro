// 数据库集合初始化
exports.init = async (data, { db }) => {
  const collections = [
    "rooms",
    "layouts",
    "staff",
    "dispatches",
    "bookings",
    "materials",
    "material_logs",
    "checklists",
    "checklist_items",
    "revenues",
  ];

  const results = [];
  for (const name of collections) {
    try {
      await db.createCollection(name);
      results.push({ name, status: "created" });
    } catch (e) {
      results.push({ name, status: "exists" });
    }
  }

  return { success: true, data: results };
};
