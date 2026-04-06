import React, { useState, useEffect } from 'react';
import { useProject } from '../../store/ProjectContext';
import CollapsibleTips from '../../components/CollapsibleTips/CollapsibleTips';
import TiptapEditor from '../../components/TiptapEditor';

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

  // Set up TopBar selector
  useEffect(() => {
    const items = scenes.map((s, i) => ({
      id: s.id,
      name: s.name || '未命名场景',
      index: i,
      hasContent: !!localContent[s.id]
    }));
    dispatch({
      type: 'SET_TOPBAR_SELECTOR',
      payload: {
        label: '场景',
        icon: '🎬',
        items,
        onAdd: null, // Scenes come from Step 7
        onSelect: (id) => {
          const idx = scenes.findIndex(s => s.id === id);
          if (idx >= 0) setSelectedIndex(idx);
        }
      }
    });
    return () => dispatch({ type: 'SET_TOPBAR_SELECTOR', payload: null });
  }, [scenes, localContent, dispatch]);

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

      {/* Full Width Editor */}
      <div className="mb-6">
        <div className="card">
          {selectedScene ? (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                  <span className="text-text-secondary font-medium text-lg">
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

              <TiptapEditor
                value={selectedSceneContent}
                onChange={(val) => handleContentChange(selectedScene.id, val)}
                placeholder={`为 "${selectedScene.name || '此场景'}" 编写详细的场景描述...\n\n可以包括：\n- 场景发生的具体环境\n- 角色的动作和对话\n- 场景的氛围和情绪\n- 细节描写和伏笔\n- 场景在故事中的作用`}
                className="min-h-[400px]"
              />
            </div>
          ) : (
            <div className="py-16 text-center">
              <svg className="w-12 h-12 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-text-secondary">使用顶栏下拉选择器选择场景</p>
              <p className="text-xs text-text-secondary mt-1">或先在Step 7添加场景</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <CollapsibleTips title="场景描述提示">
        场景是故事的最小单位，每个场景推动故事发展。详细描写场景的环境、动作和对话，通过感官细节让读者身临其境。
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