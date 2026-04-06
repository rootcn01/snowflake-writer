import React, { useState, useEffect } from 'react';
import { useProject } from '../../store/ProjectContext';

const ICONS = ['📖', '📚', '📕', '📗', '📘', '📙', '📓', '📔', '📒', '📚', '🗒️', '📝', '✏️', '📜', '📃', '📄'];

export default function ProjectLibrary() {
  const { dispatch, showToast } = useProject();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null); // project to delete
  const [createForm, setCreateForm] = useState({ title: '', icon: '📖' });

  // 加载项目列表
  const loadProjects = async () => {
    setLoading(true);
    const result = await window.electronAPI.loadProjects();
    if (result.success) {
      // 按更新时间倒序
      const sorted = result.projects.sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setProjects(sorted);
    } else {
      showToast('error', '加载项目失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // 创建项目
  const handleCreate = async () => {
    if (!createForm.title.trim()) {
      showToast('error', '请输入项目名称');
      return;
    }
    const result = await window.electronAPI.createProject(createForm);
    if (result.success) {
      showToast('success', '项目创建成功');
      setShowCreateModal(false);
      setCreateForm({ title: '', icon: '📖' });
      // 打开新创建的项目
      handleOpenProject(result.project.id);
    } else {
      showToast('error', '创建失败: ' + result.error);
    }
  };

  // 删除项目
  const handleDelete = async () => {
    if (!showDeleteModal) return;
    const result = await window.electronAPI.deleteProject(showDeleteModal.id);
    if (result.success) {
      showToast('success', '项目已删除');
      setShowDeleteModal(null);
      loadProjects();
    } else {
      showToast('error', '删除失败: ' + result.error);
    }
  };

  // 复制项目
  const handleCopy = async (project) => {
    const result = await window.electronAPI.copyProject(project.id);
    if (result.success) {
      showToast('success', '项目已复制');
      loadProjects();
    } else {
      showToast('error', '复制失败: ' + result.error);
    }
  };

  // 打开项目
  const handleOpenProject = async (projectId) => {
    const result = await window.electronAPI.loadProject(projectId);
    if (result.success) {
      dispatch({ type: 'SET_PROJECT', payload: result.project });
      dispatch({ type: 'SET_STEP', payload: result.project.currentStep || 0 });
      dispatch({ type: 'SET_CURRENT_VIEW', payload: 'project' });
      showToast('success', '项目已加载');
    } else {
      showToast('error', '打开失败: ' + result.error);
    }
  };

  // 格式化日期
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">❄️</span>
          <h1 className="text-2xl font-bold text-text-primary">项目库</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建项目
          </button>
        </div>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl text-text-primary mb-2">暂无项目</h2>
          <p className="text-text-secondary mb-6">创建你的第一个写作项目吧</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
          >
            创建项目
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-bg-secondary border border-border rounded-xl p-5 hover:border-accent/50 transition-all group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{project.icon}</span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-medium text-text-primary truncate">
                      {project.title}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {formatDate(project.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                  <span>完成度</span>
                  <span>{project.completedSteps.length}/10</span>
                </div>
                <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: `${(project.completedSteps.length / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => handleOpenProject(project.id)}
                  className="flex-1 px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-sm font-medium transition-colors"
                >
                  打开
                </button>
                <button
                  onClick={() => handleCopy(project)}
                  className="p-2 hover:bg-bg-tertiary text-text-secondary hover:text-text-primary rounded-lg transition-colors"
                  title="复制项目"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowDeleteModal(project)}
                  className="p-2 hover:bg-red-500/10 text-text-secondary hover:text-red-500 rounded-lg transition-colors"
                  title="删除项目"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-text-primary mb-6">新建项目</h2>

            <div className="space-y-5">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  项目名称
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="我的小说"
                  className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
                  autoFocus
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  项目图标
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setCreateForm({ ...createForm, icon })}
                      className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center transition-colors
                        ${createForm.icon === icon
                          ? 'bg-accent/20 ring-2 ring-accent'
                          : 'bg-bg-tertiary hover:bg-bg-primary'
                        }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({ title: '', icon: '📖' });
                }}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-sm p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">删除项目</h2>
              <p className="text-text-secondary">
                确定要删除「{showDeleteModal.title}」吗？此操作不可撤销。
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2.5 bg-bg-tertiary hover:bg-bg-primary text-text-primary rounded-lg font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}