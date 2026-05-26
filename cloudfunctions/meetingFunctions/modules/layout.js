// 摆台方案模块
exports.save = async (data, { db }) => {
  const { name, template, furniture, snapshot, roomId } = data;
  const doc = {
    name: name || "未命名方案",
    template: template || "custom",
    furniture: furniture || [],
    snapshot: snapshot || "",
    roomId: roomId || "",
    createTime: db.serverDate(),
    updateTime: db.serverDate(),
  };
  const result = await db.collection("layouts").add({ data: doc });
  return { success: true, data: { _id: result._id, ...doc } };
};

exports.list = async (data, { db }) => {
  const { skip = 0, limit = 20, roomId } = data || {};
  const query = {};
  if (roomId) query.roomId = roomId;
  const result = await db
    .collection("layouts")
    .where(query)
    .orderBy("createTime", "desc")
    .skip(skip)
    .limit(limit)
    .get();
  return { success: true, data: result.data };
};

exports.get = async (data, { db }) => {
  const { _id } = data;
  const result = await db.collection("layouts").doc(_id).get();
  return { success: true, data: result.data };
};

exports.delete = async (data, { db }) => {
  const { _id } = data;
  await db.collection("layouts").doc(_id).remove();
  return { success: true };
};
