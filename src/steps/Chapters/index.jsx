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

  const addChapter = () => {
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
  };

  const deleteChapter = (chapterId) => {
    if (chapters.length <= 1) {
      showToast('error', '至少保留一个章节');
      return;
    }
    const newChapters = chapters.filter(c => c.id !== chapterId).map((c, i) => ({ ...c, order: i }));
    setChapters(newChapters);
    dispatch({ type: 'UPDATE_CHAPTERS', payload: newChapters });
    if (selectedIndex >= newChapters.length) {
      setSelectedIndex(newChapters.length - 1);
    }
    showToast('success', '已删除章节');
  };

  const moveChapterUp = (index) => {
    if (index <= 0) return;
    const newChapters = [...chapters];
    [newChapters[index - 1], newChapters[index]] = [newChapters[index], newChapters[index - 1]];
    newChapters.forEach((c, i) => c.order = i);
    setChapters(newChapters);
    dispatch({ type: 'UPDATE_CHAPTERS', payload: newChapters });
    setSelectedIndex(index - 1);
  };

  const moveChapterDown = (index) => {
    if (index >= chapters.length - 1) return;
    const newChapters = [...chapters];
    [newChapters[index], newChapters[index + 1]] = [newChapters[index + 1], newChapters[index]];
    newChapters.forEach((c, i) => c.order = i);
    setChapters(newChapters);
    dispatch({ type: 'UPDATE_CHAPTERS', payload: newChapters });
    setSelectedIndex(index + 1);
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
        <p className="text-text-secondary">撰写完整故事初稿，分章节管理。</p>
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

      {/* Two Column Layout */}
      <div className="flex gap-6 mb-6">
        {/* Left Column: Chapter List */}
        <div className="w-64 flex-shrink-0">
          <div className="card">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <p className="text-xs text-text-secondary">章节列表</p>
              <button
                onClick={addChapter}
                className="w-6 h-6 rounded bg-accent/20 hover:bg-accent/30 flex items-center justify-center text-accent transition-colors"
                title="添加章节"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Chapter List */}
            <div className="max-h-[400px] overflow-y-auto">
              {chapters.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-text-secondary text-sm">暂无章节</p>
                  <p className="text-xs text-text-secondary mt-1">点击上方按钮添加</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className={`group relative ${selectedIndex === index ? 'bg-accent/10' : 'hover:bg-bg-tertiary'}`}
                    >
                      <button
                        onClick={() => setSelectedIndex(index)}
                        className="w-full flex items-center gap-2 p-3 text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                          <span className="text-text-secondary text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          {editingTitle === chapter.id ? (
                            <input
                              type="text"
                              defaultValue={chapter.title}
                              autoFocus
                              className="w-full text-sm font-medium text-text-primary bg-bg-tertiary px-2 py-1 rounded border border-accent focus:outline-none"
                              onBlur={(e) => {
                                handleTitleChange(chapter.id, e.target.value);
                                setEditingTitle(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleTitleChange(chapter.id, e.target.value);
                                  setEditingTitle(null);
                                }
                                if (e.key === 'Escape') {
                                  setEditingTitle(null);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <p
                              className="text-sm font-medium text-text-primary truncate cursor-text"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingTitle(chapter.id);
                              }}
                            >
                              {chapter.title || `第${index + 1}章`}
                            </p>
                          )}
                          <p className="text-xs text-text-secondary truncate">
                            {localContent[chapter.id] ? `${localContent[chapter.id].length} 字` : '空白'}
                          </p>
                        </div>
                        {localContent[chapter.id] && (
                          <div className="w-2 h-2 rounded-full bg-success flex-shrink-0" title="已有内容" />
                        )}
                      </button>

                      {/* Chapter Actions */}
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveChapterUp(index);
                          }}
                          className="w-5 h-5 rounded bg-bg-tertiary hover:bg-accent/20 flex items-center justify-center text-text-secondary hover:text-accent"
                          title="上移"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveChapterDown(index);
                          }}
                          className="w-5 h-5 rounded bg-bg-tertiary hover:bg-accent/20 flex items-center justify-center text-text-secondary hover:text-accent"
                          title="下移"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChapter(chapter.id);
                          }}
                          className="w-5 h-5 rounded bg-bg-tertiary hover:bg-red-500/20 flex items-center justify-center text-text-secondary hover:text-red-500"
                          title="删除"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chapter Editor */}
        <div className="flex-1">
          <div className="card">
            {selectedChapter ? (
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-medium">
                      {selectedIndex + 1}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-text-primary">
                      {selectedChapter.title || `第${selectedIndex + 1}章`}
                    </h2>
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
                <p className="text-text-secondary">添加或选择章节开始撰写</p>
                <p className="text-xs text-text-secondary mt-1">或点击"从Step 9场景生成章节"快速创建</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-text-secondary mb-2">
          <span>已完成章节</span>
          <span>{chapters.filter(c => localContent[c.id]).length} / {chapters.length} 个章节</span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${chapters.length > 0 ? (chapters.filter(c => localContent[c.id]).length / chapters.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Tips */}
      <CollapsibleTips title="初稿撰写提示">
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• 双击章节标题可快速重命名</li>
          <li>• 拖拽排序按钮可调整章节顺序</li>
          <li>• 从Step 9场景生成会自动填充场景描述作为草稿</li>
          <li>• 写作过程中随时自动保存，无需担心丢失</li>
          <li>• 完成后点击"完成此步"可导出完整Markdown</li>
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