import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../../store/ProjectContext';
import { v4 as uuidv4 } from 'uuid';

export default function SceneOutlines() {
  const { project, dispatch } = useProject();
  const [sceneOutlines, setSceneOutlines] = useState(project.steps.sceneOutlines || []);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Sync with project changes
  useEffect(() => {
    setSceneOutlines(project.steps.sceneOutlines || []);
  }, [project.steps.sceneOutlines]);

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
      characterIds: [],
      time: '',
      location: '',
      goal: '',
      outcome: ''
    };
    const newOutlines = [...sceneOutlines, newOutline];
    setSceneOutlines(newOutlines);
    dispatch({ type: 'UPDATE_SCENE_OUTLINES', payload: newOutlines });
    setSelectedIndex(newOutlines.length - 1);
  };

  const deleteSceneOutline = (index) => {
    const newOutlines = sceneOutlines.filter((_, i) => i !== index);
    setSceneOutlines(newOutlines);
    dispatch({ type: 'UPDATE_SCENE_OUTLINES', payload: newOutlines });
    if (selectedIndex >= newOutlines.length) {
      setSelectedIndex(Math.max(0, newOutlines.length - 1));
    }
  };

  const handleCharacterAdd = (outlineIndex, characterId) => {
    const outline = sceneOutlines[outlineIndex];
    const currentIds = outline.characterIds || [];
    if (!currentIds.includes(characterId)) {
      updateSceneOutline(outlineIndex, 'characterIds', [...currentIds, characterId]);
    }
  };

  const handleCharacterRemove = (outlineIndex, characterId) => {
    const outline = sceneOutlines[outlineIndex];
    const currentIds = outline.characterIds || [];
    updateSceneOutline(outlineIndex, 'characterIds', currentIds.filter(id => id !== characterId));
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
    return character ? character.name : '未知';
  };

  const getCharacterColor = (characterId) => {
    const character = characters.find(c => c.id === characterId);
    return character?.avatarColor || '#4a9eff';
  };

  const selectedOutline = sceneOutlines[selectedIndex];

  // @ mention component for character selection
  const MentionInput = ({ outlineIndex, selectedIds }) => {
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    const selectedIdSet = new Set(selectedIds || []);
    const availableCharacters = characters.filter(c => !selectedIdSet.has(c.id));
    const filteredCharacters = inputValue.startsWith('@')
      ? availableCharacters.filter(c =>
          c.name.toLowerCase().includes(inputValue.slice(1).toLowerCase())
        )
      : availableCharacters;

    const handleInputChange = (e) => {
      const value = e.target.value;
      setInputValue(value);
      if (value.startsWith('@')) {
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    };

    const handleInputFocus = () => {
      if (inputValue.startsWith('@')) {
        setShowDropdown(true);
      }
    };

    const handleSelectCharacter = (charId) => {
      handleCharacterAdd(outlineIndex, charId);
      setInputValue('');
      setShowDropdown(false);
      inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        setInputValue('');
      }
      if (e.key === '@') {
        e.preventDefault();
        setInputValue('@');
        setShowDropdown(true);
      }
    };

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
          setShowDropdown(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={wrapperRef}>
        <div className="flex flex-wrap gap-2 mb-2">
          {(selectedIds || []).map(id => (
            <span
              key={id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: getCharacterColor(id) }}
            >
              @{getCharacterName(id)}
              <button
                onClick={() => handleCharacterRemove(outlineIndex, id)}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder="输入@选择角色"
            className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
          />
          {showDropdown && filteredCharacters.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-bg-secondary border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredCharacters.map(char => (
                <button
                  key={char.id}
                  onClick={() => handleSelectCharacter(char.id)}
                  className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary flex items-center gap-2"
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: char.avatarColor || '#4a9eff' }}
                  >
                    {char.name ? char.name[0].toUpperCase() : '?'}
                  </span>
                  {char.name || '未命名角色'}
                </button>
              ))}
            </div>
          )}
          {showDropdown && inputValue.startsWith('@') && filteredCharacters.length === 0 && (
            <div className="absolute z-10 mt-1 w-full bg-bg-secondary border border-border rounded-md shadow-lg px-3 py-2 text-sm text-text-secondary">
              {availableCharacters.length === 0 ? '所有角色已选择' : '未找到匹配角色'}
            </div>
          )}
        </div>
        {characters.length === 0 && (
          <p className="text-xs text-text-secondary italic mt-1">请先在Step 3添加角色</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">完成大纲</h1>
        <p className="text-text-secondary">每个场景的4句话描述：时间、地点、目标、结局。</p>
      </div>

      {/* Split Layout: Left Scene List + Right Scene Detail */}
      <div className="flex gap-4 mb-6" style={{ minHeight: '500px' }}>
        {/* Left: Scene List */}
        <div className="w-72 flex-shrink-0">
          <div className="card h-full overflow-hidden flex flex-col">
            <div className="p-3 border-b border-border flex justify-between items-center">
              <span className="text-sm font-medium text-text-primary">场景列表</span>
              <span className="text-xs text-text-secondary">{sceneOutlines.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sceneOutlines.length === 0 ? (
                <div className="p-4 text-center text-text-secondary text-sm">
                  暂无场景，点击下方添加
                </div>
              ) : (
                sceneOutlines.map((outline, index) => (
                  <div
                    key={outline.id}
                    onClick={() => setSelectedIndex(index)}
                    className={`p-3 cursor-pointer border-b border-border last:border-b-0 transition-colors ${
                      selectedIndex === index
                        ? 'bg-accent/10 border-l-2 border-l-accent'
                        : 'hover:bg-bg-tertiary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-bg-tertiary text-text-secondary text-xs flex items-center justify-center font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary">
                          {outline.location || '未命名场景'}
                        </div>
                        <div className="text-xs text-text-secondary truncate mt-0.5">
                          {outline.goal || '暂无目标'}
                        </div>
                        {/* POV indicators */}
                        {(outline.characterIds || []).length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {(outline.characterIds || []).slice(0, 2).map(id => (
                              <span
                                key={id}
                                className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: getCharacterColor(id) }}
                              >
                                {getCharacterName(id)}
                              </span>
                            ))}
                            {(outline.characterIds || []).length > 2 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-bg-tertiary text-text-secondary">
                                +{outline.characterIds.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Add Button */}
            <div className="p-3 border-t border-border">
              <button
                onClick={addSceneOutline}
                className="w-full btn-secondary flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加场景大纲
              </button>
            </div>
          </div>
        </div>

        {/* Right: Scene Detail */}
        <div className="flex-1">
          <div className="card h-full">
            {selectedOutline ? (
              <div className="p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium text-lg">
                      {selectedIndex + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-medium text-text-primary">
                        {selectedOutline.location || `场景 ${selectedIndex + 1}`}
                      </h3>
                      <p className="text-xs text-text-secondary">完成大纲</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSceneOutline(selectedIndex)}
                    className="w-8 h-8 flex items-center justify-center rounded text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all"
                    title="删除场景"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Character Tags with @ mention */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-text-secondary mb-2">关联角色</label>
                  <MentionInput outlineIndex={selectedIndex} selectedIds={selectedOutline.characterIds} />
                </div>

                {/* 4-sentence format */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      <span className="text-accent">1.</span> 时间
                    </label>
                    <input
                      type="text"
                      value={selectedOutline.time}
                      onChange={(e) => updateSceneOutline(selectedIndex, 'time', e.target.value)}
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
                      value={selectedOutline.location}
                      onChange={(e) => updateSceneOutline(selectedIndex, 'location', e.target.value)}
                      placeholder="场景发生的具体地点"
                      className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      <span className="text-accent">3.</span> 目标
                    </label>
                    <textarea
                      value={selectedOutline.goal}
                      onChange={(e) => updateSceneOutline(selectedIndex, 'goal', e.target.value)}
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
                      value={selectedOutline.outcome}
                      onChange={(e) => updateSceneOutline(selectedIndex, 'outcome', e.target.value)}
                      placeholder="该场景的结局或结果"
                      className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent resize-none"
                      rows={2}
                    />
                  </div>
                </div>

                {/* POV indicator */}
                {(selectedOutline.characterIds || []).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-text-secondary">
                    <span>POV:</span>
                    {(selectedOutline.characterIds || []).map((id, i) => (
                      <span key={id} className="text-accent">
                        {getCharacterName(id)}{i < (selectedOutline.characterIds || []).length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-text-secondary">从左侧选择场景或添加新场景</p>
                </div>
              </div>
            )}
          </div>
        </div>
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
