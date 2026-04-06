import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useProject } from '../../store/ProjectContext';
import CollapsibleTips from '../../components/CollapsibleTips/CollapsibleTips';

export default function Chapters() {
  const { project, dispatch, showToast } = useProject();
  const [chapters, setChapters] = useState(project.steps.chapters || []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const [localContent, setLocalContent] = useState({});

  // Initialize local content from existing chapters
  useEffect(() => {
    const contentMap = {};
    chapters.forEach(chapter => {
      contentMap[chapter.id] = chapter.content;
    });
    setLocalContent(contentMap);
  }, [chapters]);

  // Set up TopBar selector
  useEffect(() => {
    const items = chapters.map((c, i) => ({
      id: c.id,
      name: c.title || `第${i + 1}章`,
      index: i,
      hasContent: !!localContent[c.id]
    }));
    dispatch({
      type: 'SET_TOPBAR_SELECTOR',
      payload: {
        label: '章节',
        icon: '📖',
        items,
        onAdd: () => {
          const newChapter = {
            id: uuidv4(),
            title: `第${chapters.length + 1}章`,
            content: '',
            order: chapters.length
          };
          const newChapters = [...chapters, newChapter];
          setChapters(newChapters);
          dispatch({ type: 'UPDATE_CHAPTERS', payload: newChapters });
          setSelectedIndex(newChapters.length - 1);
          showToast('success', '已添加章节');
        },
        onSelect: (id) => {
          const idx = chapters.findIndex(c => c.id === id);
          if (idx >= 0) setSelectedIndex(idx);
        }
      }
    });
    return () => dispatch({ type: 'SET_TOPBAR_SELECTOR', payload: null });
  }, [chapters, localContent, dispatch, showToast]);

  const getChapterContent = (chapterId) => {
    return localContent[chapterId] || '';
  };

  const updateChapter = (chapterId, content) => {
    const newLocalContent = { ...localContent, [chapterId]: content };
    setLocalContent(newLocalContent);

    const newChapters = chapters.map(chapter =>
      chapter.id === chapterId ? { ...chapter, content } : chapter
    );

    setChapters(newChapters);
    dispatch({ type: 'UPDATE_CHAPTERS', payload: newChapters });
  };

  const handleContentChange = (chapterId, value) => {
    updateChapter(chapterId, value);
  };

  const handleTitleChange = (chapterId, newTitle) => {
    const newChapters = chapters.map(chapter =>
      chapter.id === chapterId ? { ...chapter, title: newTitle } : chapter
    );
    setChapters(newChapters);
    dispatch({ type: 'UPDATE_CHAPTERS', payload: newChapters });
  };

  const generateFromStep9 = () => {
    const scenes = project.steps.scenes || [];
    const sceneDescriptions = project.steps.sceneDescriptions || [];

    if (scenes.length === 0) {
      showToast('error', 'Step 7 暂无场景，请先添加场景');
      return;
    }

    const newChapters = scenes.map((scene, i) => {
      const desc = sceneDescriptions.find(s => s.sceneId === scene.id);
      return {
        id: uuidv4(),
        title: scene.name || `第${i + 1}章`,
        content: desc?.content || `// ${scene.name || '场景' }\n\n在此继续撰写...`,
        order: i
      };
    });

    setChapters(newChapters);
    dispatch({ type: 'UPDATE_CHAPTERS', payload: newChapters });

    // Update local content map
    const contentMap = {};
    newChapters.forEach(chapter => {
      contentMap[chapter.id] = chapter.content;
    });
    setLocalContent(contentMap);
    setSelectedIndex(0);

    showToast('success', `已从 Step 9 生成 ${newChapters.length} 个章节草稿`);
  };

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 'chapters' });
    dispatch({ type: 'SET_SHOW_EXPORT_MODAL', payload: true });
  };

  const handleUncomplete = () => {
    dispatch({ type: 'UNCOMPLETE_STEP', payload: 'chapters' });
  };

  const isCompleted = project.meta.completedSteps.includes('chapters');
  const selectedChapter = chapters[selectedIndex];
  const selectedChapterContent = selectedChapter ? getChapterContent(selectedChapter.id) : '';

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">初稿</h1>
        <p className="text-text-secondary">撰写完整故事初稿，使用顶栏选择章节。</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={generateFromStep9}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          从Step 9场景生成章节
        </button>
      </div>

      {/* Full Width Editor */}
      <div className="mb-6">
        <div className="card">
          {selectedChapter ? (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent font-medium text-lg">
                    {selectedIndex + 1}
                  </span>
                </div>
                <div className="flex-1">
                  {editingTitle === selectedChapter.id ? (
                    <input
                      type="text"
                      defaultValue={selectedChapter.title}
                      autoFocus
                      className="w-full text-lg font-medium text-text-primary bg-bg-tertiary px-2 py-1 rounded border border-accent focus:outline-none"
                      onBlur={(e) => {
                        handleTitleChange(selectedChapter.id, e.target.value);
                        setEditingTitle(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTitleChange(selectedChapter.id, e.target.value);
                          setEditingTitle(null);
                        }
                        if (e.key === 'Escape') {
                          setEditingTitle(null);
                        }
                      }}
                    />
                  ) : (
                    <h2
                      className="text-lg font-medium text-text-primary cursor-text hover:text-accent"
                      onDoubleClick={() => setEditingTitle(selectedChapter.id)}
                      title="双击重命名"
                    >
                      {selectedChapter.title || `第${selectedIndex + 1}章`}
                    </h2>
                  )}
                  <p className="text-xs text-text-secondary">
                    {selectedChapter.content ? `${selectedChapter.content.length} 字` : '空白'}
                  </p>
                </div>
              </div>

              <textarea
                value={selectedChapterContent}
                onChange={(e) => handleContentChange(selectedChapter.id, e.target.value)}
                placeholder={`开始撰写 "${selectedChapter.title || '本章'}" 的内容...\n\n快捷提示：\n- 使用空行分隔段落\n- 留意章节节奏和张力\n- 衔接上一章的结尾`}
                className="w-full h-full min-h-[400px] bg-bg-tertiary text-text-primary font-serif text-base leading-relaxed
                           p-4 rounded-md border border-border resize-none focus:border-accent focus:outline-none
                           placeholder-text-secondary"
                style={{ fontFamily: '"Source Han Serif CN", "Source Han Serif", "Noto Serif SC", Georgia, serif' }}
              />
            </div>
          ) : (
            <div className="py-16 text-center">
              <svg className="w-12 h-12 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-text-secondary">使用顶栏下拉选择器选择章节</p>
              <p className="text-xs text-text-secondary mt-1">或点击"从Step 9场景生成章节"快速创建</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <CollapsibleTips title="初稿撰写提示">
        双击章节标题可快速重命名。从Step 9场景生成会自动填充场景描述作为草稿。写作过程中随时自动保存，无需担心丢失。
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