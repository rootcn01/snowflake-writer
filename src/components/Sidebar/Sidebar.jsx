import React, { useEffect } from 'react';
import { useProject } from '../../store/ProjectContext';

const steps = [
  { id: 'oneSentence', label: '一句话概括', description: '用15-50字概括你的故事' },
  { id: 'oneParagraph', label: '一段式概括', description: '多幕讲述完整故事' },
  { id: 'characters', label: '人物概括', description: '主要角色及定位' },
  { id: 'storySynopsis', label: '初步大纲', description: '4-5页详细故事摘要' },
  { id: 'characterDetails', label: '角色宝典', description: '角色详细信息' },
  { id: 'sceneOutlines', label: '完成大纲', description: '每个场景的4句话描述' },
  { id: 'sceneList', label: '场景清单', description: '整理所有场景' },
  { id: 'characterBackstories', label: '人物小传', description: '角色深度背景描述' },
  { id: 'sceneDescriptions', label: '规划场景', description: '每个场景的详细描述' },
  { id: 'chapters', label: '初稿', description: '撰写完整故事初稿' }
];

export default function Sidebar() {
  const { sidebarOpen, dispatch, currentStep, project } = useProject();

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_SIDEBAR' });
      }
      if (e.key === 'Escape' && sidebarOpen) {
        dispatch({ type: 'SET_SIDEBAR', payload: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, dispatch]);

  const handleOverlayClick = () => {
    dispatch({ type: 'SET_SIDEBAR', payload: false });
  };

  const handleStepClick = (index) => {
    dispatch({ type: 'SET_STEP', payload: index });
    dispatch({ type: 'SET_SIDEBAR', payload: false });
  };

  const isCompleted = (stepId) => {
    return project.meta.completedSteps.includes(stepId);
  };

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-12 left-0 h-[calc(100vh-48px)] w-56 bg-bg-secondary border-r border-border z-50
          transform transition-transform duration-250 ease-out overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Project Name */}
          <div className="mb-6 pb-4 border-b border-border">
            <h2 className="text-sm font-medium text-text-primary truncate">
              {project.title || '未命名'}
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              项目
            </p>
          </div>

          {/* Steps List */}
          <nav className="flex-1">
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
              写作步骤
            </h3>
            <ul className="space-y-1">
              {steps.map((step, index) => (
                <li key={step.id}>
                  <button
                    onClick={() => handleStepClick(index)}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-colors
                      ${currentStep === index
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-primary hover:bg-bg-tertiary'
                      }`}
                  >
                    {/* Status Icon */}
                    <span className={`mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full
                      ${isCompleted(step.id)
                        ? 'bg-success text-white'
                        : currentStep === index
                          ? 'bg-accent text-white'
                          : 'bg-bg-tertiary text-text-secondary'
                      }`}
                    >
                      {isCompleted(step.id) ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </span>

                    {/* Step Info */}
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-medium truncate">
                        {step.label}
                      </span>
                      <span className="block text-xs text-text-secondary mt-0.5 line-clamp-2">
                        {step.description}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Progress */}
          <div className="pt-4 border-t border-border group/progress hover:bg-bg-tertiary/50 transition-colors -mx-2 px-2 py-2 rounded-lg">
            <div className="text-xs text-text-secondary opacity-50 group-hover/progress:opacity-100 transition-opacity">
              进度: {project.meta.completedSteps.length}/{steps.length} 完成
            </div>
            <div className="mt-2 h-1 bg-bg-tertiary rounded-full overflow-hidden opacity-30 group-hover/progress:opacity-100 transition-opacity">
              <div
                className="h-full bg-success transition-all duration-300"
                style={{ width: `${(project.meta.completedSteps.length / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}