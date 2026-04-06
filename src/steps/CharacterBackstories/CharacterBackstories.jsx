import React, { useState, useEffect } from 'react';
import { useProject } from '../../store/ProjectContext';
import CollapsibleTips from '../../components/CollapsibleTips/CollapsibleTips';

const avatarColors = [
  '#4a9eff', '#ef4a9e', '#4aef9e', '#efeb4a', '#9e4aef', '#4aefef',
  '#ff6b6b', '#6bff6b', '#6b6bff', '#ff9e6b', '#9e6bff', '#6bff9e'
];

export default function CharacterBackstories() {
  const { project, dispatch, showToast } = useProject();
  const characters = project.steps.characters || [];
  const [backstories, setBackstories] = useState(project.steps.characterBackstories || []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [localContent, setLocalContent] = useState({});

  // Initialize local content from existing backstories
  useEffect(() => {
    const contentMap = {};
    backstories.forEach(b => {
      contentMap[b.characterId] = b.content;
    });
    setLocalContent(contentMap);
  }, [backstories]);

  // Set up TopBar selector
  useEffect(() => {
    const items = characters.map((c, i) => ({
      id: c.id,
      name: c.name || '未命名',
      index: i,
      hasContent: !!localContent[c.id]
    }));
    dispatch({
      type: 'SET_TOPBAR_SELECTOR',
      payload: {
        label: '角色',
        icon: '👤',
        items,
        onAdd: null, // No add for backstories, they come from Step 3
        onSelect: (id) => {
          const idx = characters.findIndex(c => c.id === id);
          if (idx >= 0) setSelectedIndex(idx);
        }
      }
    });
    return () => dispatch({ type: 'SET_TOPBAR_SELECTOR', payload: null });
  }, [characters, localContent, dispatch]);

  const getBackstoryContent = (characterId) => {
    return localContent[characterId] || '';
  };

  const updateBackstory = (characterId, content) => {
    const newLocalContent = { ...localContent, [characterId]: content };
    setLocalContent(newLocalContent);

    // Update or create backstory entry
    const existingIndex = backstories.findIndex(b => b.characterId === characterId);
    let newBackstories;

    if (existingIndex >= 0) {
      newBackstories = [...backstories];
      newBackstories[existingIndex] = { ...newBackstories[existingIndex], content };
    } else {
      newBackstories = [...backstories, { characterId, content }];
    }

    setBackstories(newBackstories);
    dispatch({ type: 'UPDATE_CHARACTER_BACKSTORIES', payload: newBackstories });
    showToast('success', '已保存');
  };

  const handleContentChange = (characterId, value) => {
    updateBackstory(characterId, value);
  };

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 'characterBackstories' });
    dispatch({ type: 'SET_STEP', payload: 8 });
  };

  const handleUncomplete = () => {
    dispatch({ type: 'UNCOMPLETE_STEP', payload: 'characterBackstories' });
  };

  const isCompleted = project.meta.completedSteps.includes('characterBackstories');
  const selectedCharacter = characters[selectedIndex];
  const selectedBackstoryContent = selectedCharacter ? getBackstoryContent(selectedCharacter.id) : '';

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">人物小传</h1>
        <p className="text-text-secondary">每个角色的深度背景描述。</p>
      </div>

      {/* Full Width Editor */}
      <div className="mb-6">
        <div className="card">
          {selectedCharacter ? (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
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
                  <p className="text-xs text-text-secondary">
                    {selectedCharacter.type || '角色'} - 人物小传
                  </p>
                </div>
              </div>

              <textarea
                value={selectedBackstoryContent}
                onChange={(e) => handleContentChange(selectedCharacter.id, e.target.value)}
                placeholder={`为 ${selectedCharacter.name || '此角色'} 编写详细的人物小传...\n\n可以包括：\n- 成长背景\n- 性格形成原因\n- 重要人生经历\n- 与其他角色的关系\n- 内心世界描写`}
                className="w-full h-full min-h-[400px] bg-bg-tertiary text-text-primary font-serif text-base leading-relaxed
                           p-4 rounded-md border border-border resize-none focus:border-accent focus:outline-none
                           placeholder-text-secondary"
                style={{ fontFamily: '"Source Han Serif CN", "Source Han Serif", "Noto Serif SC", Georgia, serif' }}
              />
            </div>
          ) : (
            <div className="py-16 text-center">
              <svg className="w-12 h-12 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-text-secondary">使用顶栏下拉选择器选择角色</p>
              <p className="text-xs text-text-secondary mt-1">或先在Step 3添加角色</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-text-secondary mb-2">
          <span>已编写小传</span>
          <span>{Object.keys(localContent).filter(k => localContent[k]).length} / {characters.length} 个角色</span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${characters.length > 0 ? (Object.keys(localContent).filter(k => localContent[k]).length / characters.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Tips */}
      <CollapsibleTips title="人物小传提示">
        人物小传是角色的深度背景故事，包括成长经历、性格形成原因、重要人生节点，以及角色与其他角色的关系纠葛。
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