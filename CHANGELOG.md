# Changelog

All notable changes to AI写作助手 will be documented in this file.

## [Unreleased]

## [1.1.0] - 2026-05-16

### Added
- Railway 部署配置 (`railway.json`)
- 多阶段 Dockerfile 生产部署
- 定价 Landing Page (`public/pricing.html`)，SEO + OG tags
- GitHub Actions CI（lint + typecheck + build 双阶段）
- CHANGELOG.md

### Changed
- README 新增完整部署指南（Vercel 前端 + Railway 后端 + Docker）
- CI 增加 build:server 阶段

## [1.0.0] - 2026-05-07

### Added
- AI 内容生成核心（Claude API 集成，48 种组合）
- 前端 8 个页面路由（React 18 + TypeScript + Vite）
- 后端 5 组 API 路由（Express + JWT + bcrypt）
- 用户注册/登录系统
- 历史记录管理与 CSV/JSON 导出
- 使用统计与可视化
- .env.example 规范配置
- FUNDING.yml（GitHub 赞助）
- 定价计划（免费版/高级版¥49/月/企业版）
