
# 地球Online

将现实生活比喻为大型多人在线角色扮演游戏(MMORPG)的Web应用！

---

## 项目概述

《地球Online》包含两部分核心内容：

1. **概念展示页面**：用游戏化的语言将现实生活的各个方面（服务器状态、角色创建、主线任务、经济系统、公会系统等）以精美的UI呈现
2. **人生模拟游戏**：完整的从出生到死亡的人生模拟器，用户可以通过选择影响自己的虚拟人生轨迹

---

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **UI组件库**: shadcn/ui + Tailwind CSS
- **动画库**: Framer Motion 12 + GSAP 3
- **状态管理**: React useReducer + Context API
- **图标库**: Lucide React

---

## 功能特性

### 概念展示页面
- 🏠 **服务器状态面板** - 显示在线玩家、物理引擎状态等
- 👤 **角色创建系统** - 出生抽卡、终身绑定ID、初始资源包
- 📜 **主线副本与时间轴** - 新手村、爆肝阶段、终局结算
- 🌍 **开放世界** - 无限地图、多人协作、PvP竞技场
- 🌳 **天赋树系统** - 职业技能、生活技能、隐藏天赋
- 💰 **硬核经济系统** - 不可能三角、PvP资源争夺
- 🏰 **公会与声望** - 强制绑定公会、自由加入公会、声望系统
- 🎲 **随机事件** - 每日SSR事件、每周事件、年度事件
- 🏆 **胜利条件** - 成就解锁、隐藏结局、周目继承

### 人生模拟游戏
- 🎰 **出生抽卡** - 随机出生地、家境评级（SSR/SR/R/IRON）、初始属性
- 📅 **年龄增长** - 从0岁到100岁的完整人生
- 🎭 **事件系统** - 各年龄段的丰富生活事件，2-3个选择，包含家庭等级专属事件
- 📊 **属性系统** - 健康、精力、金币、心情、智力、魅力、创造力、运气、福报
- 🎮 **游戏HUD** - 实时显示属性、游戏日志、决策面板
- 💬 **选择结果弹窗** - 选择后显示属性变化，点击确定继续
- 📱 **移动端优化** - 响应式布局，DecisionPanel和StatPanel并排显示
- 🏁 **游戏结束** - 健康归零或活到100岁，生成人生总结

---

## 快速开始

### 安装依赖

```bash
cd app
npm install
```

### 启动开发服务器

```bash
cd app
npm run dev
```

访问 http://localhost:5173/

### 构建生产版本

```bash
cd app
npm run build
```

### 代码检查

```bash
cd app
npm run lint
```

---

## 项目结构

```
app/
├── public/
│   └── images/
│       └── earth-hologram.png
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui组件
│   │   ├── game/            # 游戏专用组件
│   │   ├── ParticleBackground.tsx
│   │   ├── GlassCard.tsx
│   │   ├── TypewriterText.tsx
│   │   ├── AnimatedNumber.tsx
│   │   └── GlowingButton.tsx
│   ├── sections/            # 页面Section
│   ├── game/                # 游戏逻辑
│   │   ├── GameContext.tsx
│   │   └── gameState.ts
│   ├── hooks/
│   ├── lib/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## 游戏玩法说明

1. **浏览概念页面** - 查看"地球Online"的各个系统介绍
2. **开始投胎** - 点击"开始投胎"按钮，进行出生抽卡
3. **体验人生** - 进入PLAYING阶段后，每年做出选择影响人生
4. **观看总结** - 游戏结束后查看你的人生总结和最终称号
5. **重新开始** - 点击"重新开始"体验不同的人生

---

## 设计风格

- **视觉风格**: 赛博朋克/科幻风格
- **UI设计**: 玻璃拟态（Glassmorphism）
- **主色调**: deep-space (#080B1A), holo-blue (#00D2FF), fatal-red (#FF4B4B), gold (#FFD700)
- **字体**: Orbitron（标题）, JetBrains Mono（代码/数字）

---

## 注意事项

- 这是一个纯前端项目，所有数据存储在内存中
- 刷新页面会重置游戏进度
- 不需要后端服务
- 这是单人游戏，没有多人在线功能
- 没有付费或内购功能

---

## 许可证

MIT License

