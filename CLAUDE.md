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
`MarkdownEditor` 组件预留 WYSIWYG 升级接口：
```jsx
<MarkdownEditor mode="edit" />   // 当前: Textarea
<MarkdownEditor mode="preview" /> // marked.js 渲染
```

## 文件结构

```
src/
├── components/     # UI 组件 (TopBar, Sidebar, Toast...)
├── steps/          # 写作步骤页面 (OneSentence, OneParagraph, SceneList)
├── store/          # React Context
└── utils/          # 工具函数 (export.js)
```

## 迭代计划

- v1.0: MVP (当前) - 3个核心步骤 + 本地存储
- v1.0.1: 优化 - 自动跳转、动态幕数、导出弹窗
- v1.1: 角色卡片、故事概要、步骤拖拽
- v1.2: WYSIWYG 编辑器、自定义步骤
- v2.0: 关系图谱、时间线、AI 辅助

### v1.0.1 优化内容
- [x] 去掉第一步预览功能
- [x] 完成自动跳转下一步
- [x] 第二步动态增删幕数 (1-10幕)
- [x] 完成最后一步显示导出选项

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+\ | 切换侧边栏 |
| Ctrl+S | 手动保存 |
| ESC | 关闭侧边栏/弹窗 |
