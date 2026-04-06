import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useProject } from '../../store/ProjectContext';

const TIMELINE_SECTIONS = [
  { id: 'early', label: '早期', color: '#60a5fa' },
  { id: 'middle', label: '中期', color: '#fbbf24' },
  { id: 'late', label: '晚期', color: '#f87171' }
];

export default function Timeline() {
  const { project, dispatch, showToast } = useProject();
  const containerRef = useRef();
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'list'
  const [selectedScene, setSelectedScene] = useState(null);
  const [draggedScene, setDraggedScene] = useState(null);
  const [dragOverSection, setDragOverSection] = useState(null);

  const sceneOutlines = project.steps.sceneOutlines || [];
  const scenes = project.steps.scenes || [];

  // Group scenes by timeline
  const scenesByTimeline = useMemo(() => {
    const grouped = {
      early: [],
      middle: [],
      late: []
    };

    // First add from sceneOutlines
    sceneOutlines.forEach((scene, idx) => {
      const timeline = scene.timeline || 'middle';
      grouped[timeline].push({
        ...scene,
        source: 'outline',
        index: idx
      });
    });

    return grouped;
  }, [sceneOutlines]);

  // Handle scene click
  const handleSceneClick = useCallback((scene) => {
    setSelectedScene(scene);
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((e, scene) => {
    setDraggedScene(scene);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  // Handle drag over section
  const handleDragOver = useCallback((e, sectionId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSection(sectionId);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragOverSection(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e, sectionId) => {
    e.preventDefault();
    if (!draggedScene) return;

    // Update scene timeline
    const updatedOutlines = [...sceneOutlines];
    const sceneIndex = updatedOutlines.findIndex(s => s.id === draggedScene.id);
    if (sceneIndex !== -1) {
      updatedOutlines[sceneIndex] = {
        ...updatedOutlines[sceneIndex],
        timeline: sectionId
      };
      dispatch({ type: 'UPDATE_SCENE_OUTLINES', payload: updatedOutlines });
      showToast('success', `已移动到${TIMELINE_SECTIONS.find(s => s.id === sectionId)?.label}`);
    }

    setDraggedScene(null);
    setDragOverSection(null);
  }, [draggedScene, sceneOutlines, dispatch, showToast]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedScene(null);
    setDragOverSection(null);
  }, []);

  // Get scene details
  const getSceneDetails = useCallback((scene) => {
    if (scene.source === 'outline') {
      return {
        ...scene,
        name: scene.goal ? `场景 ${scene.index + 1}` : '未命名场景',
        location: scene.location || '未设定',
        goal: scene.goal || '未设定',
        outcome: scene.outcome || '未设定'
      };
    }
    return scene;
  }, []);

  // Selected scene details
  const selectedDetails = selectedScene ? getSceneDetails(selectedScene) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-text-primary">时间线</h1>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-bg-tertiary rounded-lg p-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              时间线视图
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              列表视图
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Timeline Track */}
          <div
            ref={containerRef}
            className="flex-1 bg-bg-secondary rounded-lg border border-border p-6 overflow-x-auto"
          >
            {sceneOutlines.length === 0 ? (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center text-text-secondary">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">暂无场景数据</p>
                <p className="text-xs mt-1">请先在 Step 6 中添加场景大纲</p>
              </div>
            ) : (
              /* Timeline Sections */
              <div className="flex gap-4 min-h-full">
                {TIMELINE_SECTIONS.map((section) => (
                  <div
                    key={section.id}
                    className={`flex-1 min-w-[280px] rounded-lg border-2 transition-colors ${
                      dragOverSection === section.id
                        ? 'border-accent bg-accent/5'
                        : 'border-border bg-bg-primary/50'
                    }`}
                    onDragOver={(e) => handleDragOver(e, section.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, section.id)}
                  >
                    {/* Section Header */}
                    <div
                      className="px-4 py-3 rounded-t-lg border-b border-border"
                      style={{ borderColor: section.color }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: section.color }}
                        />
                        <h3 className="font-bold text-text-primary">{section.label}</h3>
                        <span className="text-xs text-text-secondary">
                          ({scenesByTimeline[section.id].length}个场景)
                        </span>
                      </div>
                    </div>

                    {/* Scenes */}
                    <div className="p-3 space-y-2">
                      {scenesByTimeline[section.id].length === 0 ? (
                        <div className="text-center py-8 text-text-secondary text-sm">
                          拖拽场景到此处
                        </div>
                      ) : (
                        scenesByTimeline[section.id].map((scene) => (
                          <div
                            key={scene.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, scene)}
                            onDragEnd={handleDragEnd}
                            onClick={() => handleSceneClick(scene)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedScene?.id === scene.id
                                ? 'border-accent bg-accent/10'
                                : 'border-border bg-bg-secondary hover:border-accent/50'
                            } ${draggedScene?.id === scene.id ? 'opacity-50' : ''}`}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: section.color }}
                              >
                                {scene.index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-text-primary text-sm truncate">
                                  {scene.goal || `场景 ${scene.index + 1}`}
                                </h4>
                                {scene.location && (
                                  <p className="text-xs text-text-secondary mt-1 truncate">
                                    📍 {scene.location}
                                  </p>
                                )}
                                {scene.characterIds && scene.characterIds.length > 0 && (
                                  <p className="text-xs text-text-secondary mt-1">
                                    👤 {scene.characterIds.length}个角色
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Panel */}
          {selectedDetails && (
            <div className="mt-4 bg-bg-secondary rounded-lg border border-border p-4">
              <h3 className="font-bold text-text-primary mb-3">场景详情</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-secondary">时间</span>
                  <p className="text-text-primary">
                    {TIMELINE_SECTIONS.find(s => s.id === selectedDetails.timeline)?.label || '未设定'}
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary">地点</span>
                  <p className="text-text-primary">{selectedDetails.location}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-text-secondary">目标</span>
                  <p className="text-text-primary">{selectedDetails.goal}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-text-secondary">结局</span>
                  <p className="text-text-primary">{selectedDetails.outcome}</p>
                </div>
                {selectedDetails.characterIds && selectedDetails.characterIds.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-text-secondary">涉及角色</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedDetails.characterIds.map(charId => {
                        const char = project.steps.characters.find(c => c.id === charId);
                        return char ? (
                          <span
                            key={charId}
                            className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs"
                          >
                            {char.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="flex-1 bg-bg-secondary rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-bg-tertiary">
              <tr className="text-left text-sm text-text-secondary">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">场景</th>
                <th className="px-4 py-3 font-medium">时间</th>
                <th className="px-4 py-3 font-medium">地点</th>
                <th className="px-4 py-3 font-medium">目标</th>
                <th className="px-4 py-3 font-medium">结局</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sceneOutlines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-secondary">
                    暂无场景数据，请在 Step 6 中添加
                  </td>
                </tr>
              ) : (
                sceneOutlines.map((scene, idx) => (
                  <tr
                    key={scene.id}
                    onClick={() => handleSceneClick(scene)}
                    className={`cursor-pointer hover:bg-bg-tertiary/50 transition-colors ${
                      selectedScene?.id === scene.id ? 'bg-accent/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-text-secondary text-sm">{idx + 1}</td>
                    <td className="px-4 py-3 text-text-primary">
                      {scene.goal ? `场景 ${idx + 1}` : '未命名'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-xs text-white"
                        style={{
                          backgroundColor: TIMELINE_SECTIONS.find(s => s.id === scene.timeline)?.color || '#888'
                        }}
                      >
                        {TIMELINE_SECTIONS.find(s => s.id === scene.timeline)?.label || '未设定'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-sm">{scene.location || '-'}</td>
                    <td className="px-4 py-3 text-text-secondary text-sm truncate max-w-[200px]">
                      {scene.goal || '-'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-sm truncate max-w-[200px]">
                      {scene.outcome || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}