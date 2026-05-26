// 数据库集合初始化（并行创建）
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

  const results = await Promise.all(collections.map(async function (name) {
    try {
      await db.createCollection(name);
      return { name, status: "created" };
    } catch (e) {
      return { name, status: "exists" };
    }
  }));

  return { success: true, data: results };
};
