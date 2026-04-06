import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../../store/ProjectContext';
import CollapsibleTips from '../../components/CollapsibleTips/CollapsibleTips';
import { parseSynopsisMarkdown } from '../../utils/markdownUtils';
import TiptapEditor from '../../components/TiptapEditor';

export default function StorySynopsis() {
  const { project, dispatch } = useProject();
  const [synopsis, setSynopsis] = useState(project.steps.storySynopsis || '');
  const [initialized, setInitialized] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(true);
  const isEditingRef = useRef(false);

  // Sync with project changes
  useEffect(() => {
    setSynopsis(project.steps.storySynopsis || '');
  }, [project.steps.storySynopsis]);

  // Auto-generate from Step 2 on first entry (only when empty)
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

  // Sync from external Step 2 changes (when user is not actively editing)
  useEffect(() => {
    if (initialized && !isEditingRef.current) {
      const externalSynopsis = project.steps.storySynopsis || '';
      if (externalSynopsis !== synopsis) {
        setSynopsis(externalSynopsis);
      }
    }
  }, [project.steps.storySynopsis, initialized]);

  const handleChange = (value) => {
    isEditingRef.current = true;
    setSynopsis(value);
    dispatch({ type: 'UPDATE_STORY_SYNOPSIS', payload: value });
    setTimeout(() => {
      isEditingRef.current = false;
    }, 500);
  };

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 'storySynopsis' });
    dispatch({ type: 'SET_STEP', payload: 4 });
  };

  const handleUncomplete = () => {
    dispatch({ type: 'UNCOMPLETE_STEP', payload: 'storySynopsis' });
  };

  const isCompleted = project.meta.completedSteps.includes('storySynopsis');

  // Parse outline structure from markdown
  const extractOutlineStructure = () => {
    const lines = synopsis.split('\n');
    const structure = [];
    let currentSection = null;
    let currentSubsections = [];

    lines.forEach((line, index) => {
      if (line.match(/^#+\s/)) {
        // Save previous section
        if (currentSection) {
          structure.push({
            level: currentSection.level,
            title: currentSection.title,
            content: currentSection.content,
            lineIndex: currentSection.lineIndex
          });
        }
        const match = line.match(/^(#+)\s+(.*)/);
        if (match) {
          currentSection = {
            level: match[1].length,
            title: match[2],
            content: '',
            lineIndex: index
          };
        }
      }
    });

    // Add last section
    if (currentSection) {
      structure.push({
        level: currentSection.level,
        title: currentSection.title,
        content: currentSection.content,
        lineIndex: currentSection.lineIndex
      });
    }

    return structure;
  };

  const outlineStructure = extractOutlineStructure();

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">初步大纲</h1>
        <p className="text-text-secondary">扩展为4-5页的详细故事摘要。</p>
      </div>

      {/* Split Layout: Left Outline Panel + Right Editor */}
      <div className="flex gap-4 mb-6" style={{ minHeight: '500px' }}>
        {/* Left: Collapsible Outline Panel */}
        <div className={`flex-shrink-0 transition-all duration-250 ${outlineOpen ? 'w-64' : 'w-0'}`}>
          {outlineOpen && (
            <div className="card h-full overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border flex justify-between items-center">
                <span className="text-sm font-medium text-text-primary">大纲</span>
                <button
                  onClick={() => setOutlineOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                  title="折叠大纲"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {outlineStructure.length === 0 ? (
                  <div className="text-center text-text-secondary text-sm py-4">
                    暂无大纲结构
                  </div>
                ) : (
                  <div className="space-y-0">
                    {outlineStructure.map((item, index) => (
                      <div
                        key={index}
                        className="text-sm py-1 px-2 rounded cursor-pointer hover:bg-bg-tertiary/50 transition-colors truncate"
                        style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                        title={item.title}
                      >
                        <span className="text-text-secondary mr-1">{item.level === 1 ? '■' : '●'}</span>
                        <span className="text-text-primary">{item.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toggle Outline Button (when closed) */}
        {!outlineOpen && (
          <button
            onClick={() => setOutlineOpen(true)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded bg-bg-tertiary border border-border text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            title="展开大纲"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Right: Editor */}
        <div className="flex-1">
          <div className="card h-full">
            <TiptapEditor
              value={synopsis}
              onChange={handleChange}
              placeholder="在此处编写详细的故事大纲..."
              className="h-full [&_.ProseMirror]:min-h-[450px]"
            />
          </div>
        </div>
      </div>

      {/* Tips */}
      <CollapsibleTips title="初步大纲提示">
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• 从"一段式概括"中的每幕展开，详细描述该幕发生的事件</li>
          <li>• 明确每个主要角色的动机和行动</li>
          <li>• 铺设关键伏笔，为后续情节埋下种子</li>
          <li>• 一个完整的大纲应该可以扩展为4-5页的文档</li>
          <li>• 左侧大纲面板可折叠/展开，方便导航</li>
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
