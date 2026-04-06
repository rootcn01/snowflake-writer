# Snowflake Writer - 雪花写作助手

一款极简专注的桌面写作工具，将 [Randy Ingermanson 的雪花写作法](https://www.advancedfictionwriting.com/articles/snowflake-method/) (Snowflake Method) 流程嵌入界面，让小说创作变成可量化、可追溯的迭代过程。

## 界面风格

参考 iA Writer + Notion 的混合：极度克制的 UI、优秀的排版、适度的微交互。界面是"透明的"——让内容成为主角。

## 功能特性

### 完整 10 步流程

- **Step 1: 一句话概括** - 用 15-50 字概括整个故事
- **Step 2: 一段式概括** - 动态 1-10 幕结构，每幕 30-80 字，与 Step 4 实时同步
- **Step 3: 人物概括** - 左右分栏布局（角色列表 | 角色详情），支持标签筛选、自定义头像
- **Step 4: 初步大纲** - 左侧可折叠大纲浮层（显示章节结构），与 Step 2 双向同步，**Tiptap WYSIWYG 编辑**
- **Step 5: 角色宝典** - 数据与 Step 3 同步，基础/详细模板切换，自定义字段
- **Step 6: 完成大纲** - 左右分栏布局（场景列表 | 场景详情），@提及风格角色选择
- **Step 7: 场景清单** - 场景列表与摘要，支持列表/时间线视图切换
- **Step 8: 人物小传** - 数据与 Step 3 同步，**Tiptap WYSIWYG 编辑**
- **Step 9: 规划场景** - 左侧场景列表 + 右侧编辑器，**Tiptap WYSIWYG 编辑**
- **Step 10: 初稿** - 码字界面：左侧大纲面板、底部状态栏（字数/时间）、专注模式，**Tiptap WYSIWYG 编辑**

### 可视化工具

- **关系图谱** - 角色/场景关系可视化，支持血缘、冲突、爱情、朋友等关系类型
- **时间线** - 故事时间轴视图（早期/中期/晚期），拖拽调整场景顺序

### 项目管理

- **项目库** - 卡片网格视图，支持新建/打开/删除/复制/导出项目
- **备份功能** - 自动备份（保存时触发，保留5个版本）+ 手动备份

### 高级功能

- **WYSIWYG 编辑器** - 全局 Tiptap 替换，固定工具栏（粗体/斜体/标题/列表/链接等），Markdown 快捷键兼容
- **自定义工作流** - 标准版（10步）/ 精简版（7步跳过5/8/9），每步可见性独立开关
- **多格式导出** - Markdown / Obsidian 模板（wiki-links）/ Notion 模板 / PDF / EPUB
- **AI 辅助写作** - 支持 OpenAI API、Claude API、本地模型（Ollama、LM Studio），语法检查/写作建议/润色/续写

### 沉浸感优化

- Tips 极简一行样式，点击展开
- 侧边栏默认收起，快捷键 Ctrl+\ 呼出
- 自动保存（2秒防抖）
- 进度条移除

## 技术栈

- **框架**: Electron 28 + React 18
- **构建**: Vite 5
- **样式**: Tailwind CSS (PostCSS)
- **Markdown**: marked.js
- **状态**: React Context
- **存储**: 本地 JSON (Electron fs)

## 开发

```bash
# 安装依赖
npm install

# 启动开发模式
npm run dev

# 构建生产版本
npm run build

# 构建 Electron 安装包
npm run electron:build
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+P | 打开项目库 |
| Ctrl+\ | 切换侧边栏 |
| Ctrl+S | 手动保存 |
| ESC | 关闭侧边栏/弹窗 |

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── AIAssistant/     # AI 写作助手
│   ├── BackupModal/     # 备份管理弹窗
│   ├── CollapsibleTips/ # 可折叠提示卡片
│   ├── ExportModal/     # 导出完成弹窗
│   ├── MarkdownEditor/  # Markdown编辑器
│   ├── RelationGraph/   # 关系图谱可视化
│   ├── SettingsModal/  # 工作流设置弹窗
│   ├── Sidebar/        # 侧边栏
│   ├── Timeline/       # 时间线视图
│   ├── TiptapEditor/   # Tiptap WYSIWYG 编辑器
│   ├── Toast/          # 提示组件
│   └── TopBar/         # 顶栏
├── steps/               # 写作步骤页面
│   ├── Chapters/              # Step 10: 初稿
│   ├── CharacterBackstories/  # Step 8: 人物小传
│   ├── CharacterDetails/     # Step 5: 角色宝典
│   ├── CharacterSummary/     # Step 3: 人物概括
│   ├── OneParagraph/         # Step 2: 一段式概括
│   ├── OneSentence/          # Step 1: 一句话概括
│   ├── SceneDescriptions/    # Step 9: 规划场景
│   ├── SceneList/           # Step 7: 场景清单
│   ├── SceneOutlines/        # Step 6: 完成大纲
│   └── StorySynopsis/        # Step 4: 初步大纲
├── pages/
│   └── ProjectLibrary/       # 项目库页面
├── store/               # React Context
└── utils/              # 工具函数
```

## 迭代计划

| 版本 | 内容 | 状态 |
|------|------|------|
| v1.0 | MVP - 3个核心步骤 + 本地存储 | ✅ |
| v1.1 | 角色卡片(Step3/5)、幕数动态增删 | ✅ |
| v1.1.1 | UI优化 - 雪花图标、头像、双栏布局 | ✅ |
| v1.2 | Step 4初步大纲、Step 6完成大纲 | ✅ |
| v1.2.1 | 大纲优化 - 自动同步、场景多角色Tag | ✅ |
| v1.3 | Step 8人物小传、Step 9规划场景 | ✅ |
| v1.4 | Step 10初稿 - 分章节管理 | ✅ |
| v1.4.1 | Tips极简、TopBar下拉选择器 | ✅ |
| v1.4.2 | Step 3标签化、Step 2/4静默同步 | ✅ |
| v2.0.1 | Bug修复 - 菜单栏禁用、Step 2/4双向同步 | ✅ |
| v2.0.2 | UI优化 - Step 3/6分栏、Step 4大纲浮层 | ✅ |
| v2.0.3 | 数据打通 - 角色数据同步、自定义模板 | ✅ |
| v2.0.4 | Step 10码字界面升级、专注模式 | ✅ |
| v2.1 | 项目库管理 | ✅ |
| v2.2 | 关系图谱 | ✅ |
| v2.3 | 时间线 | ✅ |
| v2.4 | 备份功能 | ✅ |
| v2.5 | WYSIWYG编辑器（Tiptap全局替换） | ✅ |
| v2.6 | 自定义工作流（每步可见性开关） | ✅ |
| v2.7 | 导出功能升级（多格式/模板） | ✅ |
| v2.8 | AI辅助写作（OpenAI兼容协议） | ✅ |

## License

MIT
