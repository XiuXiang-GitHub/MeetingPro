// 执行清单模块

// 内置模板
const TEMPLATES = {
  pre: [
    { content: "确认场地布置方案", stage: "pre" },
    { content: "检查音响投影设备", stage: "pre" },
    { content: "摆放桌牌与资料", stage: "pre" },
    { content: "准备茶水与签到台", stage: "pre" },
    { content: "确认来宾名单并打印", stage: "pre" },
  ],
  during: [
    { content: "开场前30分钟引导就座", stage: "during" },
    { content: "会议期间茶水续杯", stage: "during" },
    { content: "记录会议纪要与决议", stage: "during" },
    { content: "拍摄现场照片存档", stage: "during" },
  ],
  post: [
    { content: "回收桌牌与资料", stage: "post" },
    { content: "检查遗留物品", stage: "post" },
    { content: "关闭设备并归位", stage: "post" },
    { content: "整理会议纪要并发送", stage: "post" },
    { content: "场地清洁验收", stage: "post" },
  ],
};

exports.createFromTemplate = async (data, { db }) => {
  const { bookingId, title } = data;
  const checklistDoc = {
    bookingId: bookingId || "",
    title: title || "会议执行清单",
    createTime: db.serverDate(),
  };
  const checklistResult = await db.collection("checklists").add({ data: checklistDoc });
  const checklistId = checklistResult._id;

  // 创建三个阶段的条目
  const items = [];
  for (const stage of ["pre", "during", "post"]) {
    for (const tpl of TEMPLATES[stage]) {
      const item = {
        checklistId,
        content: tpl.content,
        stage: tpl.stage,
        status: "pending",
        assignee: "",
        hasIssue: false,
        issueDesc: "",
        createTime: db.serverDate(),
      };
      const r = await db.collection("checklist_items").add({ data: item });
      items.push({ _id: r._id, ...item });
    }
  }

  return { success: true, data: { checklist: checklistDoc, _id: checklistId, items } };
};

exports.list = async (data, { db }) => {
  const { bookingId, skip = 0, limit = 20 } = data || {};
  const query = {};
  if (bookingId) query.bookingId = bookingId;
  const result = await db
    .collection("checklists")
    .where(query)
    .orderBy("createTime", "desc")
    .skip(skip)
    .limit(limit)
    .get();
  return { success: true, data: result.data };
};

exports.updateItem = async (data, { db }) => {
  const { _id, ...rest } = data;
  rest.updateTime = db.serverDate();
  await db.collection("checklist_items").doc(_id).update({ data: rest });
  return { success: true };
};

exports.issues = async (data, { db }) => {
  const result = await db
    .collection("checklist_items")
    .where({ hasIssue: true })
    .orderBy("createTime", "asc")
    .get();
  return { success: true, data: result.data };
};
