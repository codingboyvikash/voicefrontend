const { app, BrowserWindow, session } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // 🔥 MIC PERMISSION TOTAL BYPASS
  const ses = session.fromPartition('persist:mic-bypass');
  
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log(`🔒 Permission: ${permission}`);
    
    // AUTO ALLOW MIC + MEDIA
    if (permission === 'media' || 
        permission === 'microphone' || 
        permission === 'camera' || 
        permission === 'media-key-system-access') {
      console.log('✅ AUTO-GRANTING MIC PERMISSION');
      callback(true); // SILENT APPROVE!
      return;
    }
    
    callback(false);
  });

  // Preload permissions
  ses.preload = path.join(__dirname, 'public', 'preload.js');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Hide until mic ready
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      preload: path.join(__dirname, 'public', 'preload.js'),
      session: ses
    },
    frame: false,
    titleBarStyle: 'hiddenInset'
  });

  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  });
}

// Pre-create session
app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
