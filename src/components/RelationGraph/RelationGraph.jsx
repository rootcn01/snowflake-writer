import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useProject } from '../../store/ProjectContext';
import { v4 as uuidv4 } from 'uuid';

const RELATION_TYPES = [
  { id: 'family', label: '血缘', color: '#4ade80' },
  { id: 'enemy', label: '冲突', color: '#f87171' },
  { id: 'love', label: '爱情', color: '#f472b6' },
  { id: 'friend', label: '朋友', color: '#60a5fa' },
  { id: 'custom', label: '自定义', color: '#a78bfa' }
];

export default function RelationGraph() {
  const { project, dispatch, showToast } = useProject();
  const graphRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedRelation, setSelectedRelation] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ sourceId: '', targetId: '', type: 'friend', label: '' });
  const [filterType, setFilterType] = useState('all');
  const [draggedNode, setDraggedNode] = useState(null);

  const characters = project.steps.characters || [];
  const scenes = project.steps.sceneOutlines || [];
  const relationships = project.meta?.relationships || [];

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Build graph data
  const graphData = useMemo(() => {
    const nodes = [];
    const links = [];

    // Add character nodes
    characters.forEach((char) => {
      nodes.push({
        id: char.id,
        type: 'character',
        name: char.name,
        avatar: char.avatar,
        avatarColor: char.avatarColor
      });
    });

    // Add scene nodes
    scenes.forEach((scene, idx) => {
      nodes.push({
        id: scene.id,
        type: 'scene',
        name: scene.name || `场景${idx + 1}`,
        timeline: scene.timeline
      });
    });

    // Filter relationships based on selected type
    const filteredRels = filterType === 'all'
      ? relationships
      : relationships.filter(r => r.type === filterType);

    // Add relationship links
    filteredRels.forEach((rel) => {
      links.push({
        id: rel.id,
        source: rel.sourceId,
        target: rel.targetId,
        type: rel.type,
        label: rel.label
      });
    });

    return { nodes, links };
  }, [characters, scenes, relationships, filterType]);

  // Get node color based on type
  const getNodeColor = useCallback((node) => {
    if (node.type === 'character') {
      return node.avatarColor || '#4a9eff';
    }
    return '#fbbf24';
  }, []);

  // Handle link click
  const handleLinkClick = useCallback((link) => {
    setSelectedRelation(link);
    setSelectedNode(null);
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    setSelectedRelation(null);
  }, []);

  // Handle node drag
  const handleNodeDrag = useCallback((node) => {
    setDraggedNode(node.id);
  }, []);

  // Handle node drag end - save position
  const handleNodeDragEnd = useCallback(() => {
    setDraggedNode(null);
  }, []);

  // Add new relationship
  const handleAddRelation = useCallback(() => {
    if (!addForm.sourceId || !addForm.targetId) {
      showToast('error', '请选择两个节点');
      return;
    }
    if (addForm.sourceId === addForm.targetId) {
      showToast('error', '不能选择相同的节点');
      return;
    }

    const newRel = {
      id: uuidv4(),
      sourceId: addForm.sourceId,
      targetId: addForm.targetId,
      type: addForm.type,
      label: addForm.label || ''
    };

    const newRelationships = [...relationships, newRel];
    dispatch({ type: 'UPDATE_RELATIONSHIPS', payload: newRelationships });
    showToast('success', '关系已添加');

    setShowAddModal(false);
    setAddForm({ sourceId: '', targetId: '', type: 'friend', label: '' });
  }, [addForm, relationships, dispatch, showToast]);

  // Delete relationship
  const handleDeleteRelation = useCallback((relId) => {
    const newRelationships = relationships.filter(r => r.id !== relId);
    dispatch({ type: 'UPDATE_RELATIONSHIPS', payload: newRelationships });
    setSelectedRelation(null);
    showToast('success', '关系已删除');
  }, [relationships, dispatch, showToast]);

  // Get relation type info
  const getRelationTypeInfo = useCallback((type) => {
    return RELATION_TYPES.find(t => t.id === type) || RELATION_TYPES[4];
  }, []);

  // Simple canvas-based rendering (since react-force-graph has issues with certain setups)
  const renderSimpleGraph = useCallback(() => {
    const canvas = document.getElementById('relation-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate node positions (simple circular layout)
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    const nodePositions = {};
    graphData.nodes.forEach((node, idx) => {
      const angle = (idx / graphData.nodes.length) * 2 * Math.PI - Math.PI / 2;
      nodePositions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        node
      };
    });

    // Draw links
    graphData.links.forEach((link) => {
      const source = nodePositions[link.source];
      const target = nodePositions[link.target];
      if (!source || !target) return;

      const typeInfo = getRelationTypeInfo(link.type);
      ctx.beginPath();
      ctx.strokeStyle = typeInfo.color;
      ctx.lineWidth = 2;
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();

      // Draw label at midpoint
      if (link.label) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        ctx.fillStyle = typeInfo.color;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(link.label, midX, midY - 5);
      }
    });

    // Draw nodes
    Object.values(nodePositions).forEach(({ x, y, node }) => {
      const isSelected = selectedNode?.id === node.id;
      const radius = isSelected ? 35 : 30;

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);

      if (node.type === 'character') {
        ctx.fillStyle = node.avatarColor || '#4a9eff';
      } else {
        ctx.fillStyle = '#fbbf24';
      }
      ctx.fill();

      // Border
      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw avatar or initial
      if (node.type === 'character' && node.avatar) {
        ctx.fillText('👤', x, y);
      } else if (node.type === 'character') {
        ctx.fillText(node.name?.charAt(0) || '?', x, y);
      } else {
        ctx.fillText('📍', x, y);
      }

      // Name below
      ctx.fillStyle = '#e8e8e8';
      ctx.font = '11px sans-serif';
      ctx.fillText(node.name, x, y + radius + 15);
    });

    // Store positions for interaction
    canvas.nodePositions = nodePositions;
  }, [graphData, dimensions, selectedNode, getRelationTypeInfo]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e) => {
    const canvas = document.getElementById('relation-canvas');
    if (!canvas || !canvas.nodePositions) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    for (const [id, pos] of Object.entries(canvas.nodePositions)) {
      const dx = x - pos.x;
      const dy = y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 30) {
        handleNodeClick(pos.node);
        return;
      }
    }

    // Find clicked link
    for (const link of graphData.links) {
      const source = canvas.nodePositions[link.source];
      const target = canvas.nodePositions[link.target];
      if (!source || !target) continue;

      // Point to line distance
      const A = x - source.x;
      const B = y - source.y;
      const C = target.x - source.x;
      const D = target.y - source.y;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      if (lenSq !== 0) param = dot / lenSq;

      let xx, yy;
      if (param < 0) {
        xx = source.x;
        yy = source.y;
      } else if (param > 1) {
        xx = target.x;
        yy = target.y;
      } else {
        xx = source.x + param * C;
        yy = source.y + param * D;
      }

      const dx2 = x - xx;
      const dy2 = y - yy;
      const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

      if (dist2 < 10) {
        handleLinkClick(link);
        return;
      }
    }

    // Clicked on nothing
    setSelectedNode(null);
    setSelectedRelation(null);
  }, [graphData, handleNodeClick, handleLinkClick]);

  // Render graph on data/selection change
  useEffect(() => {
    renderSimpleGraph();
  }, [renderSimpleGraph]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => renderSimpleGraph();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderSimpleGraph]);

  // Get selected item details
  const getSelectedDetails = () => {
    if (selectedNode) {
      if (selectedNode.type === 'character') {
        const char = characters.find(c => c.id === selectedNode.id);
        return char;
      } else {
        const scene = scenes.find(s => s.id === selectedNode.id);
        return scene;
      }
    }
    if (selectedRelation) {
      const sourceNode = graphData.nodes.find(n => n.id === selectedRelation.source);
      const targetNode = graphData.nodes.find(n => n.id === selectedRelation.target);
      return { relation: selectedRelation, sourceNode, targetNode };
    }
    return null;
  };

  const details = getSelectedDetails();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-text-primary">关系图谱</h1>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-bg-tertiary text-text-primary px-3 py-1.5 rounded border border-border text-sm"
          >
            <option value="all">全部关系</option>
            {RELATION_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>

          {/* Add Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-1.5 bg-accent text-white rounded hover:bg-accent-hover transition-colors text-sm font-medium"
          >
            + 添加关系
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Graph Canvas */}
        <div
          ref={containerRef}
          className="flex-1 bg-bg-secondary rounded-lg border border-border relative"
        >
          <canvas
            id="relation-canvas"
            className="w-full h-full cursor-pointer"
            onClick={handleCanvasClick}
          />

          {/* Empty State */}
          {graphData.nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-text-secondary">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm">暂无角色或场景数据</p>
              <p className="text-xs mt-1">请先在 Step 3/6 中添加内容</p>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-3 left-3 bg-bg-primary/90 rounded px-3 py-2 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#4a9eff]" />
                <span className="text-text-secondary">角色</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <span className="text-text-secondary">场景</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="w-72 bg-bg-secondary rounded-lg border border-border p-4 overflow-y-auto">
          {details ? (
            <div className="space-y-4">
              {selectedNode && (
                <>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
                      style={{ backgroundColor: selectedNode.type === 'character' ? (selectedNode.avatarColor || '#4a9eff') : '#fbbf24' }}
                    >
                      {selectedNode.type === 'character' ? selectedNode.name?.charAt(0) || '?' : '📍'}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary">{selectedNode.name}</h3>
                      <span className="text-xs text-text-secondary">
                        {selectedNode.type === 'character' ? '角色' : '场景'}
                      </span>
                    </div>
                  </div>

                  {selectedNode.type === 'character' && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-text-secondary">目标:</span>
                        <p className="text-text-primary">{details.goal || '未设置'}</p>
                      </div>
                      <div>
                        <span className="text-text-secondary">冲突:</span>
                        <p className="text-text-primary">{details.conflict || '未设置'}</p>
                      </div>
                      <div>
                        <span className="text-text-secondary">顿悟:</span>
                        <p className="text-text-primary">{details.epiphany || '未设置'}</p>
                      </div>
                    </div>
                  )}

                  {selectedNode.type === 'scene' && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-text-secondary">时间:</span>
                        <p className="text-text-primary">{details.time || '未设置'}</p>
                      </div>
                      <div>
                        <span className="text-text-secondary">地点:</span>
                        <p className="text-text-primary">{details.location || '未设置'}</p>
                      </div>
                      <div>
                        <span className="text-text-secondary">目标:</span>
                        <p className="text-text-primary">{details.goal || '未设置'}</p>
                      </div>
                      <div>
                        <span className="text-text-secondary">结局:</span>
                        <p className="text-text-primary">{details.outcome || '未设置'}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedRelation && (
                <>
                  <div>
                    <h3 className="font-bold text-text-primary mb-2">关系详情</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: getRelationTypeInfo(selectedRelation.type).color }}
                      >
                        {getRelationTypeInfo(selectedRelation.type).label}
                      </span>
                      {selectedRelation.label && (
                        <span className="text-sm text-text-primary">{selectedRelation.label}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: selectedRelation.sourceNode?.avatarColor || '#4a9eff' }}
                      >
                        {selectedRelation.sourceNode?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-text-secondary">→</span>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: selectedRelation.targetNode?.avatarColor || '#4a9eff' }}
                      >
                        {selectedRelation.targetNode?.name?.charAt(0) || '?'}
                      </div>
                    </div>
                    <p className="text-text-secondary">
                      {selectedRelation.sourceNode?.name || '未知'} → {selectedRelation.targetNode?.name || '未知'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteRelation(selectedRelation.id)}
                    className="w-full mt-4 px-3 py-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors text-sm"
                  >
                    删除此关系
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-text-secondary text-sm">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <p className="text-center">点击节点或连线查看详情</p>
              <p className="text-xs mt-1 text-center">点击"添加关系"创建新关系</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Relationship Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary rounded-lg border border-border w-96 p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">添加关系</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">从 (节点A)</label>
                <select
                  value={addForm.sourceId}
                  onChange={(e) => setAddForm({ ...addForm, sourceId: e.target.value })}
                  className="w-full bg-bg-tertiary text-text-primary px-3 py-2 rounded border border-border"
                >
                  <option value="">选择节点...</option>
                  {graphData.nodes.map(node => (
                    <option key={node.id} value={node.id}>
                      {node.type === 'character' ? '👤' : '📍'} {node.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">到 (节点B)</label>
                <select
                  value={addForm.targetId}
                  onChange={(e) => setAddForm({ ...addForm, targetId: e.target.value })}
                  className="w-full bg-bg-tertiary text-text-primary px-3 py-2 rounded border border-border"
                >
                  <option value="">选择节点...</option>
                  {graphData.nodes.filter(n => n.id !== addForm.sourceId).map(node => (
                    <option key={node.id} value={node.id}>
                      {node.type === 'character' ? '👤' : '📍'} {node.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">关系类型</label>
                <div className="flex flex-wrap gap-2">
                  {RELATION_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setAddForm({ ...addForm, type: type.id })}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        addForm.type === type.id
                          ? 'text-white'
                          : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                      }`}
                      style={addForm.type === type.id ? { backgroundColor: type.color } : {}}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">关系名称 (可选)</label>
                <input
                  type="text"
                  value={addForm.label}
                  onChange={(e) => setAddForm({ ...addForm, label: e.target.value })}
                  placeholder="如: 父子、师生..."
                  className="w-full bg-bg-tertiary text-text-primary px-3 py-2 rounded border border-border"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddForm({ sourceId: '', targetId: '', type: 'friend', label: '' });
                }}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddRelation}
                className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-hover transition-colors font-medium"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}