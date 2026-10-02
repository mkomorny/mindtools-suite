const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const http = require('http');

const isDev = !app.isPackaged;
let mainWindow = null;

/**
 * Pick an available localhost port (starting around 43721 for desktop build).
 */
function getAvailablePort(startPort = 43721) {
  return new Promise((resolve) => {
    const tryPort = (port) => {
      const tester = http.createServer();
      tester.listen(port, '127.0.0.1', () => {
        tester.close(() => resolve(port));
      });
      tester.on('error', () => {
        if (port < startPort + 200) {
          tryPort(port + 1);
        } else {
          resolve(startPort);
        }
      });
    };
    tryPort(startPort);
  });
}

async function startProductionServer() {
  // Configure environment for the production static + API server
  process.env.NODE_ENV = 'production';

  const port = await getAvailablePort(43721);
  process.env.PORT = String(port);

  // Requiring the bundled server starts the express listener (it runs startServer())
  try {
    require(path.join(__dirname, 'dist', 'server.cjs'));
    // Give the server a moment to bind the port
    await new Promise((r) => setTimeout(r, 900));
    return port;
  } catch (err) {
    console.error('[Electron] Failed to load/start bundled server.cjs', err);
    // Last resort: try a common fallback port
    return 43721;
  }
}

function createMainWindow(loadPort) {
  const iconPath = path.join(__dirname, 'MindTools.png');

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 620,
    backgroundColor: '#0a0a0a',
    icon: iconPath,
    title: 'MindTools Suite',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      // We do not need to expose Node to the React renderer
    },
    show: false,
  });

  const targetUrl = `http://127.0.0.1:${loadPort}`;

  mainWindow.loadURL(targetUrl).catch((e) => {
    console.error('Failed to load app URL', e);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Optional: open devtools in dev only (commented)
    // if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Make sure links with target=_blank or external open in real browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Basic graceful error page handling
  mainWindow.webContents.on('did-fail-load', (_e, code, desc) => {
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'MindTools Suite',
        message: 'Failed to load the application interface.',
        detail: `${desc} (${code})`,
      });
    }
  });
}

app.on('ready', async () => {
  let portToUse = 3000;

  if (isDev) {
    // In development the user typically runs `npm run dev` which starts server.ts on port 3000 (or .env PORT)
    // We just point the window at that. For a real packaged build we use the bundled server.
    portToUse = parseInt(process.env.PORT || '3000', 10);
  } else {
    portToUse = await startProductionServer();
  }

  createMainWindow(portToUse);
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS re-create window when dock icon clicked and no other windows open
  if (mainWindow === null) {
    // On activate in prod we assume server already up, but to be safe use last known or 43721
    const lastPort = parseInt(process.env.PORT || '43721', 10);
    createMainWindow(lastPort);
  }
});

// Clean shutdown
app.on('before-quit', () => {
  // The server runs in-process so no extra child to kill
});
