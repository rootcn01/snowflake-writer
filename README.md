# Snowflake Writer - 雪花写作助手

一款极简专注的桌面写作工具，将 [Randy Ingermanson 的雪花写作法](https://www.advancedfictionwriting.com/articles/snowflake-method/) (Snowflake Method) 流程嵌入界面，让小说创作变成可量化、可追溯的迭代过程。

## 界面风格

参考 iA Writer + Notion 的混合：极度克制的 UI、优秀的排版、适度的微交互。界面是"透明的"——让内容成为主角。

## 功能特性

### 已完成

- **Step 1: 一句话概括** - 用 15-50 字概括整个故事
- **Step 2: 一段式概括** - 动态 1-10 幕结构，每幕 30-80 字
- **Step 3: 人物概括** - 角色卡片（头像、类型、目标、冲突、感悟），支持本地上传自定义头像
- **Step 4: 初步大纲** - 自动从Step 2同步生成，纯Markdown编辑模式，高度自适应（min-height: 400px）
- **Step 5: 角色宝典** - 双栏布局，角色详细信息管理（姓名、年龄、外貌、背景、欲望、恐惧、价值观、关键时刻）
- **Step 6: 完成大纲** - 场景4句话描述（时间、地点、目标、结局），支持多角色关联（Tag形式）
- **Step 7: 场景清单** - 场景列表与摘要
- **Step 8: 人物小传** - 左侧角色选择 + 右侧编辑器，纯编辑模式，自动保存
- **Step 9: 规划场景** - 左侧场景列表 + 右侧编辑器，与Step 8布局统一

### 开发中

- Step 10: 初稿撰写

## 技术栈

- **框架**: Electron 28 + React 18
- **构建**: Vite 5
- **样式**: Tailwind CSS (CDN)
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
| Ctrl+\ | 切换侧边栏 |
| Ctrl+S | 手动保存 |
| ESC | 关闭侧边栏/弹窗 |

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── CollapsibleTips/ # 可折叠提示卡片
│   ├── ExportModal/     # 导出完成弹窗
│   ├── MarkdownEditor/  # Markdown编辑器
│   ├── Sidebar/         # 侧边栏
│   ├── Toast/           # 提示组件
│   └── TopBar/          # 顶栏
├── steps/               # 写作步骤页面
│   ├── CharacterBackstories/  # Step 8: 人物小传
│   ├── CharacterDetails/     # Step 5: 角色宝典
│   ├── CharacterSummary/     # Step 3: 人物概括
│   ├── OneParagraph/         # Step 2: 一段式概括
│   ├── OneSentence/          # Step 1: 一句话概括
│   ├── SceneDescriptions/    # Step 9: 规划场景
│   ├── SceneList/            # Step 7: 场景清单
│   ├── SceneOutlines/        # Step 6: 完成大纲
│   └── StorySynopsis/        # Step 4: 初步大纲
├── store/               # React Context
└── utils/              # 工具函数
```

## 迭代计划

- v1.0: MVP - 3个核心步骤 + 本地存储 ✅
- v1.1: 角色卡片(Step3/5)、幕数动态增删、自动跳转 ✅
- v1.1.1: UI优化 - 雪花图标、头像上传、双栏布局、完成按钮始终可点 ✅
- v1.2: Step 4初步大纲 ✅、Step 6完成大纲 ✅
- v1.2.1: 大纲优化 - 自动同步Step 2、场景多角色Tag、Tips折叠/灰色细线 ✅
- v1.3: Step 8人物小传 ✅、Step 9规划场景 ✅、沉浸感UI优化 ✅
- v1.4: Step 10初稿撰写
- v2.0: 关系图谱、时间线、AI 辅助、WYSIWYG 编辑器、项目库

## License

MIT