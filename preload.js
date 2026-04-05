const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveProject: (project) => ipcRenderer.invoke('save-project', project),
  loadProjects: () => ipcRenderer.invoke('load-projects'),
  exportMarkdown: (data) => ipcRenderer.invoke('export-markdown', data)
});
