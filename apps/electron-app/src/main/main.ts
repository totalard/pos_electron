import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
  // Create the browser window in fullscreen mode without decorations
  mainWindow = new BrowserWindow({
    // Remove window decorations and enable fullscreen
    frame: false,
    fullscreen: true,
    autoHideMenuBar: true,

    // Window properties (will be overridden by fullscreen)
    width: 1920,
    height: 1080,

    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },

    // Window appearance
    backgroundColor: '#ffffff',
    show: false,

    // Disable window controls
    minimizable: false,
    maximizable: false,
    closable: true, // Keep closable for development, can be disabled in production
    resizable: false
  })

  // Load the index.html of the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    // Open DevTools in development
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    // Ensure fullscreen mode is active
    if (mainWindow && !mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(true)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow()

  // On macOS, re-create window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle any additional app events here
app.on('before-quit', () => {
  // Cleanup before quitting
})

