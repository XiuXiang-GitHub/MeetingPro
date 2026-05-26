// 场地管理模块
exports.list = async (data, { db }) => {
  const { skip = 0, limit = 20 } = data || {};
  const result = await db
    .collection("rooms")
    .orderBy("name", "asc")
    .skip(skip)
    .limit(limit)
    .get();
  return { success: true, data: result.data };
};

exports.add = async (data, { db }) => {
  const { name, capacity } = data;
  const doc = { name, capacity: capacity || 0, status: "active", createTime: db.serverDate() };
  const result = await db.collection("rooms").add({ data: doc });
  return { success: true, data: { _id: result._id, ...doc } };
};
