import React, { useState } from 'react';
import { useProject } from '../../store/ProjectContext';
import { v4 as uuidv4 } from 'uuid';

const characterTypes = [
  { value: 'protagonist', label: '主角' },
  { value: 'antagonist', label: '反派' },
  { value: 'mentor', label: '导师' },
  { value: 'supporting', label: '配角' }
];

export default function CharacterSummary() {
  const { project, dispatch } = useProject();
  const [characters, setCharacters] = useState(project.steps.characters || []);

  const updateCharacter = (index, field, value) => {
    const newCharacters = [...characters];
    newCharacters[index] = { ...newCharacters[index], [field]: value };
    setCharacters(newCharacters);
    dispatch({ type: 'UPDATE_CHARACTERS', payload: newCharacters });
  };

  const addCharacter = () => {
    const newCharacter = {
      id: uuidv4(),
      name: '',
      type: 'protagonist',
      goal: '',
      conflict: '',
      epiphany: ''
    };
    const newCharacters = [...characters, newCharacter];
    setCharacters(newCharacters);
    dispatch({ type: 'UPDATE_CHARACTERS', payload: newCharacters });
  };

  const deleteCharacter = (index) => {
    const newCharacters = characters.filter((_, i) => i !== index);
    setCharacters(newCharacters);
    dispatch({ type: 'UPDATE_CHARACTERS', payload: newCharacters });
  };

  const handleComplete = () => {
    if (characters.length >= 1) {
      dispatch({ type: 'COMPLETE_STEP', payload: 'characters' });
      // Auto advance to next step
      dispatch({ type: 'SET_STEP', payload: 3 });
    }
  };

  const handleUncomplete = () => {
    dispatch({ type: 'UNCOMPLETE_STEP', payload: 'characters' });
  };

  const isCompleted = project.meta.completedSteps.includes('characters');
  const canComplete = characters.length >= 1 && characters.every(c =>
    c.name && c.type && c.goal && c.conflict && c.epiphany
  );

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">人物概括</h1>
        <p className="text-text-secondary">列出主要角色及其在故事中的定位。</p>
      </div>

      {/* Characters List */}
      <div className="space-y-4 mb-6">
        {characters.map((character, index) => (
          <div key={character.id} className="card group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-medium">{character.name ? character.name[0] : '?'}</span>
                </div>
                <input
                  type="text"
                  value={character.name}
                  onChange={(e) => updateCharacter(index, 'name', e.target.value)}
                  placeholder="角色姓名"
                  className="text-lg font-medium text-text-primary bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={() => deleteCharacter(index)}
                className="w-8 h-8 flex items-center justify-center rounded text-text-secondary hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                title="删除角色"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">角色类型</label>
                <select
                  value={character.type}
                  onChange={(e) => updateCharacter(index, 'type', e.target.value)}
                  className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                >
                  {characterTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">角色目标</label>
                <input
                  type="text"
                  value={character.goal}
                  onChange={(e) => updateCharacter(index, 'goal', e.target.value)}
                  placeholder="角色想要什么"
                  className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-text-secondary mb-1.5">角色冲突</label>
              <textarea
                value={character.conflict}
                onChange={(e) => updateCharacter(index, 'conflict', e.target.value)}
                placeholder="角色面临什么阻碍或矛盾"
                className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                rows={2}
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-text-secondary mb-1.5">角色感悟</label>
              <textarea
                value={character.epiphany}
                onChange={(e) => updateCharacter(index, 'epiphany', e.target.value)}
                placeholder="角色在故事中的成长或领悟"
                className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Character Button */}
      <div className="mb-6">
        <button
          onClick={addCharacter}
          className="btn-secondary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加角色
        </button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-text-secondary mb-2">
          <span>角色数量</span>
          <span>{characters.length} 个</span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${Math.min((characters.length / 5) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="card mb-6 bg-accent/5 border-accent/20">
        <h3 className="text-sm font-medium text-accent mb-2">人物概括提示</h3>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• 每个角色都应该有明确的目标和阻碍</li>
          <li>• 主角需要有成长弧线（从冲突到感悟）</li>
          <li>• 反派也应该有合理的动机</li>
          <li>• 配角服务于主角的成长</li>
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
            disabled={!canComplete}
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