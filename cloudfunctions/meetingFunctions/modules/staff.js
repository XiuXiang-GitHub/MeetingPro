// 员工档案 & 排班模块

// --- 员工 ---
exports.staffList = async (data, { db }) => {
  const { skip = 0, limit = 50, role, status } = data || {};
  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  const result = await db
    .collection("staff")
    .where(query)
    .orderBy("name", "asc")
    .skip(skip)
    .limit(limit)
    .get();
  return { success: true, data: result.data };
};

exports.staffAdd = async (data, { db }) => {
  const doc = { ...data, createTime: db.serverDate() };
  const result = await db.collection("staff").add({ data: doc });
  return { success: true, data: { _id: result._id, ...doc } };
};

exports.staffUpdate = async (data, { db }) => {
  const { _id, ...rest } = data;
  rest.updateTime = db.serverDate();
  await db.collection("staff").doc(_id).update({ data: rest });
  return { success: true };
};

exports.staffDelete = async (data, { db }) => {
  // 级联删除该员工的所有排班记录
  var dispatches = await db.collection("dispatches").where({ staffId: data._id }).get();
  for (var i = 0; i < dispatches.data.length; i++) {
    await db.collection("dispatches").doc(dispatches.data[i]._id).remove();
  }
  await db.collection("staff").doc(data._id).remove();
  return { success: true };
};

// --- 排班 ---
exports.dispatchAdd = async (data, { db, _ }) => {
  const { staffId, roomId, date, shift, type } = data;

  // 同人同日已有排班则拒绝
  const existing = await db
    .collection("dispatches")
    .where({ staffId, date })
    .get();
  if (existing.data.length > 0) {
    return { success: false, errMsg: "该员工当日已有排班，无法重复安排" };
  }

  const doc = {
    staffId,
    roomId,
    date,
    shift: shift || "全天",
    type: type || "regular",
    createTime: db.serverDate(),
  };
  const result = await db.collection("dispatches").add({ data: doc });
  return { success: true, data: { _id: result._id, ...doc } };
};

exports.dispatchList = async (data, { db }) => {
  var { startDate, endDate, roomId } = data || {};
  var query = {};
  if (startDate && endDate) {
    query.date = db.command.gte(startDate).and(db.command.lte(endDate));
  }
  if (roomId) query.roomId = roomId;
  var result = await db
    .collection("dispatches")
    .where(query)
    .orderBy("date", "asc")
    .get();

  // 过滤掉已删除员工的孤儿记录
  var staffList = await db.collection("staff").get();
  var validIds = {};
  staffList.data.forEach(function (s) { validIds[s._id] = true; });
  var validDispatches = result.data.filter(function (d) { return validIds[d.staffId]; });

  return { success: true, data: validDispatches };
};

// 删除单条排班
exports.deleteDispatch = async (data, { db }) => {
  await db.collection("dispatches").doc(data._id).remove();
  return { success: true };
};

// 清理孤儿排班记录
exports.cleanupDispatches = async (data, { db }) => {
  var staffList = await db.collection("staff").get();
  var validIds = {};
  staffList.data.forEach(function (s) { validIds[s._id] = true; });

  var allDispatches = await db.collection("dispatches").get();
  var deleted = 0;
  for (var i = 0; i < allDispatches.data.length; i++) {
    if (!validIds[allDispatches.data[i].staffId]) {
      await db.collection("dispatches").doc(allDispatches.data[i]._id).remove();
      deleted++;
    }
  }
  return { success: true, data: { deleted: deleted } };
};

exports.dispatchBorrow = async (data, { db }) => {
  var { staffId, date } = data;

  // 找到该员工当天的旧排班并删除
  var oldList = await db.collection("dispatches").where({ staffId: staffId, date: date }).get();
  for (var i = 0; i < oldList.data.length; i++) {
    await db.collection("dispatches").doc(oldList.data[i]._id).remove();
  }

  // 在新场地创建借调记录
  var doc = { ...data, type: "borrow", createTime: db.serverDate() };
  var result = await db.collection("dispatches").add({ data: doc });
  return { success: true, data: { _id: result._id, ...doc } };
};

exports.dispatchStats = async (data, { db }) => {
  const { month } = data; // "2026-05"
  const result = await db
    .collection("dispatches")
    .where({ date: db.RegExp({ regexp: `^${month}`, options: "i" }) })
    .get();
  // 按 staffId 聚合
  const stats = {};
  result.data.forEach((d) => {
    if (!stats[d.staffId]) stats[d.staffId] = { staffId: d.staffId, days: 0 };
    stats[d.staffId].days++;
  });
  return { success: true, data: Object.values(stats) };
};
