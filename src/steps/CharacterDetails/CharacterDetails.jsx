import React, { useState } from 'react';
import { useProject } from '../../store/ProjectContext';
import { v4 as uuidv4 } from 'uuid';

export default function CharacterDetails() {
  const { project, dispatch } = useProject();
  const [characterDetails, setCharacterDetails] = useState(project.steps.characterDetails || []);

  const updateCharacter = (index, field, value) => {
    const newDetails = [...characterDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setCharacterDetails(newDetails);
    dispatch({ type: 'UPDATE_CHARACTER_DETAILS', payload: newDetails });
  };

  const addCharacter = () => {
    const newCharacter = {
      id: uuidv4(),
      name: '',
      age: '',
      appearance: '',
      background: '',
      desire: '',
      fear: '',
      values: '',
      keyMoment: ''
    };
    const newDetails = [...characterDetails, newCharacter];
    setCharacterDetails(newDetails);
    dispatch({ type: 'UPDATE_CHARACTER_DETAILS', payload: newDetails });
  };

  const deleteCharacter = (index) => {
    const newDetails = characterDetails.filter((_, i) => i !== index);
    setCharacterDetails(newDetails);
    dispatch({ type: 'UPDATE_CHARACTER_DETAILS', payload: newDetails });
  };

  const handleComplete = () => {
    if (characterDetails.length >= 1) {
      dispatch({ type: 'COMPLETE_STEP', payload: 'characterDetails' });
      // Auto advance to next step
      dispatch({ type: 'SET_STEP', payload: 5 });
    }
  };

  const handleUncomplete = () => {
    dispatch({ type: 'UNCOMPLETE_STEP', payload: 'characterDetails' });
  };

  const isCompleted = project.meta.completedSteps.includes('characterDetails');
  const canComplete = characterDetails.length >= 1 && characterDetails.every(c => c.name);

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">角色宝典</h1>
        <p className="text-text-secondary">每个角色的详细信息，建立完整的人物档案。</p>
      </div>

      {/* Characters Table */}
      <div className="card mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4 w-24">姓名</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4 w-16">年龄</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4 w-28">外貌</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4 w-28">背景</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4 w-24">欲望</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4 w-24">恐惧</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4 w-24">价值观</th>
                <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider py-3 px-4">关键时刻</th>
                <th className="py-3 px-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {characterDetails.map((character, index) => (
                <tr key={character.id} className="border-b border-border last:border-0 hover:bg-bg-tertiary/50 transition-colors group">
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={character.name}
                      onChange={(e) => updateCharacter(index, 'name', e.target.value)}
                      placeholder="姓名"
                      className="w-full bg-transparent border-0 text-sm text-text-primary placeholder-text-secondary focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={character.age}
                      onChange={(e) => updateCharacter(index, 'age', e.target.value)}
                      placeholder="年龄"
                      className="w-full bg-transparent border-0 text-sm text-text-primary placeholder-text-secondary focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={character.appearance}
                      onChange={(e) => updateCharacter(index, 'appearance', e.target.value)}
                      placeholder="外貌特征"
                      className="w-full bg-transparent border-0 text-sm text-text-primary placeholder-text-secondary focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={character.background}
                      onChange={(e) => updateCharacter(index, 'background', e.target.value)}
                      placeholder="背景故事"
                      className="w-full bg-transparent border-0 text-sm text-text-primary placeholder-text-secondary focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={character.desire}
                      onChange={(e) => updateCharacter(index, 'desire', e.target.value)}
                      placeholder="欲望"
                      className="w-full bg-transparent border-0 text-sm text-text-primary placeholder-text-secondary focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={character.fear}
                      onChange={(e) => updateCharacter(index, 'fear', e.target.value)}
                      placeholder="恐惧"
                      className="w-full bg-transparent border-0 text-sm text-text-primary placeholder-text-secondary focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={character.values}
                      onChange={(e) => updateCharacter(index, 'values', e.target.value)}
                      placeholder="价值观"
                      className="w-full bg-transparent border-0 text-sm text-text-primary placeholder-text-secondary focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={character.keyMoment}
                      onChange={(e) => updateCharacter(index, 'keyMoment', e.target.value)}
                      placeholder="关键时刻"
                      className="w-full bg-transparent border-0 text-sm text-text-primary placeholder-text-secondary focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => deleteCharacter(index)}
                      className="w-8 h-8 flex items-center justify-center rounded text-text-secondary hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="删除角色"
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
        {characterDetails.length === 0 && (
          <div className="py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-text-secondary">暂无角色</p>
            <p className="text-xs text-text-secondary mt-1">点击下方按钮添加第一个角色</p>
          </div>
        )}

        {/* Add Character Button */}
        <div className="p-4 border-t border-border">
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
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-text-secondary mb-2">
          <span>角色数量</span>
          <span>{characterDetails.length} 个</span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${Math.min((characterDetails.length / 5) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Tips */}
      <div className="card mb-6 bg-accent/5 border-accent/20">
        <h3 className="text-sm font-medium text-accent mb-2">角色宝典提示</h3>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• 欲望和恐惧是角色的核心驱动力</li>
          <li>• 关键时刻定义角色的转变点</li>
          <li>• 价值观决定角色在压力下的选择</li>
          <li>• 外貌特征可以暗示性格</li>
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