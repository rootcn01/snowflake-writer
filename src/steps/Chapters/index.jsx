import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useProject } from '../../store/ProjectContext';
import CollapsibleTips from '../../components/CollapsibleTips/CollapsibleTips';
import TiptapEditor from '../../components/TiptapEditor';

export default function Chapters() {
  const { project, dispatch, showToast } = useProject();
  const [chapters, setChapters] = useState(project.steps.chapters || []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const [localContent, setLocalContent] = useState({});
  const [outlineOpen, setOutlineOpen] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [startTime] = useState(Date.now());
  const [writingTime, setWritingTime] = useState(0);
  const editorRef = useRef(null);

  // Initialize local content from existing chapters
  useEffect(() => {
    const contentMap = {};
    chapters.forEach(chapter => {
      contentMap[chapter.id] = chapter.content;
    });
    setLocalContent(contentMap);
  }, [chapters]);

  // Track writing time
  useEffect(() => {
    const timer = setInterval(() => {
      setWritingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

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

  // Calculate stats
  const totalWords = Object.values(localContent).reduce((sum, c) => sum + (c?.length || 0), 0);
  const currentChapterWords = selectedChapterContent.length;
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Focus mode toggle
  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    if (!focusMode && editorRef.current) {
      editorRef.current.focus();
    }
  };

  return (
    <div className={`max-w-content mx-auto animate-fade-in ${focusMode ? 'fixed inset-0 z-50 bg-bg-primary max-w-none p-8' : ''}`}>
      {/* Focus Mode Header */}
      {focusMode && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-medium text-text-primary">
              {selectedChapter?.title || `第${selectedIndex + 1}章`}
            </span>
            <span className="text-sm text-text-secondary">
              {currentChapterWords} 字
            </span>
          </div>
          <button
            onClick={toggleFocusMode}
            className="px-4 py-2 rounded bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
          >
            退出专注
          </button>
        </div>
      )}

      {/* Normal Mode Header */}
      {!focusMode && (
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">初稿</h1>
              <p className="text-text-secondary text-sm mt-1">撰写完整故事初稿</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={toggleFocusMode}
                className="btn-secondary flex items-center gap-2 text-sm"
                title="专注模式"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                专注
              </button>
              <button
                onClick={generateFromStep9}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                从Step 9生成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Layout: Left Outline + Right Editor */}
      <div className={`flex gap-4 ${focusMode ? 'flex-1' : 'mb-4'}`} style={{ minHeight: focusMode ? 'calc(100vh - 200px)' : '450px' }}>
        {/* Left: Collapsible Chapter Outline */}
        {!focusMode && (
          <div className={`flex-shrink-0 transition-all duration-250 ${outlineOpen ? 'w-64' : 'w-0'}`}>
            {outlineOpen && (
              <div className="card h-full overflow-hidden flex flex-col">
                <div className="p-3 border-b border-border flex justify-between items-center">
                  <span className="text-sm font-medium text-text-primary">章节大纲</span>
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
                <div className="flex-1 overflow-y-auto">
                  {chapters.length === 0 ? (
                    <div className="p-4 text-center text-text-secondary text-sm">
                      暂无章节，点击下方添加
                    </div>
                  ) : (
                    <div className="p-2">
                      {chapters.map((chapter, index) => (
                        <div
                          key={chapter.id}
                          onClick={() => setSelectedIndex(index)}
                          className={`p-3 rounded cursor-pointer mb-1 transition-colors ${
                            selectedIndex === index
                              ? 'bg-accent/10 border-l-2 border-l-accent'
                              : 'hover:bg-bg-tertiary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-text-primary truncate">
                              {chapter.title || `第${index + 1}章`}
                            </span>
                            <span className="text-xs text-text-secondary">
                              {(localContent[chapter.id]?.length || 0)}字
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Add Chapter Button */}
                <div className="p-3 border-t border-border">
                  <button
                    onClick={() => {
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
                    }}
                    className="w-full btn-secondary flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    添加章节
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Toggle Outline Button (when closed) */}
        {!focusMode && !outlineOpen && (
          <button
            onClick={() => setOutlineOpen(true)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded bg-bg-tertiary border border-border text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            title="展开章节大纲"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Right: Editor */}
        <div className="flex-1">
          <div className={`card h-full ${focusMode ? 'border-0 shadow-none' : ''}`}>
            {selectedChapter ? (
              <div className={`p-4 h-full flex flex-col ${focusMode ? '' : ''}`}>
                {/* Chapter Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-medium">
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
                  </div>
                </div>

                {/* Editor */}
                <TiptapEditor
                  ref={editorRef}
                  value={selectedChapterContent}
                  onChange={(val) => handleContentChange(selectedChapter.id, val)}
                  placeholder={`开始撰写 "${selectedChapter.title || '本章'}" 的内容...\n\n快捷提示：\n- 使用空行分隔段落\n- 留意章节节奏和张力\n- 衔接上一章的结尾`}
                  className="flex-1 [&_.ProseMirror]:min-h-[300px]"
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-text-secondary">从左侧选择章节或添加新章节</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      {!focusMode && (
        <div className="card">
          <div className="flex items-center justify-between px-4 py-2 text-sm">
            <div className="flex items-center gap-6">
              <span className="text-text-secondary">
                <span className="text-text-primary font-medium">{selectedChapter?.title || `第${selectedIndex + 1}章`}</span>
              </span>
              <span className="text-text-secondary">
                本章: <span className="text-text-primary">{currentChapterWords}</span> 字
              </span>
              <span className="text-text-secondary">
                总计: <span className="text-text-primary">{totalWords}</span> 字
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-text-secondary">
                写作时间: <span className="text-text-primary">{formatTime(writingTime)}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      {!focusMode && (
        <CollapsibleTips title="初稿撰写提示">
          双击章节标题可快速重命名。从Step 9场景生成会自动填充场景描述作为草稿。写作过程中随时自动保存，无需担心丢失。
        </CollapsibleTips>
      )}

      {/* Complete Button */}
      {!focusMode && (
        <div className="flex justify-end mt-4">
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
      )}
    </div>
  );
}
