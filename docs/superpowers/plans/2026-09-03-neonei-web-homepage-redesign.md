# NeoNEI-Web 主页三栏经典游戏化与多端自适应实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 `superpowers:subagent-driven-development` 或 `superpowers:executing-plans` 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 `NeoNEI-Web` 首页重构为经典游戏内 NEI 三栏沉浸式布局（左侧折叠模组轨 + 居中默认留空/展开拟真配方坞站 + 右侧全景自适应容量物品矩阵 + 底部居中搜索栏），并实现 4K、1080p、平板与手机端的多端视觉平衡与 GUI 缩放控制。

**架构：** 保持核心 `NativeSurface` 纯 Canvas 60 FPS 渲染内核不变。外层重构为响应式 CSS Grid/Flex 分区，引入 `ResizeObserver` 动态计算右侧物品网格容量矩阵（$\text{cols} \times \text{rows}$），配方浮层采用拟真游戏石质立体外壳与机种 Tab 切换，集成拼音/模组前缀搜索与全局 NEI 快捷键。

**技术栈：** Vue 3 (Composition API, `<script setup>`), TypeScript 5, Vite 6, Tailwind/Custom CSS Modules, Node.js Native Test Runner.

---

## 拟定文件结构与职责边界

```
web/frontend/
├── src/
│   ├── surface/
│   │   ├── capacity-matrix.ts      # [新建] 毫秒级视口物理尺寸与行列容量动态计算逻辑
│   │   └── search-filter.ts        # [新建] 拼音首字母、@mod、$ore 与纯文本多维度检索算法
│   ├── components/
│   │   ├── layout/
│   │   │   ├── LeftRail.vue        # [新建] 左侧模组筛选、设置与折叠导轨
│   │   │   ├── BottomSearchBar.vue # [新建] 经典 NEI 底部居中搜索框（带右键清空）
│   │   │   └── GuiScaleControl.vue # [新建] 游戏同款 GUI 缩放滑块与档位切换
│   │   ├── browser/
│   │   │   ├── ItemBrowserPanel.vue# [新建] 右侧全景物品矩阵与星微之光胶囊翻页器
│   │   │   └── HistoryStrip.vue    # [新建] 顶部最近浏览历史微缩徽标栏
│   │   ├── dock/
│   │   │   └── RecipeDockModal.vue # [新建] 居中经典拟真配方坞站（含机种Tab与NativeSurface嵌入）
│   │   ├── NativeSurface.vue       # [已有] 纯像素 Canvas 渲染内核
│   │   └── RecipeTooltip.vue       # [已有] 原版暗紫边框悬浮提示框
│   ├── App.vue                     # [修改] 组装多端三栏自适应断点与全局按键监听
│   └── types.ts                    # [修改] 补充物品搜索与布局配置接口
└── test/
    ├── capacity-matrix.test.js     # [新建] 容量感知算式单元测试
    ├── search-filter.test.js       # [新建] 拼音与多维度搜索单元测试
    └── atlas.test.js               # [已有]
```

---

## 任务执行清单

### 任务 1：物品矩阵容量感知引擎 (`capacity-matrix.ts` + 单元测试)

**文件：**
- 创建：`web/frontend/src/surface/capacity-matrix.ts`
- 测试：`web/frontend/test/capacity-matrix.test.js`

- [ ] **步骤 1：编写容量感知与行列计算失败测试**
  在 `web/frontend/test/capacity-matrix.test.js` 针对 4K (`3840x2160`)、1080p (`1920x1080`)、平板 (`1024x768`) 与紧凑视口编写断言。
- [ ] **步骤 2：运行测试验证失败**
  运行：`npm --prefix web/frontend test`
  预期：FAIL，找不到 `capacity-matrix.ts`。
- [ ] **步骤 3：实现 `calculateCapacityMatrix` 纯函数**
  在 `web/frontend/src/surface/capacity-matrix.ts` 实现精确下取整与最小安全边界（至少 1 行 1 列）。
- [ ] **步骤 4：运行测试验证通过**
  运行：`npm --prefix web/frontend test`
  预期：PASS。
- [ ] **步骤 5：Git Commit**
  提交信息：`feat: implement dynamic capacity matrix calculation engine`

---

### 任务 2：拼音与多维度搜索过滤器 (`search-filter.ts` + 单元测试)

**文件：**
- 创建：`web/frontend/src/surface/search-filter.ts`
- 测试：`web/frontend/test/search-filter.test.js`

- [ ] **步骤 1：编写拼音首字母、@mod、$ore 过滤测试**
  在 `test/search-filter.test.js` 针对中文拼音首字母匹配（如 `jcdl` $\rightarrow$ `基础电路板`）、模组过滤（`@gregtech`）、矿词过滤（`$circuit`）编写用例。
- [ ] **步骤 2：运行测试验证失败**
  运行：`npm --prefix web/frontend test`
  预期：FAIL。
- [ ] **步骤 3：编写 `filterItems` 与拼音映射算法**
  实现轻量级拼音首字母字典匹配与语法解析器。
- [ ] **步骤 4：运行测试验证通过**
  运行：`npm --prefix web/frontend test`
  预期：PASS。
- [ ] **步骤 5：Git Commit**
  提交信息：`feat: add pinyin and syntax-aware search filter engine`

---

### 任务 3：右侧全景物品网格与历史记录组件 (`ItemBrowserPanel.vue` & `HistoryStrip.vue`)

**文件：**
- 创建：`web/frontend/src/components/browser/HistoryStrip.vue`
- 创建：`web/frontend/src/components/browser/ItemBrowserPanel.vue`
- 修改：`web/frontend/src/types.ts`

- [ ] **步骤 1：编写 `HistoryStrip.vue`**
  实现顶部横向最近浏览 8 个物品图标、高亮选态与点击事件发射。
- [ ] **步骤 2：编写 `ItemBrowserPanel.vue`**
  集成 `ResizeObserver` 动态挂接 `calculateCapacityMatrix`；
  集成顶部“星微之光”胶囊翻页（`01 / N`）与左右箭头；
  网格内渲染物品槽位、角标、Tooltip 悬浮；
  左键触发 `item-recipe (R)`，右键触发 `item-usage (U)`，滚轮支持翻页。
- [ ] **步骤 3：组件与类型校验**
  运行：`npm --prefix web/frontend run build` 确保 TypeScript 零错误。
- [ ] **步骤 4：Git Commit**
  提交信息：`feat: implement responsive item browser panel and history strip`

---

### 任务 4：居中经典拟真配方坞站组件 (`RecipeDockModal.vue`)

**文件：**
- 创建：`web/frontend/src/components/dock/RecipeDockModal.vue`
- 引用：`web/frontend/src/components/NativeSurface.vue`

- [ ] **步骤 1：编写拟真游戏石质立体外框结构与样式**
  立体凹凸边框（`#161B22` / `#21262D`），顶部右上角 `×` 关闭按钮，左上角 `←` / `→` 历史回退键。
- [ ] **步骤 2：实现机种类别 Tab 切换与数量角标**
  根据当前物品参与的所有机器（如工作台、组装机、电弧炉等）渲染 Tab 栏，展示 `组装机 (14)` 等配方数。
- [ ] **步骤 3：内嵌 `NativeSurface.vue` 纯像素 Canvas**
  传入当前分类下的配方列表与子翻页器（`Page X / Y`）；
  监听槽位点击事件：递归触发更深层原料的合成/用途查询；
  记录 `recipeHistoryStack`，支持 `Backspace` / `←` 一键回溯。
- [ ] **步骤 4：构建验证**
  运行：`npm --prefix web/frontend run build`。
- [ ] **步骤 5：Git Commit**
  提交信息：`feat: implement in-game style recipe dock modal with NativeSurface embed`

---

### 任务 5：左侧轨、底部居中搜索栏与 GUI 缩放滑块

**文件：**
- 创建：`web/frontend/src/components/layout/LeftRail.vue`
- 创建：`web/frontend/src/components/layout/BottomSearchBar.vue`
- 创建：`web/frontend/src/components/layout/GuiScaleControl.vue`

- [ ] **步骤 1：编写 `LeftRail.vue`**
  大屏为 220px 模组选择列表与筛选控制台；平板下自动折叠为 48px 图标悬浮轨；手机端通过按钮弹出。
- [ ] **步骤 2：编写 `BottomSearchBar.vue`**
  横向绝对居中，仿 NEI 暗光输入框；
  支持 `Ctrl + F` 自动聚焦；右键点击快速清空文本。
- [ ] **步骤 3：编写 `GuiScaleControl.vue`**
  提供 Auto、Compact (36px)、Normal (44px)、Large (54px) 四档切换与滑块；
  修改即时广播并持久化至 `localStorage`。
- [ ] **步骤 4：构建验证**
  运行：`npm --prefix web/frontend run build`。
- [ ] **步骤 5：Git Commit**
  提交信息：`feat: add left rail, bottom centered search bar, and gui scale control`

---

### 任务 6：主页组装、多端断点联调与全局按键 (`App.vue` 终态重构)

**文件：**
- 修改：`web/frontend/src/App.vue`

- [ ] **步骤 1：重构 `App.vue` 整体网格布局**
  集成 `LeftRail`、居中留空呼吸态 / `RecipeDockModal`、`ItemBrowserPanel` 与 `BottomSearchBar`。
- [ ] **步骤 2：实现默认留空态的沉浸式视觉底纹**
  深色金属质感、淡入淡出的提示水印与最近查看的 5 个快捷微标（Quick Chips）。
- [ ] **步骤 3：移动端拟真抽屉适配（Bottom Sheet）**
  在视口宽 $< 768\text{px}$ 时，将配方坞站自动渲染为底部滑出抽屉，支持向下滑动关闭。
- [ ] **步骤 4：注册全局快捷键**
  按 `Esc` 关闭配方坞站；按 `Backspace` 历史回退；悬浮按 `R` / `U` 打开配方；按 `Ctrl + F` 聚焦搜索。
- [ ] **步骤 5：构建验证**
  运行：`npm --prefix web/frontend run build`。
- [ ] **步骤 6：Git Commit**
  提交信息：`feat: assemble multi-device responsive in-game three-column homepage`

---

### 任务 7：全系统验证、多分辨率实测与推送

**文件：**
- 运行验证：全部单测、生产打包、动态页面热预览

- [ ] **步骤 1：执行全量自动化测试**
  运行：`npm --prefix web test`，确认所有测试 100% 绿灯通过。
- [ ] **步骤 2：执行全量生产打包**
  运行：`npm --prefix web/frontend run build`，验证打包体积依然保持在 $< 50\text{KB}$ (gzip)。
- [ ] **步骤 3：多分辨率模拟检查**
  在 `http://127.0.0.1:5173/` 模拟 4K、1080p、iPad (1024x768) 与 iPhone (390x844)，检查视觉重心与交互手感。
- [ ] **步骤 4：Git Push 远端同步**
  将完整交付物推送到 GitHub `CaeliaEve/NeoNEI-Web` 仓库。
