# AI 写作助手 — 你的智能中文内容生成伙伴

> **让写作更智能，让创作更高效** — 基于 Claude AI 的文章、报告、邮件、社媒文案一站式生成平台。

## 产品简介

AI写作助手是一个基于 Anthropic Claude API 构建的智能写作平台，帮助中文使用者快速生成高质量的内容。无论是新闻文章、商业报告、商务邮件还是社交媒体文案，只需输入主题和要求，AI 即可在数秒内生成专业级内容。

**适合谁用：**
- 内容创作者：快速生成初稿，提升写作效率
- 商务人士：自动生成专业邮件和报告
- 市场营销：批量生成社交媒体文案
- 中文学习者：学习不同文体的写作风格

## 核心功能

### AI 内容生成
- **文章写作** — 新闻、博客、学术文章，支持正式/轻松/专业/友好多种语调
- **商务报告** — 商业分析、项目报告，结构化专业格式
- **邮件沟通** — 商务邮件、营销邮件、客服邮件模板
- **社交媒体** — 微博文案、朋友圈、广告文案，自动添加话题标签

### 智能参数控制
- 4 种内容类型 × 4 种语调风格 × 3 种长度档位 = 48 种组合
- 基于 Claude Sonnet 4 模型，生成质量远超市面模板工具

### 历史记录与管理
- 自动生成记录保存，支持收藏和标签管理
- 一键重新生成，获得不同版本
- 支持 CSV/JSON 导出

### 用户体系
- 免费用户每日 10 次生成额度
- 高级版无限制 + 更多功能
- 使用统计分析与可视化报告

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0
- Anthropic API Key ([申请地址](https://console.anthropic.com/))

### 安装

```bash
# 1. 克隆项目
git clone <repo-url>
cd ai-writing-assistant

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 ANTHROPIC_API_KEY

# 4. 启动开发服务器
npm run dev
```

访问 `http://localhost:5173` 开始使用。

### 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `ANTHROPIC_API_KEY` | Anthropic API 密钥 | `sk-ant-api03-...` |
| `JWT_SECRET` | JWT 签名密钥 | 任意随机字符串 |
| `PORT` | 后端服务端口 | `3001` |

## 技术架构

```
前端: React 18 + TypeScript + Vite + Tailwind CSS + Zustand
后端: Express.js + TypeScript + Anthropic Claude SDK
安全: Helmet + CORS + JWT + bcrypt
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/content/generate` | 生成内容 |
| POST | `/api/content/regenerate/:id` | 重新生成 |
| GET | `/api/content/stats` | 用户统计 |
| GET | `/api/templates` | 模板列表 |
| GET | `/api/history` | 历史记录 |

## 定价计划

| 计划 | 价格 | 每日生成 | 模板 | 导出 |
|------|------|----------|------|------|
| 免费版 | ¥0 | 10 次 | 基础 6 个 | CSV |
| 高级版 | ¥49/月 | 无限 | 全部 20+ | CSV + JSON |
| 企业版 | 联系 | 无限 | 全部 + 定制 | 全格式 + API |

## 部署

### Vercel 部署前端
```bash
npm run build
vercel --project ai-writing-assistant
```

### 后端部署
支持 Railway、Render 等 Node.js 平台，设置环境变量即可运行。

## 开源协议

MIT License

## 支持项目

如果这个项目对你有帮助，欢迎 [赞助支持](https://github.com/sponsors/shengdabai) ☕

---

**AI写作助手** — 基于 Claude AI 的智能中文写作平台
