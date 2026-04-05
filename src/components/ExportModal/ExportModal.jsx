import React from 'react';
import { useProject } from '../../store/ProjectContext';

export default function ExportModal() {
  const { project, dispatch, showToast } = useProject();

  const handleExport = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.exportProject(project);
      if (result.success) {
        showToast('success', '导出成功！');
        dispatch({ type: 'SET_SHOW_EXPORT_MODAL', payload: false });
      } else {
        showToast('error', '导出失败: ' + result.error);
      }
    }
  };

  const handleClose = () => {
    dispatch({ type: 'SET_SHOW_EXPORT_MODAL', payload: false });
  };

  const handleJumpToStep = (stepIndex) => {
    dispatch({ type: 'SET_STEP', payload: stepIndex });
    dispatch({ type: 'SET_SHOW_EXPORT_MODAL', payload: false });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-bg-secondary rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">恭喜完成初稿！</h2>
          <p className="text-sm text-text-secondary mt-1">你已完成雪花写作法的核心步骤</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Export Option */}
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-4 p-4 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">导出为 Markdown</p>
                <p className="text-xs text-text-secondary">将项目导出为 .md 文件</p>
              </div>
            </button>

            {/* Continue perfecting */}
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">继续完善</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleJumpToStep(7)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-bg-tertiary transition-colors text-left"
                >
                  <span className="w-6 h-6 rounded-full bg-bg-tertiary flex items-center justify-center text-xs text-text-secondary">8</span>
                  <span className="text-sm text-text-primary">人物小传</span>
                </button>
                <button
                  onClick={() => handleJumpToStep(8)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-bg-tertiary transition-colors text-left"
                >
                  <span className="w-6 h-6 rounded-full bg-bg-tertiary flex items-center justify-center text-xs text-text-secondary">9</span>
                  <span className="text-sm text-text-primary">规划场景</span>
                </button>
                <button
                  onClick={() => handleJumpToStep(9)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-bg-tertiary transition-colors text-left"
                >
                  <span className="w-6 h-6 rounded-full bg-bg-tertiary flex items-center justify-center text-xs text-text-secondary">10</span>
                  <span className="text-sm text-text-primary">初稿撰写</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <button
            onClick={handleClose}
            className="btn-secondary"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}