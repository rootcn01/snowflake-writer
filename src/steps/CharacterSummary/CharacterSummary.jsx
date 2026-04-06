import React, { useState } from 'react';
import { useProject } from '../../store/ProjectContext';
import CollapsibleTips from '../../components/CollapsibleTips/CollapsibleTips';
import { v4 as uuidv4 } from 'uuid';

const defaultTags = [
  { value: 'protagonist', label: '主角', color: '#4a9eff' },
  { value: 'antagonist', label: '反派', color: '#ef4a9e' },
  { value: 'mentor', label: '导师', color: '#4aef9e' },
  { value: 'supporting', label: '配角', color: '#efeb4a' }
];

const avatarColors = [
  '#4a9eff', '#ef4a9e', '#4aef9e', '#efeb4a', '#9e4aef', '#4aefef',
  '#ff6b6b', '#6bff6b', '#6b6bff', '#ff9e6b', '#9e6bff', '#6bff9e'
];

export default function CharacterSummary() {
  const { project, dispatch } = useProject();
  const [characters, setCharacters] = useState(project.steps.characters || []);
  const [filterTag, setFilterTag] = useState('all');

  const updateCharacter = (index, field, value) => {
    const newCharacters = [...characters];
    newCharacters[index] = { ...newCharacters[index], [field]: value };
    setCharacters(newCharacters);
    dispatch({ type: 'UPDATE_CHARACTERS', payload: newCharacters });
  };

  const addCharacter = () => {
    const colorIndex = characters.length % avatarColors.length;
    const newCharacter = {
      id: uuidv4(),
      name: '',
      tags: ['protagonist'],
      goal: '',
      conflict: '',
      epiphany: '',
      avatarColor: avatarColors[colorIndex],
      avatar: null,
      notes: []
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

  const handleAvatarUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newCharacters = [...characters];
      newCharacters[index] = { ...newCharacters[index], avatar: event.target.result };
      setCharacters(newCharacters);
      dispatch({ type: 'UPDATE_CHARACTERS', payload: newCharacters });
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarColorChange = (index, color) => {
    const newCharacters = [...characters];
    newCharacters[index] = { ...newCharacters[index], avatarColor: color };
    setCharacters(newCharacters);
    dispatch({ type: 'UPDATE_CHARACTERS', payload: newCharacters });
  };

  const handleTagToggle = (index, tagValue) => {
    const character = characters[index];
    const currentTags = character.tags || [];
    let newTags;
    if (currentTags.includes(tagValue)) {
      newTags = currentTags.filter(t => t !== tagValue);
    } else {
      newTags = [...currentTags, tagValue];
    }
    updateCharacter(index, 'tags', newTags);
  };

  const handleAddCustomTag = (index, tagName) => {
    if (!tagName.trim()) return;
    const character = characters[index];
    const currentTags = character.tags || [];
    if (!currentTags.includes(tagName.trim())) {
      updateCharacter(index, 'tags', [...currentTags, tagName.trim()]);
    }
  };

  const handleRemoveTag = (index, tagValue) => {
    const character = characters[index];
    const currentTags = character.tags || [];
    updateCharacter(index, 'tags', currentTags.filter(t => t !== tagValue));
  };

  const handleAddNote = (index, noteText) => {
    if (!noteText.trim()) return;
    const character = characters[index];
    const currentNotes = character.notes || [];
    updateCharacter(index, 'notes', [...currentNotes, noteText.trim()]);
  };

  const handleRemoveNote = (index, noteIndex) => {
    const character = characters[index];
    const currentNotes = character.notes || [];
    updateCharacter(index, 'notes', currentNotes.filter((_, i) => i !== noteIndex));
  };

  const handleComplete = () => {
    if (characters.length >= 1) {
      dispatch({ type: 'COMPLETE_STEP', payload: 'characters' });
      dispatch({ type: 'SET_STEP', payload: 3 });
    }
  };

  const handleUncomplete = () => {
    dispatch({ type: 'UNCOMPLETE_STEP', payload: 'characters' });
  };

  const isCompleted = project.meta.completedSteps.includes('characters');

  const filteredCharacters = filterTag === 'all'
    ? characters
    : characters.filter(c => (c.tags || []).includes(filterTag));

  const getTagLabel = (tagValue) => {
    const defaultTag = defaultTags.find(t => t.value === tagValue);
    if (defaultTag) return defaultTag.label;
    return tagValue;
  };

  const getTagColor = (tagValue) => {
    const defaultTag = defaultTags.find(t => t.value === tagValue);
    if (defaultTag) return defaultTag.color;
    return '#888888';
  };

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">人物概括</h1>
        <p className="text-text-secondary">列出主要角色及其在故事中的定位。</p>
      </div>

      {/* Filter Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterTag('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            filterTag === 'all'
              ? 'bg-accent text-white'
              : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
          }`}
        >
          全部 ({characters.length})
        </button>
        {defaultTags.map(tag => {
          const count = characters.filter(c => (c.tags || []).includes(tag.value)).length;
          return (
            <button
              key={tag.value}
              onClick={() => setFilterTag(tag.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterTag === tag.value
                  ? 'text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
              }`}
              style={filterTag === tag.value ? { backgroundColor: tag.color } : {}}
            >
              {tag.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Characters List */}
      <div className="space-y-4 mb-6">
        {filteredCharacters.map((character, index) => {
          const originalIndex = characters.indexOf(character);
          const notes = character.notes || [];
          return (
            <div key={character.id} className="card group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative group/avatar">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer overflow-hidden border-2 border-transparent hover:border-accent transition-colors"
                      style={{ backgroundColor: character.avatar ? 'transparent' : (character.avatarColor || '#4a9eff') }}
                      onClick={() => document.getElementById(`avatar-upload-${originalIndex}`)?.click()}
                    >
                      {character.avatar ? (
                        <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-medium text-lg">
                          {character.name ? character.name[0].toUpperCase() : (originalIndex + 1)}
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      id={`avatar-upload-${originalIndex}`}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarUpload(originalIndex, e)}
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-bg-tertiary rounded-full border border-border flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => document.getElementById(`color-picker-${originalIndex}`)?.click()}>
                      <svg className="w-3 h-3 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div className="hidden">
                      <div id={`color-picker-${originalIndex}`} className="flex gap-1 p-2 bg-bg-secondary border border-border rounded-lg shadow-lg">
                        {avatarColors.map(color => (
                          <button
                            key={color}
                            className={`w-5 h-5 rounded-full border-2 ${character.avatarColor === color ? 'border-white' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleAvatarColorChange(originalIndex, color)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={character.name}
                    onChange={(e) => updateCharacter(originalIndex, 'name', e.target.value)}
                    placeholder="角色姓名"
                    className="text-lg font-medium text-text-primary bg-transparent border-b border-transparent hover:border-border focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
                <button
                  onClick={() => deleteCharacter(originalIndex)}
                  className="w-8 h-8 flex items-center justify-center rounded text-text-secondary hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="删除角色"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Tags Section */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-text-secondary mb-2">角色标签</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(character.tags || []).map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getTagColor(tag) }}
                    >
                      {getTagLabel(tag)}
                      <button
                        onClick={() => handleRemoveTag(originalIndex, tag)}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {defaultTags.filter(t => !(character.tags || []).includes(t.value)).map(tag => (
                    <button
                      key={tag.value}
                      onClick={() => handleTagToggle(originalIndex, tag.value)}
                      className="px-2 py-1 rounded-full text-xs bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80 border border-border"
                    >
                      + {tag.label}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="添加自定义标签..."
                    className="flex-1 bg-bg-tertiary border border-border rounded-md px-2 py-1 text-xs text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomTag(originalIndex, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">角色目标</label>
                  <input
                    type="text"
                    value={character.goal}
                    onChange={(e) => updateCharacter(originalIndex, 'goal', e.target.value)}
                    placeholder="角色想要什么"
                    className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-text-secondary mb-1.5">角色冲突</label>
                <textarea
                  value={character.conflict}
                  onChange={(e) => updateCharacter(originalIndex, 'conflict', e.target.value)}
                  placeholder="角色面临什么阻碍或矛盾"
                  className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                  rows={2}
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-text-secondary mb-1.5">角色感悟</label>
                <textarea
                  value={character.epiphany}
                  onChange={(e) => updateCharacter(originalIndex, 'epiphany', e.target.value)}
                  placeholder="角色在故事中的成长或领悟"
                  className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                  rows={2}
                />
              </div>

              {/* Notes Section */}
              <div className="mt-4 pt-4 border-t border-border">
                <label className="block text-xs font-medium text-text-secondary mb-2">自定义备注</label>
                <div className="space-y-2 mb-2">
                  {notes.map((note, noteIndex) => (
                    <div key={noteIndex} className="flex items-start gap-2 bg-bg-tertiary rounded-md px-3 py-2">
                      <span className="text-sm text-text-primary flex-1">{note}</span>
                      <button
                        onClick={() => handleRemoveNote(originalIndex, noteIndex)}
                        className="text-text-secondary hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="添加备注，按回车确认..."
                  className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddNote(originalIndex, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          );
        })}
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

      {/* Tips */}
      <CollapsibleTips title="人物概括提示">
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• 每个角色都应该有明确的目标和阻碍</li>
          <li>• 主角需要有成长弧线（从冲突到感悟）</li>
          <li>• 反派也应该有合理的动机</li>
          <li>• 配角服务于主角的成长</li>
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