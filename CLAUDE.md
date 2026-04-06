# 雪花写作法 - Claude Code 项目指南

## 项目概述

基于 Electron + React + Tailwind CSS 的桌面写作工具，实现 Randy Ingermanson 的雪花写作法流程。

## 技术栈

- **框架**: Electron 28 + React 18
- **构建**: Vite 5
- **样式**: Tailwind CSS (PostCSS)
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
│   ├── BackupModal/      # 备份管理弹窗
│   ├── CollapsibleTips/ # 可折叠提示卡片
│   ├── ExportModal/     # 导出完成弹窗
│   ├── MarkdownEditor/  # Markdown编辑器
│   ├── RelationGraph/   # 关系图谱可视化
│   ├── Sidebar/        # 侧边栏（支持全部10步+项目库）
│   ├── Timeline/       # 时间线视图
│   ├── Toast/          # 提示组件
│   └── TopBar/         # 顶栏
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
├── pages/
│   └── ProjectLibrary/   # 项目库页面
├── store/               # React Context
└── utils/              # 工具函数 (export.js, markdownUtils.js)
```

## 文档与计划管理

### 文档结构

| 文档 | 用途 | 维护方式 |
|------|------|----------|
| `CLAUDE.md` | 项目指南、架构决策、快捷键 | 随代码更新 |
| `cosmic-noodling-crane.md` | SPEC 设计文档 | 稳定设计，一次性更新 |
| `lexical-scribbling-truffle.md` | V2.0 迭代计划 | 版本发布后更新 |
| `twinkling-prancing-rabin.md` | Issue 讨论与方案 | 讨论时独立，最终同步 |

### Issue 讨论流程

1. **讨论阶段**: 每个 Issue 独立讨论，形成方案后写入独立计划文件
2. **确认阶段**: 用户确认方案后，同步更新:
   - SPEC (`cosmic-noodling-crane.md`) - 更新设计细节
   - V2 迭代计划 (`lexical-scribbling-truffle.md`) - 更新版本分配与完成状态
3. **实施阶段**: 按确认的方案实现

### 文档维护原则

- **CLAUDE.md**: 随代码更新，保持开发命令、文件结构、快捷键等与代码同步
- **SPEC**: 稳定设计，UI/功能变更后更新（版本发布节点）
- **V2迭代计划**: 版本发布后更新实际实现摘要
- **Issue追踪**: 讨论时独立，版本完成后同步状态

> 重要：每次功能迭代完成后，必须检查并更新所有相关文档（见"功能迭代流程"）

### 为什么分离？

- SPEC 是"设计圣经"，保持稳定性和可读性
- Issue 计划文件方便讨论、迭代、修改
- 两者通过 Issue 关联，不容易丢失上下文

## 迭代计划

- v1.0: MVP - 3个核心步骤 + 本地存储 ✅
- v1.1: 角色卡片(Step3/5)、幕数动态增删、自动跳转 ✅
- v1.1.1: UI优化 - 雪花图标、头像上传、双栏布局、完成按钮始终可点 ✅
- v1.2: Step 4初步大纲 ✅、Step 6完成大纲 ✅
- v1.2.1: 大纲优化 - 自动同步Step 2、场景多角色Tag、Tips折叠/灰色细线 ✅
- v1.3: Step 8人物小传 ✅、Step 9规划场景 ✅、沉浸感UI优化 ✅
- v1.4: Step 10初稿 - 分章节管理（左侧章节列表可拖拽排序+右侧编辑器） ✅
- v1.4.1: 沉浸感优化 - Tips极简一行、Step 5/8/9/10 TopBar下拉选择器（移除左侧面板） ✅
- v1.4.2: Step 3标签化+筛选+自定义备注、标题统一、Step 2/4静默同步、Step 6@提及风格、进度条移除 ✅
- v2.0.1: Bug修复 - 菜单栏禁用、Step 2/4 双向同步 ✅
- v2.0.2: UI优化 - Step 3/6 分栏布局、Step 4 大纲浮层 ✅
- v2.0.3: 数据打通 - 角色数据同步（Step 3/5/8）、角色属性自定义模板 ✅
- v2.0.4: Step 10 码字界面升级 - 左侧大纲、状态栏、专注模式 ✅
- v2.1: 项目库管理 - 项目列表、新建/打开/删除/复制/导出项目 ✅
- v2.2: 关系图谱 - 角色/场景关系可视化 ✅
- v2.3: 时间线 - 故事时间轴视图 ✅
- v2.4: 备份功能 - 自动/手动备份与恢复 ✅
- v2.5+: AI辅助、WYSIWYG编辑器 ⏳ 待开始

## V2.0 版本规划

| 版本 | 内容 | 优先级 | 状态 |
|------|------|--------|------|
| 2.0.1 | Bug修复：菜单栏隐藏、Step 2/4 双向同步 | P0 | ✅ 已完成 |
| 2.0.2 | 功能迭代：Step 3/6 分栏布局、Step 4 大纲浮层 | P1 | ✅ 已完成 |
| 2.0.3 | 数据打通：角色数据同步、属性自定义 | P1 | ✅ 已完成 |
| 2.0.4 | 高级功能：Step 10 码字界面升级 | P2 | ✅ 已完成 |
| 2.1 | 项目库管理 | P2 | ✅ 已完成 |
| 2.2 | 关系图谱 | P2 | ✅ 已完成 |
| 2.3 | 时间线 | P2 | ✅ 已完成 |
| 2.4 | 备份功能 | P2 | ✅ 已完成 |
| 2.5 | AI辅助写作 | P3 | ⏳ 待开始 |
| 2.6 | WYSIWYG编辑器 | P3 | ⏳ 待开始 |

## 版本发布流程

> 日常开发：直接 push，不打包
> 发布稳定版本：构建 + Releases 上传

### 日常开发
1. **开发 & 测试**
   - 开发在 feature 分支进行
   - 测试验证完成后合并到 main

2. **Git 提交并推送**
   ```bash
   git add .
   git commit -m "feat: v1.x.x - 版本特性"
   git push
   ```

3. **本地测试构建**（可选）
   ```bash
   npm run electron:build
   ```

### 发布稳定版本
1. **确认代码稳定**，合并到 main

2. **构建打包**
   ```bash
   npm run electron:build
   ```

3. **创建 GitHub Release**
   - 推送 tag：`git tag v1.x.x && git push origin v1.x.x`
   - 打包 `release/win-unpacked/` 为 zip
   - 在 GitHub Releases 页面上传 zip

4. **本地清理**
   - 删除 `release/` 目录节省空间

## 功能迭代流程

> 每次完成功能迭代后，必须完成以下文档维护步骤：

### 1. 代码实现
- 按确认方案实现功能
- 本地测试验证

### 2. 文档维护
完成功能后，同步更新以下文档：

| 文档 | 更新内容 |
|------|----------|
| `CLAUDE.md` | 文件结构（新增组件）、迭代计划、V2版本规划表 |
| `SPEC` | 数据模型、组件描述、UI布局（若变更） |
| `V2迭代计划` | 实际实现摘要、新增/修改文件列表、验证方式 |
| `Issue追踪` | Issue状态、版本分配（若涉及） |

### 3. 文档一致性检查清单
- [ ] 文件结构与实际新增组件是否一致
- [ ] 数据模型是否反映最新字段（如 relationships）
- [ ] V2版本规划表状态是否正确（✅/⏳）
- [ ] 迭代计划是否包含最新版本
- [ ] SPEC布局图/组件描述是否与UI一致
- [ ] Issue追踪的未实现功能是否标记（如 #5b/#8）
- [ ] 删除不再使用的过时引用

### 4. 构建验证
```bash
npm run build  # 确保无构建错误
```

### 5. Git提交
```bash
git add .
git commit -m "feat: v2.x.x - 功能描述 + 文档更新"
git push
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+P | 打开项目库 |
| Ctrl+\ | 切换侧边栏 |
| Ctrl+S | 手动保存 |
| ESC | 关闭侧边栏/弹窗 |
