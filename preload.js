const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 项目操作
  saveProject: (project) => ipcRenderer.invoke('save-project', project),
  loadProjects: () => ipcRenderer.invoke('load-projects'),
  loadProject: (projectId) => ipcRenderer.invoke('load-project', projectId),
  createProject: (data) => ipcRenderer.invoke('create-project', data),
  deleteProject: (projectId) => ipcRenderer.invoke('delete-project', projectId),
  copyProject: (projectId) => ipcRenderer.invoke('copy-project', projectId),

  // 导出
  exportMarkdown: (data) => ipcRenderer.invoke('export-markdown', data)
});
