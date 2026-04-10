# 《地球Online》技术规范文档

---

## 1. 组件清单

### shadcn/ui 组件

| 组件 | 用途 | 自定义需求 |
|------|------|-----------|
| Button | CTA按钮、交互按钮 | 添加脉冲动画、发光效果 |
| Card | 玻璃拟态卡片 | 自定义玻璃背景、发光边框 |
| Dialog | 投胎模拟器模态框 | 全屏遮罩、科技感样式 |
| Progress | 进度条 | 赛博朋克风格 |
| Badge | 等级标识 | SSR/R/黑铁颜色区分 |
| Separator | 分隔线 | 发光效果 |
| Tooltip | 提示信息 | 悬停显示详细说明 |
| Accordion | 手风琴组件 | 用于可折叠内容 |
| Alert | 警告提示 | 游戏状态提示 |
| Avatar | 头像组件 | 角色头像展示 |
| Calendar | 日历 | (预留) |
| Checkbox | 复选框 | (预留) |
| Collapsible | 可折叠组件 | (预留) |
| DropdownMenu | 下拉菜单 | (预留) |
| Input | 输入框 | (预留) |
| Label | 标签 | 表单标签 |
| RadioGroup | 单选按钮组 | (预留) |
| ScrollArea | 滚动区域 | 游戏日志滚动 |
| Select | 选择器 | (预留) |
| Slider | 滑块 | (预留) |
| Switch | 开关 | (预留) |
| Tabs | 标签页 | (预留) |

### 自定义组件

| 组件 | 用途 | 复杂度 | 状态 |
|------|------|--------|------|
| ParticleBackground | 粒子背景系统 | 高 | ✅ 已实现 |
| GlassCard | 玻璃拟态卡片 | 中 | ✅ 已实现 |
| TypewriterText | 打字机效果文字 | 中 | ✅ 已实现 |
| AnimatedNumber | 动态数字跳动 | 中 | ✅ 已实现 |
| SpawnModal | 投胎模拟器 | 高 | ✅ 已实现 |
| GlowingButton | 发光脉冲按钮 | 低 | ✅ 已实现 |
| GameHUD | 游戏顶部HUD | 中 | ✅ 已实现 |
| StatPanel | 属性面板 | 中 | ✅ 已实现 |
| DecisionPanel | 决策面板 | 高 | ✅ 已实现 |
| LogStream | 游戏日志流 | 中 | ✅ 已实现 |
| SpawnTransition | 出生过渡动画 | 高 | ✅ 已实现 |
| DeathScreen | 死亡/游戏结束画面 | 高 | ✅ 已实现 |

### 页面Section组件

| 组件 | 用途 | 状态 |
|------|------|------|
| Header | 顶部导航栏 | ✅ 已实现 |
| Hero | 首屏英雄区 | ✅ 已实现 |
| ServerStatus | 服务器状态面板 | ✅ 已实现 |
| CharacterCreation | 角色创建说明 | ✅ 已实现 |
| MainQuestline | 主线任务时间轴 | ✅ 已实现 |
| OpenWorld | 开放世界说明 | ✅ 已实现 |
| SkillTree | 天赋树说明 | ✅ 已实现 |
| Economy | 经济系统说明 | ✅ 已实现 |
| Guilds | 公会系统说明 | ✅ 已实现 |
| RNGEvents | 随机事件说明 | ✅ 已实现 |
| WinConditions | 胜利条件说明 | ✅ 已实现 |
| Footer | 页脚 | ✅ 已实现 |

---

## 2. 动画实现方案

### 动画库选择

| 库 | 用途 | 理由 |
|----|------|------|
| **Framer Motion** | 主要动画库 | React生态最佳，声明式API，支持手势 |
| **GSAP** | 复杂时间轴、滚动触发 | 强大的ScrollTrigger插件 |
| **Canvas API** | 粒子系统 | 性能最优 |

### 动画实现表

| 动画效果 | 库 | 实现方式 | 复杂度 |
|----------|-----|----------|--------|
| 页面加载序列 | Framer Motion | AnimatePresence + stagger | 中 |
| 粒子背景 | Canvas API | requestAnimationFrame | 高 |
| 打字机效果 | Framer Motion | 逐字显示 + variants | 中 |
| 数字实时跳动 | React State | setInterval + 动画 | 低 |
| 卡片悬停效果 | Framer Motion | whileHover + transform | 低 |
| 滚动触发显示 | Framer Motion | whileInView | 中 |
| 时间轴点亮 | Framer Motion | whileInView + delay | 中 |
| 模态框进度条 | Framer Motion | animate + transition | 中 |
| 流光边框 | CSS | 伪元素 + 动画 | 低 |
| 脉冲发光 | CSS | @keyframes | 低 |
| 出生过渡动画 | Framer Motion | AnimatePresence | 高 |
| HUD元素滑入 | Framer Motion | initial + animate | 低 |
| 日志滚动 | CSS/JS | overflow + scroll | 低 |

### 关键动画参数

**缓动函数：**
```javascript
const easings = {
  smooth: [0.16, 1, 0.3, 1],      // 平滑出场
  bounce: [0.68, -0.55, 0.265, 1.55], // 弹性
  standard: [0.4, 0, 0.2, 1],     // 标准
};
```

**时长规范：**
- 微交互: 0.2-0.3s
- 元素出现: 0.5-0.8s
- 复杂动画: 1-1.5s
- 背景动画: 30-60s (循环)

**Stagger延迟：**
- 卡片列表: 0.1s
- 导航菜单: 0.05s
- 时间轴节点: 0.2s

---

## 3. 项目结构

```
d:\Programming\地球Online\
├── app/
│   ├── public/
│   │   └── images/
│   │       └── earth-hologram.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui 组件
│   │   │   ├── game/                  # 游戏专用组件
│   │   │   │   ├── DeathScreen.tsx    # 游戏结束画面
│   │   │   │   ├── DecisionPanel.tsx  # 决策面板
│   │   │   │   ├── GameHUD.tsx        # 游戏HUD
│   │   │   │   ├── LogStream.tsx      # 日志流
│   │   │   │   ├── SpawnTransition.tsx # 出生过渡
│   │   │   │   └── StatPanel.tsx      # 属性面板
│   │   │   ├── ParticleBackground.tsx # 粒子背景
│   │   │   ├── GlassCard.tsx          # 玻璃卡片
│   │   │   ├── TypewriterText.tsx     # 打字机效果
│   │   │   ├── AnimatedNumber.tsx     # 动态数字
│   │   │   ├── SpawnModal.tsx         # 投胎模拟器
│   │   │   └── GlowingButton.tsx      # 发光按钮
│   │   ├── sections/                   # 页面Section
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── ServerStatus.tsx
│   │   │   ├── CharacterCreation.tsx
│   │   │   ├── MainQuestline.tsx
│   │   │   ├── OpenWorld.tsx
│   │   │   ├── SkillTree.tsx
│   │   │   ├── Economy.tsx
│   │   │   ├── Guilds.tsx
│   │   │   ├── RNGEvents.tsx
│   │   │   ├── WinConditions.tsx
│   │   │   └── Footer.tsx
│   │   ├── game/                       # 游戏逻辑
│   │   │   ├── GameContext.tsx        # 游戏状态Context
│   │   │   └── gameState.ts           # 游戏状态、reducer、事件库
│   │   ├── hooks/
│   │   │   └── use-mobile.ts
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── dist/                          # 构建输出
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── components.json
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── README.md
│   └── info.md
├── tech-spec.md                        # 本文件
├── 地球 Online 项目开发要求文档.md    # 项目需求文档
└── earth-hologram.png
```

---

## 4. 依赖清单

### 核心依赖
```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "framer-motion": "^12.38.0",
    "gsap": "^3.14.2",
    "@gsap/react": "^2.1.2",
    "lucide-react": "^0.562.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0",
    "recharts": "^2.15.4",
    "sonner": "^2.0.7"
  }
}
```

### 开发依赖
```json
{
  "devDependencies": {
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.23",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.19",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "~5.9.3",
    "vite": "^7.2.4",
    "eslint": "^9.39.1",
    "typescript-eslint": "^8.46.4"
  }
}
```

---

## 5. 游戏状态管理

### GamePhase (游戏阶段)
```typescript
type GamePhase = 'LANDING' | 'SPAWNING' | 'PLAYING' | 'GAMEOVER';
```

### PlayerStats (玩家属性)
```typescript
interface PlayerStats {
  age: number;           // 年龄
  health: number;        // 健康值
  maxHealth: number;     // 最大健康
  money: number;         // 金币
  energy: number;        // 精力
  maxEnergy: number;     // 最大精力
  mood: number;          // 心情
  intelligence: number;  // 智力
  charm: number;         // 魅力
  karma: number;         // 人品值
}
```

### FamilyTier (家境评级)
```typescript
type FamilyTier = 'SSR' | 'SR' | 'R' | 'IRON';
```

### GameEvent (游戏事件)
```typescript
interface GameEvent {
  id: string;
  minAge: number;
  maxAge: number;
  condition?: (stats: PlayerStats) => boolean;
  text: string;
  choices: {
    text: string;
    statChanges: Partial<PlayerStats>;
    followUp?: string;
  }[];
}
```

---

## 6. 样式配置

### Tailwind 扩展配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'deep-space': '#080B1A',
        'deep-space-light': '#0D1128',
        'holo-blue': '#00D2FF',
        'fatal-red': '#FF4B4B',
        'gold': '#FFD700',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 60s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 210, 255, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 210, 255, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
};
```

### CSS 变量

```css
:root {
  --bg-primary: #080B1A;
  --bg-secondary: #0D1128;
  --bg-card: rgba(255, 255, 255, 0.03);
  --holo-blue: #00D2FF;
  --holo-blue-glow: rgba(0, 210, 255, 0.5);
  --fatal-red: #FF4B4B;
  --fatal-red-glow: rgba(255, 75, 75, 0.5);
  --border-glow: rgba(0, 210, 255, 0.3);
  --gold: #FFD700;
}
```

### 玻璃拟态

```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 210, 255, 0.15);
  border-radius: 16px;
}
```

---

## 7. 性能优化策略

### 动画性能
- 使用 `transform` 和 `opacity` 进行动画
- 粒子系统使用 Canvas，限制粒子数量 (60-80)
- 使用 `will-change` 提示浏览器优化
- 滚动动画使用 Framer Motion 的 `whileInView`

### 代码分割
- 模态框组件懒加载
- 大型动画库按需导入

### 可访问性
- 支持 `prefers-reduced-motion`
- 所有按钮有明确的焦点状态
- 足够的颜色对比度 (WCAG AA)

---

## 8. 关键实现细节

### 粒子背景
```typescript
// 使用 Canvas 实现
// 粒子数量: 60-80
// 连接距离: 100px
// 鼠标交互: 轻微避让
// 运动速度: 0.3-0.8px/frame
```

### 打字机效果
```typescript
// 使用 Framer Motion
// 逐字显示，间隔 50ms
// 支持光标闪烁
// 完成后触发回调
```

### 动态数字
```typescript
// 使用 setInterval 每秒更新
// 变化范围: ±1-5
// 数字变化时有缩放动画
// 格式化大数字 (千分位)
```

### 游戏逻辑
```typescript
// 年龄递增: 每次选择+1岁
// 健康衰减: >35岁-2/年, >60岁-5/年
// 随机事件: 30%概率触发
// 游戏结束: 健康<=0 或 年龄>=100
```

### 家境抽卡概率
```typescript
// SSR: 0.1%
// SR: 5.0%
// R: 60.0%
// IRON: 34.9%
```

---

## 9. 开发与启动

### 安装依赖
```bash
cd app
npm install
```

### 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:5173

### 构建生产版本
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

---

## 10. 项目说明

### 项目概述
《地球Online》是一个将现实生活比喻为大型多人在线角色扮演游戏(MMORPG)的Web应用。包含两部分：
1. **概念展示页面**: 用游戏化语言解释现实生活的各个方面
2. **人生模拟游戏**: 完整的从出生到死亡的人生模拟器，用户通过选择影响人生轨迹

### 核心玩法
- **出生抽卡**: 随机生成出生地、家境、初始属性和天赋
- **人生选择**: 每年触发事件，用户做出选择影响属性
- **属性系统**: 健康、精力、金币、心情、智力、魅力、人品
- **游戏结束**: 健康归零或活到100岁，生成人生总结

### 技术特点
- **前端**: React 19 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **动画**: Framer Motion + GSAP + Canvas
- **状态管理**: React useReducer + Context
- **风格**: 赛博朋克/科幻 + 玻璃拟态
