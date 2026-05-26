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
  const { name, unit, stock, minStock } = data;
  const doc = {
    name: name || "",
    unit: unit || "个",
    stock: stock || 0,
    minStock: minStock || 5,
    createTime: db.serverDate(),
  };
  const result = await db.collection("materials").add({ data: doc });
  return { success: true, data: { _id: result._id, ...doc } };
};

exports.update = async (data, { db }) => {
  const { _id, name, unit, stock, minStock } = data;
  const updateData = { updateTime: db.serverDate() };
  if (name !== undefined) updateData.name = name;
  if (unit !== undefined) updateData.unit = unit;
  if (stock !== undefined) updateData.stock = stock;
  if (minStock !== undefined) updateData.minStock = minStock;
  await db.collection("materials").doc(_id).update({ data: updateData });
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
