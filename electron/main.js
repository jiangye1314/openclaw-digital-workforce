const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      additionalArguments: ['--electron-env']
    },
    title: '今天我是🦐虾老板'
  });

  // 注入 Electron 环境变量
  process.env.ELECTRON_ENV = 'production';
  process.env.API_BASE_URL = 'http://localhost:3456';

  const isDev = !app.isPackaged;

  if (isDev) {
    // In development, assume the dev server is running
    console.log('Loading dev server...');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    console.log('Loading production build...');
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
    // 临时开启 DevTools 用于调试
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startBackend() {
  const isDev = !app.isPackaged;
  let backendPath;

  if (isDev) {
    console.log('Development mode: Backend should be started manually via pnpm dev');
    return;
  }

  // In production, run the bundled backend
  // The backend bundle should be placed relative to the main.js
  // When packaged, we might need to adjust paths.
  // But let's assume we copy backend/dist/server.js to resources or bundle it.
  // A simpler way: use the path relative to app.getAppPath()
  
  backendPath = path.join(__dirname, '../backend/dist/server.cjs');
  console.log('Starting backend from:', backendPath);
  
  const env = {
    ...process.env,
    PORT: 3456,
    NODE_ENV: 'production'
  };

  try {
    backendProcess = fork(backendPath, [], {
      env,
      stdio: 'inherit'
    });

    backendProcess.on('error', (err) => {
      console.error('Failed to start backend process:', err);
    });
  } catch (e) {
    console.error('Error launching backend:', e);
  }
}

app.on('ready', () => {
  startBackend();
  // Give backend a moment to start if needed, but usually we can just load window
  setTimeout(createWindow, 1000);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  if (backendProcess) {
    console.log('Killing backend process...');
    backendProcess.kill();
  }
});
