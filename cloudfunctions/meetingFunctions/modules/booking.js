// 会议预定模块
exports.create = async (data, { db }) => {
  const { roomId, title, date, timeSlot, attendees, company, contact,负责人 } = data;

  // 冲突检测
  const conflict = await db
    .collection("bookings")
    .where({ roomId, date, timeSlot })
    .get();

  if (conflict.data.length > 0) {
    return {
      success: false,
      errMsg: "该时段与已有预定冲突，请更换时间或场地",
      conflicts: conflict.data,
    };
  }

  const doc = {
    roomId,
    title,
    date,
    timeSlot,
    attendees: attendees || 0,
    company: company || "",
    contact: contact || "",
    负责人: 负责人 || "",
    status: "confirmed",
    createTime: db.serverDate(),
  };
  const result = await db.collection("bookings").add({ data: doc });
  return { success: true, data: { _id: result._id, ...doc } };
};

exports.list = async (data, { db }) => {
  const { startDate, endDate, roomId } = data || {};
  const query = {};
  if (startDate && endDate) {
    query.date = db.command.gte(startDate).and(db.command.lte(endDate));
  }
  if (roomId) query.roomId = roomId;
  const result = await db
    .collection("bookings")
    .where(query)
    .orderBy("date", "asc")
    .get();
  return { success: true, data: result.data };
};

exports.update = async (data, { db }) => {
  const { _id, ...rest } = data;
  rest.updateTime = db.serverDate();
  await db.collection("bookings").doc(_id).update({ data: rest });
  return { success: true };
};

exports.delete = async (data, { db }) => {
  await db.collection("bookings").doc(data._id).remove();
  return { success: true };
};

exports.checkConflict = async (data, { db }) => {
  const { roomId, date, timeSlot } = data;
  const result = await db
    .collection("bookings")
    .where({ roomId, date, timeSlot })
    .get();
  return { success: true, data: result.data, hasConflict: result.data.length > 0 };
};
