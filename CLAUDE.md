# 雪花写作法 - Claude Code 项目指南

## 项目概述

基于 Electron + React + Tailwind CSS 的桌面写作工具，实现 Randy Ingermanson 的雪花写作法流程。

## 技术栈

- **框架**: Electron 28 + React 18
- **构建**: Vite 5
- **样式**: Tailwind CSS (CDN)
- **Markdown**: marked.js
- **状态**: React Context
- **存储**: 本地 JSON (Electron fs)

## 开发命令

```bash
npm run dev      # 启动开发模式 (Vite + Electron)
npm run build    # 构建生产版本
npm run electron:build  # 构建 Electron 安装包
```

## 架构决策

### 为什么用 CDN Tailwind？
- 减少打包体积
- MVP 阶段快速迭代
- 后续可切换到 PostCSS 构建

### 为什么用 Context 而非 Redux/Zustand？
- 项目状态简单，Context 足够
- 避免额外依赖

### 编辑器架构
不同步骤使用不同编辑器策略：
- **Step 4/8/9/10**: 纯 Textarea，编辑器高度自适应窗口，无预览切换
- **其他步骤**: 纯编辑模式

```jsx
// Step 4/8/9/10 直接使用 textarea，高度自适应
<textarea className="h-[calc(100vh-顶部-底部)] ..." />

// MarkdownEditor 统一为纯编辑模式，无切换按钮
<MarkdownEditor />
```

## 文件结构

```
src/
├── components/
│   ├── CollapsibleTips/   # 可折叠提示卡片
│   ├── ExportModal/       # 导出完成弹窗
│   ├── MarkdownEditor/    # Markdown编辑器
│   ├── Sidebar/           # 侧边栏（支持全部10步）
│   ├── Toast/             # 提示组件
│   └── TopBar/            # 顶栏
├── steps/              # 写作步骤页面
│   ├── Chapters/          # Step 10: 初稿（分章节管理）
│   ├── CharacterDetails/  # Step 5: 角色宝典
│   ├── CharacterSummary/  # Step 3: 人物概括
│   ├── CharacterBackstories/ # Step 8: 人物小传
│   ├── OneParagraph/     # Step 2: 一段式概括（动态1-10幕）
│   ├── OneSentence/      # Step 1: 一句话概括
│   ├── SceneDescriptions/ # Step 9: 规划场景
│   ├── SceneList/        # Step 7: 场景清单
│   ├── SceneOutlines/    # Step 6: 完成大纲
│   └── StorySynopsis/    # Step 4: 初步大纲
├── store/               # React Context
└── utils/              # 工具函数 (export.js)
```

## 迭代计划

- v1.0: MVP - 3个核心步骤 + 本地存储 ✅
- v1.1: 角色卡片(Step3/5)、幕数动态增删、自动跳转 ✅
- v1.1.1: UI优化 - 雪花图标、头像上传、双栏布局、完成按钮始终可点 ✅
- v1.2: Step 4初步大纲 ✅、Step 6完成大纲 ✅
- v1.2.1: 大纲优化 - 自动同步Step 2、场景多角色Tag、Tips折叠/灰色细线 ✅
- v1.3: Step 8人物小传 ✅、Step 9规划场景 ✅、沉浸感UI优化 ✅
- v1.4: Step 10初稿 - 分章节管理（左侧章节列表可拖拽排序+右侧编辑器） ✅
- v2.0: 关系图谱、时间线、AI 辅助、WYSIWYG 编辑器、项目库

## 版本完成工作流

每次版本迭代完成时，必须执行以下操作：

1. **更新SPEC文档** (`C:\Users\lotus\.claude\plans\cosmic-noodling-crane.md`)
   - 将完成的特性标记为 `[x]`
   - 更新版本号和状态

2. **更新README.md**
   - 将完成的特性移至"已完成"部分
   - 更新迭代计划
   - 更新项目结构（如有新文件）

3. **更新CLAUDE.md**
   - 同步迭代计划
   - 如有架构变更，更新架构决策说明

4. **Git提交并推送**
   ```bash
   git add .
   git commit -m "chore: v1.x.x - 完成版本特性"
   git push
   ```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+\ | 切换侧边栏 |
| Ctrl+S | 手动保存 |
| ESC | 关闭侧边栏/弹窗 |
