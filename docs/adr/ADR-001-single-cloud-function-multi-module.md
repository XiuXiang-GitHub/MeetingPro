# ADR-001: 单云函数 + 多模块分发模式

**Status**: Accepted  
**Date**: 2026-05-25  
**Deciders**: Alan

## Context

酒店会议管理小程序需要后端能力支撑 6 大功能模块（摆台、人员调度、会议预定、物资管理、执行清单、数据报表），涉及 10 个数据库集合的 CRUD 操作。

微信云开发提供两种云函数组织模式：
1. **多函数模式** — 每个操作一个独立云函数
2. **单函数模式** — 一个云函数通过 `event.action` 分发到不同模块

## Decision

采用单云函数 + 模块文件分发模式。云函数名为 `meetingFunctions`，通过 `event.action`（格式：`module.method`）路由到对应模块。

```
cloudfunctions/meetingFunctions/
  index.js           # 入口，dispatch by event.action
  modules/
    layout.js        # 摆台方案
    staff.js         # 员工 & 排班
    booking.js       # 会议预定
    material.js      # 物资管理
    checklist.js     # 执行清单
    report.js        # 数据报表
    dbInit.js        # 数据库初始化
```

## Rationale

- **冷启动优化**：微信云函数冷启动耗时较长，单函数模式只需一次冷启动，后续调用复用热实例
- **部署简便**：一次部署更新所有模块，避免逐个函数上传
- **代码共享**：`db`、`_`、`cloud` 等公共依赖在入口统一注入，模块无需各自初始化
- **与模板一致**：沿用 quickstart 模板的 `quickstartFunctions` 单函数模式，学习成本低

## Consequences

- 所有接口共享 30 秒超时（`config.json` 中配置）
- 单点故障风险：云函数异常影响所有模块
- 模块间通过文件引入解耦，无运行时隔离
