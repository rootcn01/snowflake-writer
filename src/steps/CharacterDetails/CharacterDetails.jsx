import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../../store/ProjectContext';
import CollapsibleTips from '../../components/CollapsibleTips/CollapsibleTips';
import { v4 as uuidv4 } from 'uuid';

const avatarColors = [
  '#4a9eff', '#ef4a9e', '#4aef9e', '#efeb4a', '#9e4aef', '#4aefef',
  '#ff6b6b', '#6bff6b', '#6b6bff', '#ff9e6b', '#9e6bff', '#6bff9e'
];

// Template definitions
const templates = {
  basic: [
    { key: 'name', label: '姓名' },
    { key: 'age', label: '年龄' },
    { key: 'appearance', label: '外貌' },
    { key: 'background', label: '背景' }
  ],
  detailed: [
    { key: 'name', label: '姓名' },
    { key: 'age', label: '年龄' },
    { key: 'appearance', label: '外貌' },
    { key: 'background', label: '背景' },
    { key: 'desire', label: '欲望' },
    { key: 'fear', label: '恐惧' },
    { key: 'values', label: '价值观' },
    { key: 'keyMoment', label: '关键时刻' }
  ]
};

export default function CharacterDetails() {
  const { project, dispatch, showToast } = useProject();
  const [characterDetails, setCharacterDetails] = useState(project.steps.characterDetails || []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('basic');

  // Sync characterDetails with Step 3 characters - auto-create entries for new characters
  const syncWithStep3 = useCallback(() => {
    const step3Characters = project.steps.characters || [];
    const currentDetails = project.steps.characterDetails || [];
    let hasChanges = false;
    const newDetails = [...currentDetails];

    step3Characters.forEach((char) => {
      const exists = newDetails.some(d => d.id === char.id);
      if (!exists) {
        // Auto-create entry from Step 3 character
        newDetails.push({
          id: char.id,
          name: char.name || '',
          age: '',
          appearance: '',
          background: '',
          desire: char.goal || '',
          fear: '',
          values: '',
          keyMoment: char.epiphany || '',
          avatarColor: char.avatarColor || avatarColors[0],
          template: 'basic',
          customFields: []
        });
        hasChanges = true;
      } else {
        // Sync base info if characterDetails entry is empty
        const detailIndex = newDetails.findIndex(d => d.id === char.id);
        const detail = newDetails[detailIndex];
        if (detail) {
          const updates = {};
          if (!detail.name && char.name) updates.name = char.name;
          if (!detail.avatarColor && char.avatarColor) updates.avatarColor = char.avatarColor;
          if (!detail.template) updates.template = 'basic';
          if (!detail.customFields) updates.customFields = [];

          if (Object.keys(updates).length > 0) {
            newDetails[detailIndex] = { ...detail, ...updates };
            hasChanges = true;
          }
        }
      }
    });

    // Remove details for characters that no longer exist in Step 3
    const filteredDetails = newDetails.filter(d =>
      step3Characters.some(c => c.id === d.id)
    );

    if (hasChanges || filteredDetails.length !== newDetails.length) {
      setCharacterDetails(filteredDetails);
      dispatch({ type: 'UPDATE_CHARACTER_DETAILS', payload: filteredDetails });
    }
  }, [project.steps.characters, project.steps.characterDetails, dispatch]);

  // Sync on mount and when characters change
  useEffect(() => {
    syncWithStep3();
  }, [syncWithStep3]);

  // Set up TopBar selector
  useEffect(() => {
    const step3Characters = project.steps.characters || [];
    const items = step3Characters.map((c, i) => ({
      id: c.id,
      name: c.name || '未命名',
      index: i,
      hasContent: !!(c.goal || c.conflict || c.epiphany)
    }));
    dispatch({
      type: 'SET_TOPBAR_SELECTOR',
      payload: {
        label: '角色',
        icon: '👤',
        items,
        onAdd: null,
        onSelect: (id) => {
          const idx = step3Characters.findIndex(c => c.id === id);
          if (idx >= 0) setSelectedIndex(idx);
        }
      }
    });
    return () => dispatch({ type: 'SET_TOPBAR_SELECTOR', payload: null });
  }, [project.steps.characters, dispatch]);

  const updateCharacter = (index, field, value) => {
    const step3Characters = project.steps.characters || [];
    const charId = step3Characters[index]?.id;
    if (!charId) return;

    const newDetails = [...characterDetails];
    const detailIndex = newDetails.findIndex(d => d.id === charId);
    if (detailIndex >= 0) {
      newDetails[detailIndex] = { ...newDetails[detailIndex], [field]: value };
      setCharacterDetails(newDetails);
      dispatch({ type: 'UPDATE_CHARACTER_DETAILS', payload: newDetails });
    }
  };

  const handleTemplateChange = (index, template) => {
    setSelectedTemplate(template);
    updateCharacter(index, 'template', template);
  };

  const handleAddCustomField = (index, fieldLabel) => {
    if (!fieldLabel.trim()) return;
    const step3Characters = project.steps.characters || [];
    const charId = step3Characters[index]?.id;
    if (!charId) return;

    const newDetails = [...characterDetails];
    const detailIndex = newDetails.findIndex(d => d.id === charId);
    if (detailIndex >= 0) {
      const detail = newDetails[detailIndex];
      const customFields = detail.customFields || [];
      if (!customFields.some(f => f.key === fieldLabel.trim())) {
        const newField = { key: uuidv4(), label: fieldLabel.trim(), value: '' };
        newDetails[detailIndex] = { ...detail, customFields: [...customFields, newField] };
        setCharacterDetails(newDetails);
        dispatch({ type: 'UPDATE_CHARACTER_DETAILS', payload: newDetails });
      }
    }
  };

  const handleUpdateCustomField = (index, fieldKey, value) => {
    const step3Characters = project.steps.characters || [];
    const charId = step3Characters[index]?.id;
    if (!charId) return;

    const newDetails = [...characterDetails];
    const detailIndex = newDetails.findIndex(d => d.id === charId);
    if (detailIndex >= 0) {
      const detail = newDetails[detailIndex];
      const customFields = (detail.customFields || []).map(f =>
        f.key === fieldKey ? { ...f, value } : f
      );
      newDetails[detailIndex] = { ...detail, customFields };
      setCharacterDetails(newDetails);
      dispatch({ type: 'UPDATE_CHARACTER_DETAILS', payload: newDetails });
    }
  };

  const handleRemoveCustomField = (index, fieldKey) => {
    const step3Characters = project.steps.characters || [];
    const charId = step3Characters[index]?.id;
    if (!charId) return;

    const newDetails = [...characterDetails];
    const detailIndex = newDetails.findIndex(d => d.id === charId);
    if (detailIndex >= 0) {
      const detail = newDetails[detailIndex];
      const customFields = (detail.customFields || []).filter(f => f.key !== fieldKey);
      newDetails[detailIndex] = { ...detail, customFields };
      setCharacterDetails(newDetails);
      dispatch({ type: 'UPDATE_CHARACTER_DETAILS', payload: newDetails });
    }
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
  const step3Characters = project.steps.characters || [];
  const selectedCharacter = step3Characters[selectedIndex];
  const selectedDetail = selectedCharacter
    ? characterDetails.find(d => d.id === selectedCharacter.id)
    : null;

  const currentTemplate = selectedDetail?.template || 'basic';
  const currentFields = currentTemplate === 'detailed' ? templates.detailed : templates.basic;
  const customFields = selectedDetail?.customFields || [];

  return (
    <div className="max-w-content mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">角色宝典</h1>
        <p className="text-text-secondary">每个角色的详细信息，建立完整的人物档案。</p>
      </div>

      {/* Single Column Layout - Full Width Editor */}
      <div className="mb-6">
        <div className="card">
          {selectedCharacter && selectedDetail ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
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
                      {selectedDetail.name || selectedCharacter.name || '新角色'}
                    </h2>
                    <p className="text-xs text-text-secondary">角色宝典</p>
                  </div>
                </div>
                {/* Template Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">模板:</span>
                  <button
                    onClick={() => handleTemplateChange(selectedIndex, 'basic')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      currentTemplate === 'basic'
                        ? 'bg-accent text-white'
                        : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
                    }`}
                  >
                    基础
                  </button>
                  <button
                    onClick={() => handleTemplateChange(selectedIndex, 'detailed')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      currentTemplate === 'detailed'
                        ? 'bg-accent text-white'
                        : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
                    }`}
                  >
                    详细
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {currentFields.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      {field.label}
                    </label>
                    {field.key === 'name' ? (
                      <input
                        type="text"
                        value={selectedDetail[field.key] || ''}
                        onChange={(e) => updateCharacter(selectedIndex, field.key, e.target.value)}
                        placeholder={`输入${field.label}`}
                        className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                      />
                    ) : (
                      <textarea
                        value={selectedDetail[field.key] || ''}
                        onChange={(e) => updateCharacter(selectedIndex, field.key, e.target.value)}
                        placeholder={`输入${field.label}`}
                        className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent resize-none"
                        rows={2}
                      />
                    )}
                  </div>
                ))}

                {/* Custom Fields Section */}
                {customFields.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <label className="block text-xs font-medium text-text-secondary mb-3">自定义字段</label>
                    <div className="space-y-3">
                      {customFields.map(field => (
                        <div key={field.key}>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-text-secondary">{field.label}</label>
                            <button
                              onClick={() => handleRemoveCustomField(selectedIndex, field.key)}
                              className="text-text-secondary hover:text-red-500"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <textarea
                            value={field.value || ''}
                            onChange={(e) => handleUpdateCustomField(selectedIndex, field.key, e.target.value)}
                            placeholder={`输入${field.label}`}
                            className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent resize-none"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Custom Field */}
                <div className="pt-4 border-t border-border">
                  <label className="block text-xs font-medium text-text-secondary mb-2">添加自定义字段</label>
                  <input
                    type="text"
                    placeholder="输入字段名称，按回车添加..."
                    className="w-full bg-bg-tertiary border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomField(selectedIndex, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <svg className="w-12 h-12 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-text-secondary">请先在Step 3创建角色</p>
              <p className="text-xs text-text-secondary mt-1">角色数据将从Step 3自动同步</p>
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
