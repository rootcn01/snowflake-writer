# 雪花写作法 - Snowflake Writer

一款极简专注的桌面写作工具，将 Randy Ingermanson 的雪花写作法流程嵌入界面，让小说创作变成可量化、可追溯的迭代过程。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-28-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)

## 界面预览

参考 iA Writer + Notion 的混合风格：极度克制的 UI、优秀的排版、适度的微交互。

## 功能特点

### 核心功能

- **3 步核心流程**：一句话概括 → 一段式概括 → 场景列表
- **动态幕数系统**：一段式概括支持 1-10 幕动态调整
- **自动保存**：输入后 2 秒无操作自动保存
- **Markdown 导出**：一键导出完整项目为 .md 文件
- **深色/浅色主题**：一键切换

### 雪花写作法流程

| 步骤 | 功能 | 状态 |
|------|------|------|
| 1. 一句话概括 | 用 15-50 字概括整个故事 | ✅ 完成 |
| 2. 一段式概括 | 用一段话(多幕)概括故事结构 | ✅ 完成 |
| 3. 场景清单 | 列出所有场景及 POV、摘要 | ✅ 完成 |
| 4-10 | 人物概括、角色宝典等 | 🚧 规划中 |

## 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/你的用户名/snowflake-writer.git
cd snowflake-writer

# 安装依赖
npm install

# 启动开发模式
npm run dev
```

### 构建

```bash
# 构建 Web 版本
npm run build

# 构建 Electron 桌面应用
npm run electron:build
```

## 技术栈

- **框架**: Electron 28 + React 18
- **构建**: Vite 5
- **样式**: Tailwind CSS
- **Markdown**: marked.js
- **状态管理**: React Context

## 项目结构

```
snowflake-writer/
├── src/
│   ├── components/          # UI 组件
│   │   ├── ExportModal/     # 导出弹窗
│   │   ├── MarkdownEditor/  # Markdown 编辑器
│   │   ├── Sidebar/         # 侧边栏
│   │   ├── Toast/           # 提示组件
│   │   └── TopBar/          # 顶栏
│   ├── steps/               # 写作步骤页面
│   │   ├── OneSentence/     # 一步总结
│   │   ├── OneParagraph/    # 一段式总结
│   │   └── SceneList/       # 场景列表
│   ├── store/               # React Context
│   ├── utils/               # 工具函数
│   ├── App.jsx
│   └── main.jsx
├── main.js                  # Electron 主进程
├── preload.js               # 预加载脚本
└── package.json
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+\` | 切换侧边栏 |
| `Ctrl+S` | 手动保存 |
| `ESC` | 关闭侧边栏/弹窗 |

## 更新日志

### [v1.0.1](release/v1.0.1) - 2026-04-06

**优化更新**

- ✅ 去掉第一步预览功能
- ✅ 完成自动跳转下一步
- ✅ 第二步动态增删幕数 (1-10幕)
- ✅ 完成最后一步显示导出选项

### [v1.0.0](tree/main) - 2026-04-05

**首发版本**

- ✅ 3 步核心流程
- ✅ 本地 JSON 存储
- ✅ Markdown 导出
- ✅ 深色/浅色主题

## 迭代计划

- [ ] v1.1 - 角色卡片、故事概要、步骤拖拽
- [ ] v1.2 - WYSIWYG 编辑器、自定义步骤
- [ ] v2.0 - 关系图谱、时间线、AI 辅助

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
