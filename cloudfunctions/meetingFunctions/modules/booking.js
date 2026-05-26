// 会议预定模块
exports.create = async (data, { db }) => {
  const { roomId, title, date, timeSlot, attendees, company, contact, manager } = data;

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
    manager: manager || "",
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
  const { _id, roomId, title, date, timeSlot, attendees, company, contact, manager, status } = data;
  const updateData = { updateTime: db.serverDate() };
  if (roomId !== undefined) updateData.roomId = roomId;
  if (title !== undefined) updateData.title = title;
  if (date !== undefined) updateData.date = date;
  if (timeSlot !== undefined) updateData.timeSlot = timeSlot;
  if (attendees !== undefined) updateData.attendees = attendees;
  if (company !== undefined) updateData.company = company;
  if (contact !== undefined) updateData.contact = contact;
  if (manager !== undefined) updateData.manager = manager;
  if (status !== undefined) updateData.status = status;
  await db.collection("bookings").doc(_id).update({ data: updateData });
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
