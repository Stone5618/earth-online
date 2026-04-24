# 地球Online

一个纯前端的人生模拟游戏，使用 React + TypeScript + Vite 构建。

## 技术栈

- 前端框架：React 19 + TypeScript
- 构建工具：Vite
- 样式：Tailwind CSS
- 动画：Framer Motion + GSAP
- 状态管理：React useReducer + Context API
- UI 组件：Radix UI (shadcn/ui)
- 音效：Howler.js
- 图标：Lucide React

## 项目结构

```
app/
├── public/              # 静态资源
│   └── images/
├── src/
│   ├── components/
│   │   ├── game/       # 游戏组件
│   │   └── ui/         # UI 组件
│   ├── config/         # 游戏配置
│   ├── game/           # 游戏核心逻辑
│   ├── sections/       # 页面区域
│   ├── types/          # 类型定义
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── ...其他配置
```

## 安装与运行

### 前置要求

- Node.js (建议使用 LTS 版本)
- npm

### 安装依赖

```bash
cd app
npm install
```

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 预览构建

```bash
npm run preview
```

## 主要功能

- 出生系统：随机家庭背景、天赋/缺陷
- 职业系统：多行业、晋升机制
- 教育系统：从小学到博士的教育路径
- 事件系统：随机人生事件
- 健康系统：健康管理、疾病治疗
- 经济系统：收入、支出、债务管理
- 技能系统：14种可升级技能
- 存档系统：自动/手动存档
- 成就系统：游戏成就解锁

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT
