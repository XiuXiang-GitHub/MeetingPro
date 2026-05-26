// 物资管理模块
exports.list = async (data, { db }) => {
  const { keyword, skip = 0, limit = 50 } = data || {};
  const query = {};
  if (keyword) {
    query.name = db.RegExp({ regexp: keyword, options: "i" });
  }
  const result = await db
    .collection("materials")
    .where(query)
    .orderBy("name", "asc")
    .skip(skip)
    .limit(limit)
    .get();
  return { success: true, data: result.data };
};

exports.add = async (data, { db }) => {
  const doc = { ...data, createTime: db.serverDate() };
  const result = await db.collection("materials").add({ data: doc });
  return { success: true, data: { _id: result._id, ...doc } };
};

exports.update = async (data, { db }) => {
  const { _id, ...rest } = data;
  rest.updateTime = db.serverDate();
  await db.collection("materials").doc(_id).update({ data: rest });
  return { success: true };
};

exports.logLend = async (data, { db }) => {
  const { materialId, qty, person, bookingId } = data;
  const material = await db.collection("materials").doc(materialId).get();
  const newStock = (material.data.stock || 0) - qty;

  await db.collection("materials").doc(materialId).update({
    data: { stock: newStock, updateTime: db.serverDate() },
  });
  const logDoc = {
    materialId,
    type: "lend",
    qty,
    person,
    bookingId: bookingId || "",
    time: db.serverDate(),
  };
  const result = await db.collection("material_logs").add({ data: logDoc });
  return { success: true, data: { _id: result._id, ...logDoc, newStock } };
};

exports.logReturn = async (data, { db }) => {
  const { materialId, qty, person } = data;
  const material = await db.collection("materials").doc(materialId).get();
  const newStock = (material.data.stock || 0) + qty;

  await db.collection("materials").doc(materialId).update({
    data: { stock: newStock, updateTime: db.serverDate() },
  });
  const logDoc = {
    materialId,
    type: "return",
    qty,
    person,
    time: db.serverDate(),
  };
  const result = await db.collection("material_logs").add({ data: logDoc });
  return { success: true, data: { _id: result._id, ...logDoc, newStock } };
};

exports.logs = async (data, { db }) => {
  const { materialId, skip = 0, limit = 50 } = data || {};
  const query = {};
  if (materialId) query.materialId = materialId;
  const result = await db
    .collection("material_logs")
    .where(query)
    .orderBy("time", "desc")
    .skip(skip)
    .limit(limit)
    .get();
  return { success: true, data: result.data };
};
