import React, { useState, useEffect } from 'react';
import { useProject } from '../../store/ProjectContext';
import CollapsibleTips from '../../components/CollapsibleTips/CollapsibleTips';

export default function StorySynopsis() {
  const { project, dispatch } = useProject();
  const [synopsis, setSynopsis] = useState(project.steps.storySynopsis || '');
  const [initialized, setInitialized] = useState(false);

  // Auto-generate from Step 2 on first entry
  useEffect(() => {
    if (!initialized && !project.steps.storySynopsis && project.steps.oneParagraph.some(p => p.content)) {
      const paragraphs = project.steps.oneParagraph || [];
      let expanded = '';
      paragraphs.forEach((p, index) => {
        if (p.content) {
          expanded += `## ${p.label || `第${index + 1}幕`}\n\n${p.content}\n\n`;
        }
      });

      if (expanded.trim()) {
        expanded = `# 故事概要\n\n基于"一段式概括"扩展的详细故事摘要。\n\n---\n\n${expanded}\n\n---\n\n## 扩展说明\n\n请在此处扩展为4-5页的详细故事描述，包括：\n- 故事的起承转合\n- 主要情节点的细节\n- 角色在每个阶段的变化\n- 伏笔与呼应`;
        setSynopsis(expanded);
        dispatch({ type: 'UPDATE_STORY_SYNOPSIS', payload: expanded });
      }
    }
    setInitialized(true);
  }, [initialized, project.steps.storySynopsis, project.steps.oneParagraph, dispatch]);

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

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">初步大纲</h1>
        <p className="text-text-secondary">扩展为4-5页的详细故事摘要。</p>
      </div>

      {/* Editor - Pure edit mode */}
      <div className="card mb-6">
        <textarea
          value={synopsis}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="在此处编写详细的故事大纲..."
          className="w-full h-full min-h-[400px] bg-bg-tertiary text-text-primary font-mono text-base
                     p-4 rounded-md border border-border resize-none focus:border-accent focus:outline-none
                     placeholder-text-secondary"
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
      <CollapsibleTips title="初步大纲提示">
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• 从"一段式概括"中的每幕展开，详细描述该幕发生的事件</li>
          <li>• 明确每个主要角色的动机和行动</li>
          <li>• 铺设关键伏笔，为后续情节埋下种子</li>
          <li>• 一个完整的大纲应该可以扩展为4-5页的文档</li>
        </ul>
      </CollapsibleTips>

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