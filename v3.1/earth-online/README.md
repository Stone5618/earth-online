# 地球 Online v3.1

> 一款基于 Web 的现代生活模拟游戏，融合 RPG 元素与策略养成。

[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-green)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

## 项目简介

地球 Online 是一款文字驱动的人生模拟游戏。玩家从出生开始，经历求学、就业、婚恋、事业起伏，最终走向人生终点。游戏通过**事件库 + 概率树**的动态叙事引擎，为每位角色生成独一无二的人生轨迹。

## 核心特性

- **动态事件系统**：基于层级概率树 (HPT) 的事件调度，结合年龄、阶段、属性条件精准匹配
- **事件链机制**：支持多步连续事件（如失业→找工作→面试→入职、恋爱→约会→求婚→结婚）
- **非线性属性演化**：属性变化受年龄、阶段、状态影响，非简单线性增减
- **多服务器架构**：支持多服务器部署，不同服务器有不同经济/文化设定
- **家族系统**：完整的婚姻、生育、家族资产传承
- **RBAC 权限系统**：后台管理面板，支持角色权限控制、操作审计
- **全端响应式**：PC 端三栏布局，移动端自适应面板切换
- **实时排行榜**：多类型排行榜（财富、智力、声望等）

## 技术栈

### 后端

| 组件 | 技术 |
|------|------|
| 框架 | FastAPI + Uvicorn |
| ORM | SQLAlchemy 2.0 |
| 数据库 | PostgreSQL 16 |
| 缓存 | Redis 5.x |
| 认证 | JWT (python-jose) |
| 迁移 | Alembic |
| 验证 | Pydantic 2.x |

### 前端

| 组件 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 7 |
| UI | Tailwind CSS + Radix UI + shadcn/ui |
| 动画 | Framer Motion + GSAP |
| 路由 | React Router 7 |
| 状态 | Zustand |
| 音效 | Howler.js |
| 测试 | Vitest + Playwright |

## 快速开始

### 环境要求

- Node.js >= 20
- Python >= 3.11
- PostgreSQL >= 16
- Redis >= 5

### 后端启动

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入数据库连接等信息

# 数据库迁移
alembic upgrade head

# 启动服务
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### Docker 部署

```bash
docker-compose up -d
```

## 项目结构

```
earth-online/
├── backend/                 # 后端服务
│   ├── app/
│   │   ├── engine/          # 核心游戏引擎
│   │   │   ├── events.py           # 事件调度器 (Phase 0-2 匹配)
│   │   │   ├── event_chain.py      # 事件链系统
│   │   │   ├── hierarchical_probability_tree.py  # 层级概率树
│   │   │   ├── attribute_evolution.py  # 属性演化系统
│   │   │   ├── game_fsm.py         # 生命阶段有限状态机
│   │   │   ── ...
│   │   ├── routers/         # API 路由
│   │   ├── models/          # 数据模型
│   │   ├── services/        # 业务服务
│   │   └── utils/           # 工具函数
│   ├── alembic/             # 数据库迁移
│   └── tests/               # 测试用例
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── admin/           # 后台管理系统
│   │   ├── api/             # API 客户端
│   │   ├── components/      # UI 组件
│   │   ├── game/            # 游戏核心 (状态机、引擎、存档)
│   │   └── hooks/           # 自定义 Hooks
│   └── playwright.config.ts # E2E 测试配置
── docker-compose.yml       # Docker 编排
```

## 核心系统设计

### 事件调度引擎 (Event Dispatch Engine)

事件匹配分为三个优先级阶段：

1. **Phase 0 - 链事件匹配**：检查正在进行中的事件链，推进或触发下一步
2. **Phase 1 - HPT 层级概率树**：根据角色生命阶段、属性、文化背景进行加权筛选
3. **Phase 2 - 常规事件匹配**：基于年龄、属性条件、标志位的精确匹配

每个阶段都有严格的去重机制：`recent_event_titles` 防止同标题事件重复触发，`is_chain_event` 标记防止链事件进入常规池。

### 事件链系统 (Event Chain System)

支持多步连续叙事：
- **失业恢复链**：失业 → 找工作 → 面试 → 入职
- **恋爱结婚链**：表白 → 约会 → 求婚 → 结婚
- **疾病治疗链**：生病 → 治疗 → 康复

链事件完成后，若满足启动条件可重新启动（如再次生病可重新触发治疗链）。

### 属性演化系统 (Attribute Evolution System)

属性变化不是简单的 `+/-`，而是经过演化系统处理：
- 自然老化：随年龄增长属性自然衰减
- 事件增长：事件触发后的属性变化经过系数调整
- 阶段影响：不同生命阶段对同一事件有不同的属性响应

## API 文档

启动后端后访问：http://localhost:8000/docs

## 开发约定

- 后端遵循 Google Python Style Guide
- 前端遵循 ESLint + Prettier 规范
- 提交信息使用 Conventional Commits 格式
- 新功能需同步更新测试用例

## 许可证

MIT License
