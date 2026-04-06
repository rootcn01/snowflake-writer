import React, { useState, useEffect, useCallback } from 'react';
import { useProject } from '../../store/ProjectContext';

export default function BackupModal({ onClose }) {
  const { project, dispatch, showToast } = useProject();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoBackup, setAutoBackup] = useState(
    localStorage.getItem('autoBackup') !== 'false'
  );
  const [restoring, setRestoring] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(null);

  // Load backups
  const loadBackups = useCallback(async () => {
    setLoading(true);
    const result = await window.electronAPI.listBackups(project.id);
    if (result.success) {
      setBackups(result.backups);
    } else {
      showToast('error', '加载备份失败');
    }
    setLoading(false);
  }, [project.id, showToast]);

  useEffect(() => {
    loadBackups();
  }, [loadBackups]);

  // Toggle auto backup
  const handleToggleAutoBackup = useCallback(() => {
    const newValue = !autoBackup;
    setAutoBackup(newValue);
    localStorage.setItem('autoBackup', String(newValue));
    showToast('success', newValue ? '已开启自动备份' : '已关闭自动备份');
  }, [autoBackup, showToast]);

  // Create manual backup
  const handleCreateBackup = useCallback(async () => {
    const result = await window.electronAPI.createBackup(project.id);
    if (result.success) {
      showToast('success', '备份已创建');
      loadBackups();
    } else {
      showToast('error', '备份失败: ' + result.error);
    }
  }, [project.id, showToast, loadBackups]);

  // Restore backup
  const handleRestore = useCallback(async (backup, mode) => {
    setRestoring(backup.fileName);
    const result = await window.electronAPI.restoreBackup({
      projectId: project.id,
      backupFile: backup.fileName,
      mode
    });

    if (result.success) {
      if (mode === 'overwrite') {
        // 重新加载项目
        const loadResult = await window.electronAPI.loadProject(project.id);
        if (loadResult.success) {
          dispatch({ type: 'SET_PROJECT', payload: loadResult.project });
          showToast('success', '已恢复到备份版本');
        }
      } else {
        showToast('success', '已恢复到新项目: ' + result.project.title);
      }
      setShowRestoreModal(null);
    } else {
      showToast('error', '恢复失败: ' + result.error);
    }
    setRestoring(null);
  }, [project.id, dispatch, showToast]);

  // Delete backup
  const handleDelete = useCallback(async (backup) => {
    const result = await window.electronAPI.deleteBackup({
      projectId: project.id,
      backupFile: backup.fileName
    });

    if (result.success) {
      showToast('success', '备份已删除');
      loadBackups();
    } else {
      showToast('error', '删除失败: ' + result.error);
    }
  }, [project.id, showToast, loadBackups]);

  // Format date
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-lg border border-border w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">备份管理</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg-tertiary rounded transition-colors"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Auto Backup Toggle */}
          <div className="flex items-center justify-between mb-6 p-4 bg-bg-tertiary rounded-lg">
            <div>
              <h3 className="font-medium text-text-primary">自动备份</h3>
              <p className="text-xs text-text-secondary mt-1">保存时自动备份，保留最近5个版本</p>
            </div>
            <button
              onClick={handleToggleAutoBackup}
              className={`w-12 h-6 rounded-full transition-colors ${
                autoBackup ? 'bg-accent' : 'bg-bg-primary'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  autoBackup ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Backup List */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-text-secondary mb-3">
              备份列表 ({backups.length}/5)
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full" />
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8 text-text-secondary text-sm">
                暂无备份记录
              </div>
            ) : (
              <div className="space-y-2">
                {backups.map((backup) => (
                  <div
                    key={backup.fileName}
                    className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-sm text-text-primary">
                          {formatDate(backup.createdAt)}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {backup.formattedSize}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowRestoreModal(backup)}
                        className="px-3 py-1.5 text-xs bg-accent/10 hover:bg-accent/20 text-accent rounded transition-colors"
                      >
                        恢复
                      </button>
                      <button
                        onClick={() => handleDelete(backup)}
                        className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={handleCreateBackup}
            className="w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
          >
            立即备份
          </button>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-bg-secondary rounded-lg border border-border w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">恢复备份</h3>
            <p className="text-text-secondary text-sm mb-6">
              确定要恢复此备份吗？
            </p>

            <div className="space-y-2 mb-6">
              <button
                onClick={() => handleRestore(showRestoreModal, 'overwrite')}
                disabled={restoring === showRestoreModal.fileName}
                className="w-full px-4 py-3 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-sm font-medium transition-colors text-left flex items-center justify-between"
              >
                <span>覆盖当前项目</span>
                {restoring === showRestoreModal.fileName && (
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                )}
              </button>
              <button
                onClick={() => handleRestore(showRestoreModal, 'new')}
                disabled={restoring === showRestoreModal.fileName}
                className="w-full px-4 py-3 bg-bg-tertiary hover:bg-bg-primary text-text-primary rounded-lg text-sm font-medium transition-colors text-left flex items-center justify-between"
              >
                <span>恢复到新项目</span>
                {restoring === showRestoreModal.fileName && (
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            </div>

            <button
              onClick={() => setShowRestoreModal(null)}
              className="w-full px-4 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}