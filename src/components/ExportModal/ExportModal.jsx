import React from 'react';
import { useProject } from '../../store/ProjectContext';
import { generateMarkdown } from '../../utils/export';

export default function ExportModal({ onClose }) {
  const { project, showToast } = useProject();

  const handleExport = async () => {
    try {
      const markdown = generateMarkdown(project);
      if (window.electronAPI) {
        const result = await window.electronAPI.exportMarkdown(markdown, project.title || '未命名');
        if (result.success) {
          showToast('success', '导出成功！');
          onClose();
        } else {
          showToast('error', '导出失败: ' + result.error);
        }
      } else {
        // Fallback for browser
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title || '未命名'}.md`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('success', '导出成功！');
        onClose();
      }
    } catch (error) {
      showToast('error', '导出失败: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-bg-secondary rounded-lg shadow-xl max-w-md w-full mx-4 animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">导出项目</h2>
          <p className="text-sm text-text-secondary mt-1">选择你想要的操作</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-4 p-4 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors text-left"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-accent/20">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">导出为 Markdown</p>
              <p className="text-xs text-text-secondary">生成 .md 文件保存到本地</p>
            </div>
          </button>

          <button
            onClick={onClose}
            className="w-full flex items-center gap-4 p-4 rounded-lg bg-bg-tertiary hover:bg-bg-tertiary/80 transition-colors text-left"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-tertiary">
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">继续完善</p>
              <p className="text-xs text-text-secondary">返回项目继续编辑</p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}