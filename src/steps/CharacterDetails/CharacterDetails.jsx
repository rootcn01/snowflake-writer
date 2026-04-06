import React, { useState, useEffect } from 'react';
import { useProject } from '../../store/ProjectContext';
import CollapsibleTips from '../../components/CollapsibleTips/CollapsibleTips';
import { v4 as uuidv4 } from 'uuid';

const avatarColors = [
  '#4a9eff', '#ef4a9e', '#4aef9e', '#efeb4a', '#9e4aef', '#4aefef',
  '#ff6b6b', '#6bff6b', '#6b6bff', '#ff9e6b', '#9e6bff', '#6bff9e'
];

const characterFields = [
  { key: 'name', label: '姓名' },
  { key: 'age', label: '年龄' },
  { key: 'appearance', label: '外貌' },
  { key: 'background', label: '背景' },
  { key: 'desire', label: '欲望' },
  { key: 'fear', label: '恐惧' },
  { key: 'values', label: '价值观' },
  { key: 'keyMoment', label: '关键时刻' }
];

export default function CharacterDetails() {
  const { project, dispatch, showToast } = useProject();
  const [characterDetails, setCharacterDetails] = useState(project.steps.characterDetails || []);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Set up TopBar selector
  useEffect(() => {
    const items = characterDetails.map((c, i) => ({
      id: c.id,
      name: c.name || '未命名',
      index: i,
      hasContent: !!(c.name || c.age || c.appearance)
    }));
    dispatch({
      type: 'SET_TOPBAR_SELECTOR',
      payload: {
        label: '角色',
        icon: '👤',
        items,
        onAdd: () => {
          const colorIndex = characterDetails.length % avatarColors.length;
          const newCharacter = {
            id: uuidv4(),
            name: '',
            age: '',
            appearance: '',
            background: '',
            desire: '',
            fear: '',
            values: '',
            keyMoment: '',
            avatarColor: avatarColors[colorIndex]
          };
          const newDetails = [...characterDetails, newCharacter];
          setCharacterDetails(newDetails);
          dispatch({ type: 'UPDATE_CHARACTER_DETAILS', payload: newDetails });
          setSelectedIndex(newDetails.length - 1);
          showToast('success', '已添加角色');
        },
        onSelect: (id) => {
          const idx = characterDetails.findIndex(c => c.id === id);
          if (idx >= 0) setSelectedIndex(idx);
        }
      }
    });
    return () => dispatch({ type: 'SET_TOPBAR_SELECTOR', payload: null });
  }, [characterDetails, dispatch, showToast]);

  const updateCharacter = (index, field, value) => {
    const newDetails = [...characterDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setCharacterDetails(newDetails);
    dispatch({ type: 'UPDATE_CHARACTER_DETAILS', payload: newDetails });
  };

  const handleComplete = () => {
    if (characterDetails.length >= 1) {
      dispatch({ type: 'COMPLETE_STEP', payload: 'characterDetails' });
      dispatch({ type: 'SET_STEP', payload: 5 });
    }
  };

  const handleUncomplete = () => {
    dispatch({ type: 'UNCOMPLETE_STEP', payload: 'characterDetails' });
  };

  const isCompleted = project.meta.completedSteps.includes('characterDetails');
  const selectedCharacter = characterDetails[selectedIndex];

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">角色宝典</h1>
        <p className="text-text-secondary">每个角色的详细信息，建立完整的人物档案。</p>
      </div>

      {/* Single Column Layout - Full Width Editor */}
      <div className="mb-6">
        <div className="card">
          {selectedCharacter ? (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: selectedCharacter.avatarColor || avatarColors[0] }}
                >
                  <span className="text-white font-medium text-lg">
                    {selectedCharacter.name ? selectedCharacter.name[0].toUpperCase() : (selectedIndex + 1)}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-medium text-text-primary">
                    {selectedCharacter.name || '新角色'}
                  </h2>
                  <p className="text-xs text-text-secondary">角色宝典</p>
                </div>
              </div>
              <div className="space-y-4">
                {characterFields.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      {field.label}
                    </label>
                    {field.key === 'name' ? (
                      <input
                        type="text"
                        value={selectedCharacter[field.key]}
                        onChange={(e) => updateCharacter(selectedIndex, field.key, e.target.value)}
                        placeholder={`输入${field.label}`}
                        className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                      />
                    ) : (
                      <textarea
                        value={selectedCharacter[field.key]}
                        onChange={(e) => updateCharacter(selectedIndex, field.key, e.target.value)}
                        placeholder={`输入${field.label}`}
                        className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent resize-none"
                        rows={2}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <svg className="w-12 h-12 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-text-secondary">使用顶栏下拉选择器选择或添加角色</p>
              <p className="text-xs text-text-secondary mt-1">或添加新角色</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <CollapsibleTips title="角色宝典提示">
        欲望和恐惧是角色的核心驱动力。关键时刻定义角色的转变点。价值观决定角色在压力下的选择。
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