// 数据报表模块

// 首页仪表盘 — 一次调用返回所有聚合数据
exports.dashboard = async (data, { db }) => {
  const { today } = data || {};
  const month = today ? today.slice(0, 7) : "";

  const [bookingResult, dispatchResult, materialResult, revenueResult] = await Promise.all([
    db.collection("bookings").where({ date: today }).get().catch(() => ({ data: [] })),
    db.collection("dispatches").where({ date: today }).get().catch(() => ({ data: [] })),
    db.collection("materials").get().catch(() => ({ data: [] })),
    month
      ? db.collection("revenues").where({ month }).get().catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] }),
  ]);

  var allBookings = bookingResult.data || [];
  var allMats = materialResult.data || [];
  var revenueRecords = revenueResult.data || [];

  var lowStock = [];
  for (var j = 0; j < allMats.length; j++) {
    if (allMats[j].stock < allMats[j].minStock) {
      lowStock.push(allMats[j]);
    }
  }
  var monthlyTotal = 0;
  for (var k = 0; k < revenueRecords.length; k++) {
    monthlyTotal += revenueRecords[k].amount || 0;
  }

  return {
    success: true,
    data: {
      todayBookings: allBookings,
      todayDispatches: dispatchResult.data || [],
      lowStockItems: lowStock,
      monthlyRevenue: monthlyTotal,
    },
  };
};

exports.roomUsage = async (data, { db }) => {
  const { month } = data; // "2026-05"
  const regexp = `^${month}`;

  const rooms = await db.collection("rooms").get();
  const bookings = await db
    .collection("bookings")
    .where({ date: db.RegExp({ regexp, options: "i" }) })
    .get();

  // 按场地聚合使用天数
  const usage = {};
  rooms.data.forEach((r) => {
    usage[r._id] = { name: r.name, days: new Set() };
  });
  bookings.data.forEach((b) => {
    if (usage[b.roomId]) {
      usage[b.roomId].days.add(b.date);
    }
  });

  const result = Object.values(usage).map((u) => ({
    name: u.name,
    usedDays: u.days.size,
  }));

  return { success: true, data: result };
};

exports.staffEfficiency = async (data, { db }) => {
  const { month } = data;
  const regexp = `^${month}`;

  const dispatches = await db
    .collection("dispatches")
    .where({ date: db.RegExp({ regexp, options: "i" }) })
    .get();

  const staffList = await db.collection("staff").get();
  const staffMap = {};
  staffList.data.forEach((s) => {
    staffMap[s._id] = { name: s.name, role: s.role, sessions: 0, days: new Set() };
  });

  dispatches.data.forEach((d) => {
    if (staffMap[d.staffId]) {
      staffMap[d.staffId].sessions++;
      staffMap[d.staffId].days.add(d.date);
    }
  });

  const result = Object.values(staffMap).map((s) => ({
    name: s.name,
    role: s.role,
    sessions: s.sessions,
    workDays: s.days.size,
  }));

  return { success: true, data: result };
};

exports.revenue = async (data, { db }) => {
  const { month, action, amount, bookingId, note } = data || {};

  if (action === "add") {
    const doc = { bookingId, amount, month, note: note || "", createTime: db.serverDate() };
    await db.collection("revenues").add({ data: doc });
    return { success: true, data: doc };
  }

  const query = {};
  if (month) query.month = month;
  const result = await db.collection("revenues").where(query).get();

  const total = result.data.reduce((sum, r) => sum + (r.amount || 0), 0);

  return { success: true, data: { records: result.data, total } };
};
