const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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

// 加载项目列表
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
      return JSON.parse(content);
    });

    return { success: true, projects };
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
