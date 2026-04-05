import React, { useState } from 'react';
import { useProject } from '../../store/ProjectContext';
import { v4 as uuidv4 } from 'uuid';

export default function SceneOutlines() {
  const { project, dispatch } = useProject();
  const [sceneOutlines, setSceneOutlines] = useState(project.steps.sceneOutlines || []);

  const characters = project.steps.characters || [];

  const updateSceneOutline = (index, field, value) => {
    const newOutlines = [...sceneOutlines];
    newOutlines[index] = { ...newOutlines[index], [field]: value };
    setSceneOutlines(newOutlines);
    dispatch({ type: 'UPDATE_SCENE_OUTLINES', payload: newOutlines });
  };

  const addSceneOutline = () => {
    const newOutline = {
      id: uuidv4(),
      characterId: characters.length > 0 ? characters[0].id : '',
      time: '',
      location: '',
      goal: '',
      outcome: ''
    };
    const newOutlines = [...sceneOutlines, newOutline];
    setSceneOutlines(newOutlines);
    dispatch({ type: 'UPDATE_SCENE_OUTLINES', payload: newOutlines });
  };

  const deleteSceneOutline = (index) => {
    const newOutlines = sceneOutlines.filter((_, i) => i !== index);
    setSceneOutlines(newOutlines);
    dispatch({ type: 'UPDATE_SCENE_OUTLINES', payload: newOutlines });
  };

  const handleComplete = () => {
    if (sceneOutlines.length >= 1) {
      dispatch({ type: 'COMPLETE_STEP', payload: 'sceneOutlines' });
      dispatch({ type: 'SET_STEP', payload: 6 });
    }
  };

  const handleUncomplete = () => {
    dispatch({ type: 'UNCOMPLETE_STEP', payload: 'sceneOutlines' });
  };

  const isCompleted = project.meta.completedSteps.includes('sceneOutlines');

  const getCharacterName = (characterId) => {
    const character = characters.find(c => c.id === characterId);
    return character ? character.name : '未选择';
  };

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">完成大纲</h1>
        <p className="text-text-secondary">每个场景的4句话描述：时间、地点、目标、结局。</p>
      </div>

      {/* Scene Outlines List */}
      <div className="space-y-4 mb-6">
        {sceneOutlines.map((outline, index) => (
          <div key={outline.id} className="card group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <select
                  value={outline.characterId}
                  onChange={(e) => updateSceneOutline(index, 'characterId', e.target.value)}
                  className="bg-bg-tertiary border border-border rounded-md px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="">选择角色</option>
                  {characters.map(char => (
                    <option key={char.id} value={char.id}>{char.name || '未命名角色'}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => deleteSceneOutline(index)}
                className="w-8 h-8 flex items-center justify-center rounded text-text-secondary hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                title="删除场景"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* 4-sentence format */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  <span className="text-accent">1.</span> 时间
                </label>
                <input
                  type="text"
                  value={outline.time}
                  onChange={(e) => updateSceneOutline(index, 'time', e.target.value)}
                  placeholder="场景发生的时间或时间段"
                  className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  <span className="text-accent">2.</span> 地点
                </label>
                <input
                  type="text"
                  value={outline.location}
                  onChange={(e) => updateSceneOutline(index, 'location', e.target.value)}
                  placeholder="场景发生的具体地点"
                  className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  <span className="text-accent">3.</span> 目标
                </label>
                <textarea
                  value={outline.goal}
                  onChange={(e) => updateSceneOutline(index, 'goal', e.target.value)}
                  placeholder="该场景中角色的主要目标"
                  className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  <span className="text-accent">4.</span> 结局
                </label>
                <textarea
                  value={outline.outcome}
                  onChange={(e) => updateSceneOutline(index, 'outcome', e.target.value)}
                  placeholder="该场景的结局或结果"
                  className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent resize-none"
                  rows={2}
                />
              </div>
            </div>

            {/* POV indicator */}
            {outline.characterId && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-text-secondary">
                <span>POV:</span>
                <span className="text-accent">{getCharacterName(outline.characterId)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Scene Outline Button */}
      <div className="mb-6">
        <button
          onClick={addSceneOutline}
          className="btn-secondary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加场景大纲
        </button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-text-secondary mb-2">
          <span>场景大纲数量</span>
          <span>{sceneOutlines.length} 个</span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${Math.min((sceneOutlines.length / 10) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="card mb-6 bg-accent/5 border-accent/20">
        <h3 className="text-sm font-medium text-accent mb-2">场景大纲提示</h3>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• 每个场景用4句话描述：时间、地点、目标、结局</li>
          <li>• 场景是故事的基本单位，每个场景都应该推动情节发展</li>
          <li>• 目标描述角色想要什么，结局描述实际发生了什么</li>
          <li>• 建议为每个角色设计至少2-3个场景</li>
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