import React, { useState } from 'react';
import { useProject } from '../../store/ProjectContext';
import MarkdownEditor from '../../components/MarkdownEditor/MarkdownEditor';

export default function StorySynopsis() {
  const { project, dispatch } = useProject();
  const [synopsis, setSynopsis] = useState(project.steps.storySynopsis || '');

  const handleChange = (value) => {
    setSynopsis(value);
    dispatch({ type: 'UPDATE_STORY_SYNOPSIS', payload: value });
  };

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 'storySynopsis' });
    dispatch({ type: 'SET_STEP', payload: 4 });
  };

  const handleUncomplete = () => {
    dispatch({ type: 'UNCOMPLETE_STEP', payload: 'storySynopsis' });
  };

  const isCompleted = project.meta.completedSteps.includes('storySynopsis');

  const generateFromParagraph = () => {
    const paragraphs = project.steps.oneParagraph || [];
    if (paragraphs.length === 0) return;

    let expanded = '';
    paragraphs.forEach((p, index) => {
      if (p.content) {
        expanded += `## ${p.label || `第${index + 1}幕`}\n\n${p.content}\n\n`;
      }
    });

    if (!expanded.trim()) {
      expanded = '请先在"一段式概括"中填写内容。';
    } else {
      expanded = `# 故事概要\n\n基于"一段式概括"扩展的详细故事摘要。\n\n---\n\n${expanded}\n\n---\n\n## 扩展说明\n\n请在此处扩展为4-5页的详细故事描述，包括：\n- 故事的起承转合\n- 主要情节点的细节\n- 角色在每个阶段的变化\n- 伏笔与呼应`;
    }

    handleChange(expanded);
  };

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">初步大纲</h1>
        <p className="text-text-secondary">扩展为4-5页的详细故事摘要。</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={generateFromParagraph}
          className="btn-secondary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          从一段式生成
        </button>
      </div>

      {/* Editor */}
      <div className="card mb-6">
        <MarkdownEditor
          value={synopsis}
          onChange={handleChange}
          placeholder="在此处编写详细的故事大纲..."
        />
      </div>

      {/* Word Count */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-text-secondary mb-2">
          <span>字数统计</span>
          <span>{synopsis.length} 字符</span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${Math.min((synopsis.length / 10000) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="card mb-6 bg-accent/5 border-accent/20">
        <h3 className="text-sm font-medium text-accent mb-2">初步大纲提示</h3>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• 从"一段式概括"中的每幕展开，详细描述该幕发生的事件</li>
          <li>• 明确每个主要角色的动机和行动</li>
          <li>• 铺设关键伏笔，为后续情节埋下种子</li>
          <li>• 一个完整的大纲应该可以扩展为4-5页的文档</li>
        </ul>
      </div>

      {/* Complete Button */}
      <div className="flex justify-end">
        {isCompleted ? (
          <button
            onClick={handleUncomplete}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            已完成
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            完成此步
          </button>
        )}
      </div>
    </div>
  );
}