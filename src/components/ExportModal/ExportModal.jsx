import React, { useState } from 'react';
import { useProject } from '../../store/ProjectContext';
import { generateMarkdown, generateMarkdownExport } from '../../utils/export';
import { tiptapToMarkdown, isTiptapJson } from '../../utils/tiptapUtils';

export default function ExportModal() {
  const { project, dispatch, showToast } = useProject();
  const [exportFormat, setExportFormat] = useState('markdown');
  const [exporting, setExporting] = useState(false);

  const handleClose = () => {
    dispatch({ type: 'SET_SHOW_EXPORT_MODAL', payload: false });
  };

  const handleExport = async () => {
    if (!window.electronAPI) {
      showToast('error', '导出功能仅在Electron中可用');
      return;
    }

    setExporting(true);

    try {
      let markdown;

      // Generate markdown from project
      if (exportFormat === 'markdown') {
        markdown = generateMarkdown(project);
        const result = await window.electronAPI.exportMarkdown({ project, markdown });
        if (result.canceled) {
          setExporting(false);
          return;
        }
        if (result.success) {
          showToast('success', 'Markdown 导出成功');
        } else {
          showToast('error', '导出失败: ' + result.error);
        }
      } else if (exportFormat === 'obsidian') {
        markdown = generateMarkdownExport(project);
        const result = await window.electronAPI.exportMarkdown({ project, markdown });
        if (result.canceled) {
          setExporting(false);
          return;
        }
        if (result.success) {
          showToast('success', 'Obsidian 模板导出成功');
        } else {
          showToast('error', '导出失败: ' + result.error);
        }
      } else if (exportFormat === 'notion') {
        // Notion export is essentially markdown with specific formatting
        markdown = generateMarkdownExport(project);
        const result = await window.electronAPI.exportMarkdown({ project, markdown });
        if (result.canceled) {
          setExporting(false);
          return;
        }
        if (result.success) {
          showToast('success', 'Notion 模板导出成功');
        } else {
          showToast('error', '导出失败: ' + result.error);
        }
      } else if (exportFormat === 'pdf' || exportFormat === 'epub') {
        // For PDF and EPUB, we generate markdown and let the user convert
        markdown = generateMarkdown(project);
        showToast('info', 'PDF/EPUB 需要第三方工具转换，已生成 Markdown 文件');
        const result = await window.electronAPI.exportMarkdown({ project, markdown });
        if (result.canceled) {
          setExporting(false);
          return;
        }
        if (result.success) {
          showToast('success', '已导出 Markdown，可使用其他工具转换');
        } else {
          showToast('error', '导出失败: ' + result.error);
        }
      }
    } catch (error) {
      showToast('error', '导出失败: ' + error.message);
    }

    setExporting(false);
  };

  const handleJumpToStep = (stepIndex) => {
    dispatch({ type: 'SET_STEP', payload: stepIndex });
    dispatch({ type: 'SET_SHOW_EXPORT_MODAL', payload: false });
  };

  const formats = [
    {
      id: 'markdown',
      name: 'Markdown',
      description: '标准 .md 文件',
      icon: '📝',
      badge: null
    },
    {
      id: 'obsidian',
      name: 'Obsidian',
      description: '适合双向链接笔记',
      icon: '💎',
      badge: '模板'
    },
    {
      id: 'notion',
      name: 'Notion',
      description: '导入到 Notion',
      icon: '📓',
      badge: '模板'
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: '便携式文档格式',
      icon: '📄',
      badge: '转换'
    },
    {
      id: 'epub',
      name: 'EPUB',
      description: '电子书格式',
      icon: '📱',
      badge: '转换'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-bg-secondary rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">导出项目</h2>
            <p className="text-sm text-text-secondary mt-1">选择导出格式</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-3">
              导出格式
            </label>
            <div className="grid grid-cols-2 gap-3">
              {formats.map(format => (
                <button
                  key={format.id}
                  onClick={() => setExportFormat(format.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    exportFormat === format.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{format.icon}</span>
                    <span className="font-medium text-text-primary">{format.name}</span>
                    {format.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 text-accent rounded">
                        {format.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary">{format.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export Info */}
          {exportFormat === 'markdown' && (
            <div className="p-4 bg-bg-tertiary/50 rounded-lg">
              <p className="text-xs text-text-secondary">
                将项目导出为标准 Markdown 格式，包含所有步骤的内容和结构。
              </p>
            </div>
          )}
          {exportFormat === 'obsidian' && (
            <div className="p-4 bg-bg-tertiary/50 rounded-lg">
              <p className="text-xs text-text-secondary">
                Obsidian 模板格式，使用 <code className="bg-bg-tertiary px-1 rounded">[[双向链接]]</code> 语法连接角色和场景。
              </p>
            </div>
          )}
          {exportFormat === 'notion' && (
            <div className="p-4 bg-bg-tertiary/50 rounded-lg">
              <p className="text-xs text-text-secondary">
                Notion 兼容格式，可复制到 Notion 中使用。
              </p>
            </div>
          )}
          {exportFormat === 'pdf' && (
            <div className="p-4 bg-bg-tertiary/50 rounded-lg">
              <p className="text-xs text-text-secondary">
                PDF 转换需要先导出为 Markdown，然后使用 Pandoc 或其他工具转换。
              </p>
            </div>
          )}
          {exportFormat === 'epub' && (
            <div className="p-4 bg-bg-tertiary/50 rounded-lg">
              <p className="text-xs text-text-secondary">
                EPUB 电子书格式需要先导出为 Markdown，然后使用 Pandoc 或 Calibre 转换。
              </p>
            </div>
          )}

          {/* Continue perfecting */}
          <div className="mt-6">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">继续完善</p>
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="btn-secondary"
          >
            关闭
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-primary flex items-center gap-2"
          >
            {exporting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                导出中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                导出
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
