# 地球 Online 项目开发要求文档

---

## 一、项目总体目标

开发一个**纯前端 Web 应用**，包含两部分核心内容：

1. **概念展示页面**：用游戏化的语言将现实生活比喻为大型多人在线角色扮演游戏(MMORPG)，展示"地球Online"的各个系统(服务器状态、角色创建、主线任务、经济系统、公会系统等)
2. **人生模拟游戏**：一个完整的从出生到死亡的人生模拟器，用户可以通过选择影响自己的虚拟人生轨迹

**所有数据存储在前端内存中**（页面刷新后数据重置），无需后端服务。

---

## 二、项目现状（已完成部分）

### 前端技术栈
- **框架**: React 19 + TypeScript + Vite
- **UI组件库**: shadcn/ui + Tailwind CSS
- **动画库**: Framer Motion 12 + GSAP 3
- **状态管理**: React useReducer + Context API
- **图标库**: Lucide React

### 已实现的组件和功能

#### 1. 概念展示页面（所有Section）
- ✅ `Header` - 顶部导航栏
- ✅ `Hero` - 首屏英雄区
- ✅ `ServerStatus` - 实时服务器状态面板
- ✅ `CharacterCreation` - 角色创建系统说明
- ✅ `MainQuestline` - 主线副本与时间轴
- ✅ `OpenWorld` - 开放世界说明
- ✅ `SkillTree` - 天赋树说明
- ✅ `Economy` - 硬核经济系统
- ✅ `Guilds` - 公会与声望系统
- ✅ `RNGEvents` - 随机事件说明
- ✅ `WinConditions` - 胜利条件
- ✅ `Footer` - 页脚

#### 2. 自定义UI组件
- ✅ `ParticleBackground` - 粒子背景系统
- ✅ `GlassCard` - 玻璃拟态卡片
- ✅ `TypewriterText` - 打字机效果文字
- ✅ `AnimatedNumber` - 动态数字跳动
- ✅ `SpawnModal` - 投胎模拟器模态框
- ✅ `GlowingButton` - 发光脉冲按钮

#### 3. 游戏专用组件
- ✅ `GameHUD` - 游戏顶部HUD界面
- ✅ `StatPanel` - 属性面板
- ✅ `DecisionPanel` - 决策面板
- ✅ `LogStream` - 游戏日志流
- ✅ `SpawnTransition` - 出生过渡动画
- ✅ `DeathScreen` - 死亡/游戏结束画面

#### 4. 游戏逻辑核心
- ✅ `GameContext` - 游戏状态Context
- ✅ `gameState` - 完整的游戏状态管理、reducer、事件库
  - 完整的类型定义（GamePhase, PlayerStats, FamilyTier, GameEvent等）
  - 游戏reducer（状态更新逻辑）
  - 事件库（包含童年、上学、成年、中年、老年各阶段事件）
  - 随机事件池
  - 家境抽卡逻辑
  - 初始属性生成
  - 游戏结束总结生成

---

## 三、项目结构

```
d:\Programming\地球Online\
├── app/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui组件
│   │   │   ├── game/            # 游戏专用组件
│   │   │   └── ...             # 自定义组件
│   │   ├── sections/            # 页面Section
│   │   ├── game/                # 游戏逻辑
│   │   └── App.tsx
│   └── package.json
├── tech-spec.md                  # 技术规范文档
└── 地球 Online 项目开发要求文档.md  # 本文档
```

---

## 四、核心功能模块详细说明

### 模块 1：概念展示页面

| 项目 | 说明 |
|------|------|
| **页面组成** | Header、Hero、ServerStatus、CharacterCreation、MainQuestline、OpenWorld、SkillTree、Economy、Guilds、RNGEvents、WinConditions、Footer |
| **视觉风格** | 赛博朋克/科幻风格 + 玻璃拟态设计 |
| **动画效果** | 粒子背景、滚动触发动画、卡片悬停效果、打字机效果、动态数字 |
| **背景** | 在LANDING阶段显示ParticleBackground粒子背景 |

### 模块 2：出生抽卡系统（核心）

| 项目 | 说明 |
|------|------|
| **入口** | 点击"开始投胎"按钮打开SpawnModal |
| **阶段1** | 连接服务器 - 显示loading动画，持续2秒 |
| **阶段2** | 生成DNA序列 - 显示进度条，从0%到100% |
| **阶段3** | 展示结果 - 显示：出生服务器、家境评级、初始属性、天赋 |
| **随机生成内容** | 服务器（9个选项）、家境（SSR/SR/R/IRON）、健康值（70-100）、IQ（90-130）、颜值（50-100）、天赋（9个选项） |
| **家境概率** | SSR: 0.1%, SR: 5.0%, R: 60.0%, IRON: 34.9% |
| **确认后** | 点击"确认登入"调用completeSpawning，进入PLAYING阶段 |

### 模块 3：人生模拟游戏

| 项目 | 说明 |
|------|------|
| **游戏阶段** | LANDING → SPAWNING → PLAYING → GAMEOVER |
| **初始属性** | 根据家境生成初始金钱、健康、智力、魅力、心情、人品 |
| **年龄递增** | 每次选择后年龄+1 |
| **事件触发** | 根据当前年龄触发对应事件，支持条件事件 |
| **事件选择** | 每个事件提供2-3个选择，不同选择影响不同属性 |
| **属性系统** | 年龄、健康、精力、金币、心情、智力、魅力、人品 |
| **健康衰减** | 年龄>35岁时健康-2/年，年龄>60岁时健康-5/年 |
| **随机事件** | 30%概率触发随机事件 |
| **游戏结束** | 健康<=0 或 年龄>=100 触发游戏结束 |

### 模块 4：游戏HUD界面

| 项目 | 说明 |
|------|------|
| **显示内容** | 当前年龄、健康值（进度条）、精力值（进度条）、金币、心情 |
| **属性面板** | 智力、魅力、人品 |
| **游戏日志** | 显示最近发生的事件 |
| **决策面板** | 显示当前事件文本和选择按钮 |

### 模块 5：游戏结束与总结

| 项目 | 说明 |
|------|------|
| **触发条件** | 健康<=0 或 年龄>=100 |
| **显示内容** | 死亡原因、最终称号、总结评语 |
| **最终称号** | 根据属性和经历生成（如"隐形富豪"、"快乐咸鱼"、"顶级韭菜"等） |
| **总结评语** | 随机生成幽默诙谐的人生总结 |
| **重新开始** | 点击"重新开始"重置游戏到LANDING阶段 |

---

## 五、状态管理说明

### GameContext 提供的内容

```typescript
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startSpawning: () => void;           // 开始投胎
  completeSpawning: () => void;        // 完成投胎
  tickYear: (choiceIndex: number, event: GameEvent) => void;  // 进行一年选择
  gameOver: () => void;                // 游戏结束
  resetGame: () => void;               // 重置游戏
  currentEvent: GameEvent | null;      // 当前事件
}
```

### 游戏阶段流转

```
LANDING (展示页面)
    ↓ [点击开始投胎]
SPAWNING (SpawnModal显示)
    ↓ [确认登入]
PLAYING (游戏进行中)
    ↓ [健康归零或100岁]
GAMEOVER (游戏结束)
    ↓ [重新开始]
LANDING (回到展示页面)
```

---

## 六、关键游戏逻辑（已实现）

### 内存数据结构（gameState.ts中）

```typescript
// 游戏阶段
type GamePhase = 'LANDING' | 'SPAWNING' | 'PLAYING' | 'GAMEOVER';

// 家境评级
type FamilyTier = 'SSR' | 'SR' | 'R' | 'IRON';

// 玩家属性
interface PlayerStats {
  age: number;
  health: number;
  maxHealth: number;
  money: number;
  energy: number;
  maxEnergy: number;
  mood: number;
  intelligence: number;
  charm: number;
  karma: number;
}

// 游戏事件
interface GameEvent {
  id: string;
  minAge: number;
  maxAge: number;
  condition?: (stats: PlayerStats) => boolean;
  text: string;
  choices: Array<{
    text: string;
    statChanges: Partial<PlayerStats>;
    followUp?: string;
  }>;
}
```

### 事件库内容（已实现）

- **童年事件(0-6岁)**: 幼儿园朋友等
- **学生时代(6-18岁)**: 小学考试、高考等
- **青年时期(18-35岁)**: 第一份工作、投资、结婚、买房、中年危机等
- **中年时期(35-60岁)**: 健康危机等
- **老年时期(60岁+)**: 退休、生病等
- **随机事件**: 捡钱、失业、同学聚会、股市、初恋、熬夜等

---

## 七、给开发者的TODO清单（验证和完善）

你可以按以下顺序验证和完善项目：

### 阶段 1：项目基础验证

- **TODO 1**: 安装依赖并启动开发服务器，确认项目可以正常运行
- **TODO 2**: 检查所有Section组件是否正确渲染，无控制台错误
- **TODO 3**: 验证ParticleBackground粒子背景正常工作
- **TODO 4**: 验证GlassCard玻璃拟态效果
- **TODO 5**: 测试滚动触发的Framer Motion动画

### 阶段 2：出生抽卡系统验证

- **TODO 6**: 测试SpawnModal打开和关闭
- **TODO 7**: 验证三个阶段（连接服务器、生成DNA、展示结果）的切换
- **TODO 8**: 测试随机生成逻辑（服务器、家境、属性、天赋）
- **TODO 9**: 验证点击确认后进入PLAYING阶段
- **TODO 10**: 验证SpawnTransition出生过渡动画

### 阶段 3：人生模拟游戏验证

- **TODO 11**: 验证进入PLAYING阶段后年龄从0开始
- **TODO 12**: 测试事件触发逻辑（按年龄、条件）
- **TODO 13**: 测试选择对属性的影响
- **TODO 14**: 验证健康衰减机制（>35岁-2，>60岁-5）
- **TODO 15**: 测试随机事件30%触发概率
- **TODO 16**: 验证GameHUD正确显示
- **TODO 17**: 验证DecisionPanel显示事件和选择
- **TODO 18**: 验证LogStream显示游戏日志

### 阶段 4：游戏结束验证

- **TODO 19**: 测试健康归零触发游戏结束
- **TODO 20**: 测试年龄达到100岁触发游戏结束
- **TODO 21**: 验证DeathScreen组件显示
- **TODO 22**: 验证最终称号生成逻辑
- **TODO 23**: 验证总结评语生成
- **TODO 24**: 测试重新开始按钮

### 阶段 5：体验优化

- **TODO 25**: 在不同屏幕尺寸下测试响应式设计（手机、平板、桌面）
- **TODO 26**: 检查页面加载时间和动画流畅度
- **TODO 27**: 验证可访问性（键盘导航、焦点状态、颜色对比度）
- **TODO 28**: 运行TypeScript编译检查，确保无错误
- **TODO 29**: 运行ESLint检查，确保代码质量
- **TODO 30**: 更新app/README.md，添加项目说明和启动步骤

---

## 八、项目启动说明

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

## 九、最终交付标准

1. **项目能正常启动**: `npm install` 和 `npm run dev` 成功执行
2. **概念展示页面完整**: 所有Section组件正确渲染，动画流畅
3. **出生抽卡系统正常**: SpawnModal三个阶段正常，随机生成合理
4. **人生模拟游戏完整**: 从0岁到100岁的完整流程，事件正确触发
5. **游戏HUD正确**: 显示正确的属性、日志、决策面板
6. **游戏结束正常**: 健康归零或100岁触发结束，显示总结
7. **响应式设计**: 在手机、平板、桌面端都能正常显示和交互
8. **性能良好**: 页面加载快，动画流畅，无明显卡顿
9. **代码质量**: 无TypeScript错误，无ESLint错误
10. **文档完善**: README.md包含清晰的项目说明和启动步骤

---

## 十、注意事项

1. **这是纯前端项目**: 不需要开发后端服务，所有数据存储在前端内存
2. **页面刷新数据重置**: MVP版本可以接受，如需持久化可考虑localStorage
3. **不需要多人在线**: 这是单人游戏
4. **不需要付费功能**: 这是纯娱乐项目
5. **游戏已有完整逻辑**: gameState.ts包含完整的游戏逻辑，重点是验证和完善UI交互
6. **关注用户体验**: 确保动画流畅、交互响应迅速、反馈明确
