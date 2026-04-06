const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  });

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // 禁用原生菜单栏
  Menu.setApplicationMenu(null);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 获取用户文档目录
function getUserDataPath() {
  return app.getPath('documents');
}

// 保存项目
ipcMain.handle('save-project', async (event, project) => {
  try {
    const userDataPath = getUserDataPath();
    const projectDir = path.join(userDataPath, 'SnowflakeWriter');

    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    const filePath = path.join(projectDir, `${project.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(project, null, 2), 'utf-8');
    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 加载项目列表（仅返回元数据，用于项目库展示）
ipcMain.handle('load-projects', async () => {
  try {
    const userDataPath = getUserDataPath();
    const projectDir = path.join(userDataPath, 'SnowflakeWriter');

    if (!fs.existsSync(projectDir)) {
      return { success: true, projects: [] };
    }

    const files = fs.readdirSync(projectDir).filter(f => f.endsWith('.json'));
    const projects = files.map(file => {
      const content = fs.readFileSync(path.join(projectDir, file), 'utf-8');
      const project = JSON.parse(content);
      // 只返回元数据，不返回完整的 steps 数据
      return {
        id: project.id,
        title: project.title,
        icon: project.icon || '📖',
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        completedSteps: project.meta?.completedSteps || [],
        currentStep: project.currentStep || 0
      };
    });

    return { success: true, projects };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 加载单个项目完整数据
ipcMain.handle('load-project', async (event, projectId) => {
  try {
    const userDataPath = getUserDataPath();
    const projectDir = path.join(userDataPath, 'SnowflakeWriter');
    const filePath = path.join(projectDir, `${projectId}.json`);

    if (!fs.existsSync(filePath)) {
      return { success: false, error: '项目不存在' };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const project = JSON.parse(content);
    return { success: true, project };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 创建新项目
ipcMain.handle('create-project', async (event, { title, icon }) => {
  try {
    const userDataPath = getUserDataPath();
    const projectDir = path.join(userDataPath, 'SnowflakeWriter');

    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    const { v4: uuidv4 } = require('uuid');
    const now = new Date().toISOString();
    const project = {
      id: uuidv4(),
      title: title || '未命名',
      icon: icon || '📖',
      createdAt: now,
      updatedAt: now,
      currentStep: 0,
      steps: {
        oneSentence: '',
        oneParagraph: [{ id: uuidv4(), label: '吸引点', content: '' }],
        characters: [],
        storySynopsis: '',
        characterDetails: [],
        sceneOutlines: [],
        scenes: [],
        characterBackstories: [],
        sceneDescriptions: [],
        chapters: []
      },
      meta: {
        completedSteps: []
      }
    };

    const filePath = path.join(projectDir, `${project.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(project, null, 2), 'utf-8');

    // 返回元数据
    return {
      success: true,
      project: {
        id: project.id,
        title: project.title,
        icon: project.icon,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        completedSteps: project.meta.completedSteps,
        currentStep: project.currentStep
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 删除项目
ipcMain.handle('delete-project', async (event, projectId) => {
  try {
    const userDataPath = getUserDataPath();
    const projectDir = path.join(userDataPath, 'SnowflakeWriter');
    const filePath = path.join(projectDir, `${projectId}.json`);
    const backupDir = path.join(projectDir, '.backup', projectId);

    // 删除主文件
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 删除备份目录
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 复制项目
ipcMain.handle('copy-project', async (event, projectId) => {
  try {
    const userDataPath = getUserDataPath();
    const projectDir = path.join(userDataPath, 'SnowflakeWriter');
    const filePath = path.join(projectDir, `${projectId}.json`);

    if (!fs.existsSync(filePath)) {
      return { success: false, error: '项目不存在' };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const originalProject = JSON.parse(content);

    const { v4: uuidv4 } = require('uuid');
    const now = new Date().toISOString();
    const newProject = {
      ...originalProject,
      id: uuidv4(),
      title: `${originalProject.title} (副本)`,
      createdAt: now,
      updatedAt: now
    };

    const newFilePath = path.join(projectDir, `${newProject.id}.json`);
    fs.writeFileSync(newFilePath, JSON.stringify(newProject, null, 2), 'utf-8');

    return {
      success: true,
      project: {
        id: newProject.id,
        title: newProject.title,
        icon: newProject.icon,
        createdAt: newProject.createdAt,
        updatedAt: newProject.updatedAt,
        completedSteps: newProject.meta.completedSteps,
        currentStep: newProject.currentStep
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 导出为Markdown
ipcMain.handle('export-markdown', async (event, { project, markdown }) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '导出为Markdown',
      defaultPath: `${project.title || '未命名'}.md`,
      filters: [{ name: 'Markdown', extensions: ['md'] }]
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    fs.writeFileSync(result.filePath, markdown, 'utf-8');
    return { success: true, path: result.filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 创建备份
ipcMain.handle('create-backup', async (event, projectId) => {
  try {
    const userDataPath = getUserDataPath();
    const projectDir = path.join(userDataPath, 'SnowflakeWriter');
    const backupDir = path.join(projectDir, '.backup');

    // 确保目录存在
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // 读取当前项目
    const projectFile = path.join(projectDir, `${projectId}.json`);
    if (!fs.existsSync(projectFile)) {
      return { success: false, error: '项目不存在' };
    }

    const projectData = JSON.parse(fs.readFileSync(projectFile, 'utf-8'));

    // 生成备份文件名
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFileName = `${projectId}-${timestamp}.json`;
    const backupFilePath = path.join(backupDir, backupFileName);

    // 写入备份
    fs.writeFileSync(backupFilePath, JSON.stringify(projectData, null, 2), 'utf-8');

    // 清理旧备份（保留最近5个）
    const backupFiles = fs.readdirSync(backupDir)
      .filter(f => f.startsWith(projectId) && f.endsWith('.json'))
      .sort()
      .reverse();

    if (backupFiles.length > 5) {
      const toDelete = backupFiles.slice(5);
      for (const file of toDelete) {
        fs.unlinkSync(path.join(backupDir, file));
      }
    }

    return { success: true, backupFile: backupFileName };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 获取备份列表
ipcMain.handle('list-backups', async (event, projectId) => {
  try {
    const userDataPath = getUserDataPath();
    const backupDir = path.join(userDataPath, 'SnowflakeWriter', '.backup');

    if (!fs.existsSync(backupDir)) {
      return { success: true, backups: [] };
    }

    const backups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith(projectId) && f.endsWith('.json'))
      .map(f => {
        const filePath = path.join(backupDir, f);
        const stats = fs.statSync(filePath);
        // 解析时间戳
        const parts = f.replace('.json', '').split('-');
        const timestamp = parts.slice(-2).join('-');
        let date;
        try {
          date = new Date(timestamp.replace(/-/g, ':').slice(0, 19));
        } catch {
          date = stats.mtime;
        }
        return {
          fileName: f,
          size: stats.size,
          createdAt: date.toISOString(),
          formattedSize: (stats.size / 1024).toFixed(1) + ' KB'
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { success: true, backups };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 恢复备份
ipcMain.handle('restore-backup', async (event, { projectId, backupFile, mode }) => {
  try {
    const userDataPath = getUserDataPath();
    const backupDir = path.join(userDataPath, 'SnowflakeWriter', '.backup');
    const backupFilePath = path.join(backupDir, backupFile);

    if (!fs.existsSync(backupFilePath)) {
      return { success: false, error: '备份文件不存在' };
    }

    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf-8'));

    if (mode === 'overwrite') {
      // 覆盖当前项目
      const projectFile = path.join(userDataPath, 'SnowflakeWriter', `${projectId}.json`);
      fs.writeFileSync(projectFile, JSON.stringify(backupData, null, 2), 'utf-8');
      return { success: true, mode: 'overwrite' };
    } else {
      // 恢复到新项目
      const { v4: uuidv4 } = require('uuid');
      const newProject = {
        ...backupData,
        id: uuidv4(),
        title: `${backupData.title} (恢复)`,
        updatedAt: new Date().toISOString()
      };
      const newProjectFile = path.join(userDataPath, 'SnowflakeWriter', `${newProject.id}.json`);
      fs.writeFileSync(newProjectFile, JSON.stringify(newProject, null, 2), 'utf-8');
      return {
        success: true,
        mode: 'new',
        project: {
          id: newProject.id,
          title: newProject.title
        }
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 删除备份
ipcMain.handle('delete-backup', async (event, { projectId, backupFile }) => {
  try {
    const userDataPath = getUserDataPath();
    const backupDir = path.join(userDataPath, 'SnowflakeWriter', '.backup');
    const backupFilePath = path.join(backupDir, backupFile);

    if (fs.existsSync(backupFilePath)) {
      fs.unlinkSync(backupFilePath);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
