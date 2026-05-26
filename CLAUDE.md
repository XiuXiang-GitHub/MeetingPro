# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 核心规则 (Hard Rule)

**本项目是微信小程序项目。所有指令、代码修改、文件操作、架构决策，必须严格遵循微信小程序开发规范，包括但不限于：**

- 使用微信小程序原生 API（`wx.*`），不得引入非小程序兼容的第三方库或框架
- 页面由 `.js` / `.wxml` / `.wxss` / `.json` 四文件组成，新增页面必须同时创建这四个文件并在 `app.json` 中注册
- 数据绑定使用 `this.setData()`，不得直接修改 `this.data`
- 云开发能力通过 `wx.cloud.*` API 调用，云函数通过 `wx.cloud.callFunction()` 触发
- 开发工具为微信开发者工具，非 CLI 构建系统，无 npm/webpack/vite 等前端工具链
- 所有样式使用 `.wxss`（类 CSS，但受小程序组件隔离和 rpx 单位约束）
- 不得使用 DOM 操作（`document.*`、`window.*` 等在微信小程序中不可用）
- 任何代码生成、修改、建议，都以微信小程序运行环境为唯一目标平台

## Project Overview

This is a WeChat Mini Program (微信小程序) quickstart project demonstrating WeChat Cloud Development (微信云开发) capabilities: database, file storage, cloud functions, cloud hosting, and AI integration. It is developed using **WeChat Developer Tools** (微信开发者工具), not a CLI-based build system.

## Architecture

```
miniprogram/                  # Mini program frontend
  app.js                      # App entry, wx.cloud.init() with env config
  app.json                    # Page registration, window & style config
  app.wxss                    # Global styles
  pages/
    index/                    # Home page: feature list (cloud functions, DB, storage, AI)
    example/                  # Detail/demo page per feature type (routed via ?type=xxx)
  components/
    cloudTipModal/            # Reusable modal for tips/errors
cloudfunctions/
  quickstartFunctions/        # Single cloud function, dispatches by event.type
    index.js                  # Handler functions: getOpenId, getMiniProgramCode,
                              #   createCollection, selectRecord, updateRecord,
                              #   insertRecord, deleteRecord
    package.json              # Depends on wx-server-sdk ~2.4.0
```

The cloud function `quickstartFunctions` is the sole backend entry point — the frontend calls `wx.cloud.callFunction({ name: "quickstartFunctions", data: { type: "...", data: {...} } })` and the function's `exports.main` dispatches by `event.type` in a switch statement.

## Development

- **IDE:** This project requires WeChat Developer Tools (微信开发者工具). Open the project root directory in the IDE — `project.config.json` sets `miniprogramRoot` to `miniprogram/` and `cloudfunctionRoot` to `cloudfunctions/`.
- **Environment config:** Before running, set the cloud environment ID in `miniprogram/app.js` → `globalData.env` (currently empty `""`). The env ID is found in the WeChat Developer Tools cloud console.
- **Deploying cloud functions:** Right-click `cloudfunctions/quickstartFunctions` in the IDE and select "上传并部署-云端安装依赖" (Upload & Deploy - Install Dependencies in Cloud). No local dependency installation is needed.
- **Page routing:** The example page at `pages/example/index` is driven by query parameters — `type` determines which feature demo to show (values: `getOpenId`, `getMiniProgramCode`, `createCollection`, `selectRecord`, `uploadFile`, `model-guide`, `ai-assistant`, `cloudbaserun`).
- **WeChat Cloud API:** All cloud operations (database, storage, cloud functions) go through `wx.cloud.*` APIs. The cloud environment is initialized once in `app.js` via `wx.cloud.init()`.

## File Patterns

- Each page consists of 4 files: `.js` (logic), `.wxml` (template), `.wxss` (styles), `.json` (page config)
- Components follow the same 4-file pattern
- `app.json` registers all pages (add new pages here) and global window styles
- Page data binding uses `this.setData({ key: value })` — never assign directly to `this.data`
