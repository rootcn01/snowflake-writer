import React, { useState } from 'react';
import { useProject } from '../../store/ProjectContext';
import { generateMarkdown } from '../../utils/export';

export default function TopBar() {
  const { project, dispatch, theme, showToast } = useProject();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(project.title);

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: theme === 'dark' ? 'light' : 'dark' });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const handleTitleClick = () => {
    setEditingTitle(true);
    setTitleValue(project.title);
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (titleValue.trim()) {
      dispatch({ type: 'UPDATE_PROJECT', payload: { title: titleValue.trim() } });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setEditingTitle(false);
      setTitleValue(project.title);
    }
  };

  const handleExport = async () => {
    if (!window.electronAPI) {
      showToast('error', '导出功能仅在Electron中可用');
      return;
    }

    const markdown = generateMarkdown(project);
    const result = await window.electronAPI.exportMarkdown({ project, markdown });

    if (result.canceled) return;

    if (result.success) {
      showToast('success', '导出成功');
    } else {
      showToast('error', '导出失败: ' + result.error);
    }
  };

  return (
    <header className="h-12 bg-bg-secondary border-b border-border flex items-center justify-between px-4">
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-bg-tertiary transition-colors"
          title="切换侧边栏 (Ctrl+\\)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-sm text-text-secondary hidden sm:inline">雪花写作法</span>
      </div>

      {/* Center: Project Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        {editingTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="bg-bg-tertiary text-text-primary text-center px-3 py-1 rounded border border-accent outline-none w-48"
            autoFocus
          />
        ) : (
          <button
            onClick={handleTitleClick}
            className="text-text-primary hover:text-accent transition-colors px-3 py-1 rounded hover:bg-bg-tertiary"
          >
            {project.title}
          </button>
        )}
      </div>

      {/* Right: Theme + Export */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-bg-tertiary transition-colors"
          title="切换主题"
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        <button
          onClick={handleExport}
          className="btn-ghost flex items-center gap-2 text-sm"
          title="导出为Markdown"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span className="hidden sm:inline">导出</span>
        </button>
      </div>
    </header>
  );
}
