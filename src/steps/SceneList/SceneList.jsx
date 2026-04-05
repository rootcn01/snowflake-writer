import React, { useState } from 'react';
import { useProject } from '../../store/ProjectContext';
import CollapsibleTips from '../../components/CollapsibleTips/CollapsibleTips';
import { v4 as uuidv4 } from 'uuid';

export default function SceneList() {
  const { project, dispatch, showToast } = useProject();
  const [scenes, setScenes] = useState(project.steps.scenes || []);

  const updateScene = (index, field, value) => {
    const newScenes = [...scenes];
    newScenes[index] = { ...newScenes[index], [field]: value };
    setScenes(newScenes);
    dispatch({ type: 'UPDATE_SCENES', payload: newScenes });
  };

  const addScene = () => {
    const newScene = {
      id: uuidv4(),
      name: '',
      povCharacter: '',
      summary: ''
    };
    const newScenes = [...scenes, newScene];
    setScenes(newScenes);
    dispatch({ type: 'UPDATE_SCENES', payload: newScenes });
  };

  const deleteScene = (index) => {
    const newScenes = scenes.filter((_, i) => i !== index);
    setScenes(newScenes);
    dispatch({ type: 'UPDATE_SCENES', payload: newScenes });
  };

  const handleComplete = () => {
    if (scenes.length >= 3) {
      dispatch({ type: 'COMPLETE_STEP', payload: 'sceneList' });
      // Check if all previous steps are complete
      const requiredSteps = ['oneSentence', 'oneParagraph', 'characters', 'characterDetails'];
      const missingSteps = requiredSteps.filter(step => !project.meta.completedSteps.includes(step));

      if (missingSteps.length === 0) {
        // All previous steps complete - show export modal
        dispatch({ type: 'SET_SHOW_EXPORT_MODAL', payload: true });
      } else {
        // Some steps missing - show warning toast
        const stepNames = {
          oneSentence: '一句话概括',
          oneParagraph: '一段式概括',
          characters: '人物概括',
          characterDetails: '角色宝典'
        };
        const missingNames = missingSteps.map(s => stepNames[s]).join(', ');
        showToast('warning', `建议完善: ${missingNames}`);
        // Still allow auto advance to next step
        dispatch({ type: 'SET_STEP', payload: 7 });
      }
    }
  };

  const handleUncomplete = () => {
    dispatch({ type: 'UNCOMPLETE_STEP', payload: 'sceneList' });
  };

  const isCompleted = project.meta.completedSteps.includes('sceneList');

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">场景列表</h1>
        <p className="text-text-secondary">列出故事中的所有场景。</p>
      </div>

      {/* Scenes Table */}
      <div className="card mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4 w-12">#</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4 w-40">场景名</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4 w-32">POV角色</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4">摘要</th>
                <th className="py-3 px-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {scenes.map((scene, index) => (
                <tr key={scene.id || index} className="border-b border-border last:border-0 hover:bg-bg-tertiary/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-text-secondary">{index + 1}</td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={scene.name}
                      onChange={(e) => updateScene(index, 'name', e.target.value)}
                      placeholder="场景名称"
                      className="w-full bg-transparent border-0 text-sm text-text-primary placeholder-text-secondary focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={scene.povCharacter}
                      onChange={(e) => updateScene(index, 'povCharacter', e.target.value)}
                      placeholder="POV"
                      className="w-full bg-transparent border-0 text-sm text-text-primary placeholder-text-secondary focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={scene.summary}
                      onChange={(e) => updateScene(index, 'summary', e.target.value)}
                      placeholder="简要描述..."
                      className="w-full bg-transparent border-0 text-sm text-text-primary placeholder-text-secondary focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => deleteScene(index)}
                      className="w-8 h-8 flex items-center justify-center rounded text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="删除场景"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {scenes.length === 0 && (
          <div className="py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-text-secondary">暂无场景</p>
            <p className="text-xs text-text-secondary mt-1">点击下方按钮添加第一个场景</p>
          </div>
        )}

        {/* Add Scene Button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={addScene}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加场景
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-text-secondary mb-2">
          <span>场景数量</span>
          <span>{scenes.length} 个 {scenes.length < 3 && `(最少需要3个)`}</span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${scenes.length >= 3 ? 'bg-success' : 'bg-warning'}`}
            style={{ width: `${Math.min((scenes.length / 10) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Tips */}
      <CollapsibleTips title="场景设计提示">
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• 每个场景都应该有明确的POV角色</li>
          <li>• 场景是故事的最小单位，每个场景推动故事发展</li>
          <li>• 考虑场景的对立和冲突</li>
          <li>• 初期至少设计3个核心场景</li>
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
