import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../../store/ProjectContext';
import { generateMarkdown } from '../../utils/export';

export default function TopBar() {
  const { project, dispatch, theme, showToast, topBarSelector } = useProject();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(project.title);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef(null);

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

  // Close selector when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setSelectorOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-12 bg-bg-secondary border-b border-border flex items-center justify-between px-4">
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-bg-tertiary transition-colors"
          title="切换侧边栏 (Ctrl+\\)"
        >
          <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L9.5 8.5L3 12l6.5 3.5L12 22l2.5-6.5L21 12l-6.5-3.5L12 2zm0 4.5l1.2 3.2L17 10l-3.8 2.2L12 17l-1.2-3.2L7 10l3.8-2.2L12 6.5z"/>
          </svg>
        </button>
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

      {/* Right: Selector + Theme + Export */}
      <div className="flex items-center gap-2">
        {/* TopBar Selector Dropdown */}
        {topBarSelector && (
          <div ref={selectorRef} className="relative">
            <button
              onClick={() => setSelectorOpen(!selectorOpen)}
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              <span className="text-lg">{topBarSelector.icon || '📋'}</span>
              <span className="hidden sm:inline">{topBarSelector.label}</span>
              <svg className={`w-4 h-4 transition-transform ${selectorOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {selectorOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-bg-secondary border border-border rounded-md shadow-lg z-50">
                <div className="py-1 max-h-64 overflow-y-auto">
                  {topBarSelector.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        topBarSelector.onSelect(item.id);
                        setSelectorOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-bg-tertiary flex items-center justify-center text-xs text-text-secondary">
                        {item.index + 1}
                      </span>
                      <span className="flex-1 text-left truncate">{item.name}</span>
                      {item.hasContent && (
                        <span className="w-2 h-2 rounded-full bg-success" />
                      )}
                    </button>
                  ))}
                </div>
                {topBarSelector.onAdd && (
                  <div className="border-t border-border">
                    <button
                      onClick={() => {
                        topBarSelector.onAdd();
                        setSelectorOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-accent hover:bg-bg-tertiary transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      添加新{topBarSelector.label}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
