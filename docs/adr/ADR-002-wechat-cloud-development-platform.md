# ADR-002: 微信云开发作为全栈平台

**Status**: Accepted  
**Date**: 2026-05-25  
**Deciders**: Alan

## Context

小程序需要数据库、文件存储、后端逻辑运行环境。可选方案：
1. 微信云开发（Cloud Base）— 集成数据库 + 云函数 + 存储
2. 自建后端 + HTTPS API
3. 第三方 BaaS（如 LeanCloud、Firebase）

## Decision

使用微信云开发作为唯一后端平台。数据库使用云数据库（文档型），业务逻辑通过云函数实现，不依赖外部服务器。

## Rationale

- **零运维**：无需管理服务器、域名备案、SSL 证书
- **天然鉴权**：云函数自动获取微信用户身份（`wx-server-sdk` 集成 `OPENID`）
- **数据库集成**：`wx.cloud.database()` 在客户端和云函数端均可直接操作，无需 REST 封装
- **生态锁定可接受**：项目定位为酒店内部工具，无跨平台迁移需求
- **环境 ID**：`dev-meet-sz-01-d6gl3c9h2cd0a2b59`

## Consequences

- 数据库查询能力受微信云开发 SDK 限制（无复杂 JOIN、聚合能力有限）
- 云函数单次执行超时 30 秒，不适合长时间计算
- 集合需在首次使用时通过 `dbInit` 模块自动创建
- 数据迁移至其他平台成本较高
