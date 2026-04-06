import React, { useState, useEffect } from 'react';
import { useProject } from '../../store/ProjectContext';
import CollapsibleTips from '../../components/CollapsibleTips/CollapsibleTips';

export default function SceneDescriptions() {
  const { project, dispatch, showToast } = useProject();
  const scenes = project.steps.scenes || [];
  const [sceneDescriptions, setSceneDescriptions] = useState(project.steps.sceneDescriptions || []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [localContent, setLocalContent] = useState({});

  // Initialize local content from existing descriptions
  useEffect(() => {
    const contentMap = {};
    sceneDescriptions.forEach(s => {
      contentMap[s.sceneId] = s.content;
    });
    setLocalContent(contentMap);
  }, [sceneDescriptions]);

  const getSceneContent = (sceneId) => {
    return localContent[sceneId] || '';
  };

  const updateSceneDescription = (sceneId, content) => {
    const newLocalContent = { ...localContent, [sceneId]: content };
    setLocalContent(newLocalContent);

    // Update or create scene description entry
    const existingIndex = sceneDescriptions.findIndex(s => s.sceneId === sceneId);
    let newSceneDescriptions;

    if (existingIndex >= 0) {
      newSceneDescriptions = [...sceneDescriptions];
      newSceneDescriptions[existingIndex] = { ...newSceneDescriptions[existingIndex], content };
    } else {
      newSceneDescriptions = [...sceneDescriptions, { sceneId, content }];
    }

    setSceneDescriptions(newSceneDescriptions);
    dispatch({ type: 'UPDATE_SCENE_DESCRIPTIONS', payload: newSceneDescriptions });
    showToast('success', '已保存');
  };

  const handleContentChange = (sceneId, value) => {
    updateSceneDescription(sceneId, value);
  };

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 'sceneDescriptions' });
    dispatch({ type: 'SET_STEP', payload: 9 });
  };

  const handleUncomplete = () => {
    dispatch({ type: 'UNCOMPLETE_STEP', payload: 'sceneDescriptions' });
  };

  const isCompleted = project.meta.completedSteps.includes('sceneDescriptions');
  const selectedScene = scenes[selectedIndex];
  const selectedSceneContent = selectedScene ? getSceneContent(selectedScene.id) : '';

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">规划场景</h1>
        <p className="text-text-secondary">每个场景的详细描述。</p>
      </div>

      {/* Two Column Layout */}
      <div className="flex gap-6 mb-6">
        {/* Left Column: Scene List */}
        <div className="w-64 flex-shrink-0">
          <div className="card">
            <div className="p-3 border-b border-border">
              <p className="text-xs text-text-secondary text-center">选择场景编写描述</p>
            </div>

            {/* Scene List */}
            <div className="max-h-96 overflow-y-auto">
              {scenes.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-text-secondary text-sm">暂无场景</p>
                  <p className="text-xs text-text-secondary mt-1">请先在Step 7添加场景</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {scenes.map((scene, index) => (
                    <button
                      key={scene.id}
                      onClick={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 p-3 text-left transition-colors group
                        ${selectedIndex === index ? 'bg-accent/10' : 'hover:bg-bg-tertiary'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                        <span className="text-text-secondary text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {scene.name || '未命名场景'}
                        </p>
                        <p className="text-xs text-text-secondary truncate">
                          {scene.povCharacter ? `POV: ${scene.povCharacter}` : '无POV'}
                        </p>
                      </div>
                      {localContent[scene.id] && (
                        <div className="w-2 h-2 rounded-full bg-success flex-shrink-0" title="已有内容" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Scene Description Editor */}
        <div className="flex-1">
          <div className="card">
            {selectedScene ? (
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                    <span className="text-text-secondary font-medium">
                      {selectedIndex + 1}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-text-primary">
                      {selectedScene.name || '新场景'}
                    </h2>
                    <p className="text-xs text-text-secondary">
                      {selectedScene.povCharacter ? `POV: ${selectedScene.povCharacter}` : '场景描述'}
                    </p>
                  </div>
                </div>

                <textarea
                  value={selectedSceneContent}
                  onChange={(e) => handleContentChange(selectedScene.id, e.target.value)}
                  placeholder={`为 "${selectedScene.name || '此场景'}" 编写详细的场景描述...\n\n可以包括：\n- 场景发生的具体环境\n- 角色的动作和对话\n- 场景的氛围和情绪\n- 细节描写和伏笔\n- 场景在故事中的作用`}
                  className="w-full h-full min-h-[400px] bg-bg-tertiary text-text-primary font-mono text-base
                             p-4 rounded-md border border-border resize-none focus:border-accent focus:outline-none
                             placeholder-text-secondary"
                />
              </div>
            ) : (
              <div className="py-16 text-center">
                <svg className="w-12 h-12 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-text-secondary">选择场景编写描述</p>
                <p className="text-xs text-text-secondary mt-1">或先在Step 7添加场景</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-text-secondary mb-2">
          <span>已编写描述</span>
          <span>{Object.keys(localContent).filter(k => localContent[k]).length} / {scenes.length} 个场景</span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${scenes.length > 0 ? (Object.keys(localContent).filter(k => localContent[k]).length / scenes.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Tips */}
      <CollapsibleTips title="场景描述提示">
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• 场景是故事的最小单位，每个场景推动故事发展</li>
          <li>• 详细描写场景的环境、动作和对话</li>
          <li>• 通过感官细节让读者身临其境</li>
          <li>• 场景要与整体情节紧密关联</li>
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