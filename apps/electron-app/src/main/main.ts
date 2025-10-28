import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { net } from 'electron'
import { getHardwareManager } from './services/HardwareManager'
import type { PrinterConfig } from './services/PrinterService'
import type { ScannerConfig } from './services/ScannerService'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mainWindow: BrowserWindow | null = null
let hardwareManager = getHardwareManager()

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

  // Forward hardware events to renderer
  hardwareManager.on('hardware-event', (event) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('hardware-event', event)
    }
  })
}

// Handle network status check
ipcMain.handle('check-network-status', async () => {
  return new Promise((resolve) => {
    const request = net.request('https://www.google.com')
    let resolved = false
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        request.abort()
        resolve({ isOnline: false })
      }
    }, 5000)
    
    request.on('response', () => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        resolve({ isOnline: true })
      }
    })
    
    request.on('error', () => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        resolve({ isOnline: false })
      }
    })
    
    request.end()
  })
})

// ===== HARDWARE IPC HANDLERS =====

// Initialize hardware manager
ipcMain.handle('hardware:initialize', async () => {
  try {
    hardwareManager.initialize()
    return { success: true }
  } catch (error) {
    console.error('Hardware initialization error:', error)
    return { success: false, error: String(error) }
  }
})

// Scan all devices
ipcMain.handle('hardware:scan-devices', async () => {
  try {
    const devices = await hardwareManager.scanAllDevices()
    return { success: true, data: devices }
  } catch (error) {
    console.error('Device scan error:', error)
    return { success: false, error: String(error) }
  }
})

// Get all devices
ipcMain.handle('hardware:get-devices', async () => {
  try {
    const devices = hardwareManager.getAllDevices()
    return { success: true, data: devices }
  } catch (error) {
    console.error('Get devices error:', error)
    return { success: false, error: String(error) }
  }
})

// Get devices by type
ipcMain.handle('hardware:get-devices-by-type', async (_event, type: string) => {
  try {
    const devices = hardwareManager.getDevicesByType(type as any)
    return { success: true, data: devices }
  } catch (error) {
    console.error('Get devices by type error:', error)
    return { success: false, error: String(error) }
  }
})

// Set device type manually
ipcMain.handle('hardware:set-device-type', async (_event, deviceId: string, deviceType: string) => {
  try {
    const result = hardwareManager.setDeviceType(deviceId, deviceType as any)
    return { success: result }
  } catch (error) {
    console.error('Set device type error:', error)
    return { success: false, error: String(error) }
  }
})

// Set ESC/POS mode for a device
ipcMain.handle('hardware:set-escpos-mode', async (_event, deviceId: string, useEscPos: boolean) => {
  try {
    const result = hardwareManager.setEscPosMode(deviceId, useEscPos)
    return { success: result }
  } catch (error) {
    console.error('Set ESC/POS mode error:', error)
    return { success: false, error: String(error) }
  }
})

// Printer handlers
ipcMain.handle('printer:scan', async () => {
  try {
    const printers = hardwareManager.getPrinters()
    return { success: true, data: printers }
  } catch (error) {
    console.error('Printer scan error:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('printer:connect', async (_event, config: PrinterConfig) => {
  try {
    const result = await hardwareManager.connectPrinter(config)
    return { success: result }
  } catch (error) {
    console.error('Printer connect error:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('printer:disconnect', async () => {
  try {
    hardwareManager.disconnectPrinter()
    return { success: true }
  } catch (error) {
    console.error('Printer disconnect error:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('printer:print', async (_event, data: string) => {
  try {
    const result = await hardwareManager.print(Buffer.from(data))
    return { success: result }
  } catch (error) {
    console.error('Print error:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('printer:print-template', async (_event, template: any, data: any, businessInfo: any) => {
  try {
    const result = await hardwareManager.printReceiptWithTemplate(template, data, businessInfo)
    return { success: result }
  } catch (error) {
    console.error('Template print error:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('printer:test', async (_event, printerId?: string, useEscPos?: boolean) => {
  try {
    const result = await hardwareManager.testPrinter(printerId, useEscPos)
    return { success: result }
  } catch (error) {
    console.error('Printer test error:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('printer:status', async () => {
  try {
    const status = await hardwareManager.getPrinterStatus()
    return { success: true, data: status }
  } catch (error) {
    console.error('Printer status error:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('printer:get-active', async () => {
  try {
    const printer = hardwareManager.getActivePrinter()
    return { success: true, data: printer }
  } catch (error) {
    console.error('Get active printer error:', error)
    return { success: false, error: String(error) }
  }
})

// Scanner handlers
ipcMain.handle('scanner:scan', async () => {
  try {
    const scanners = hardwareManager.getScanners()
    return { success: true, data: scanners }
  } catch (error) {
    console.error('Scanner scan error:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('scanner:connect', async (_event, config: ScannerConfig) => {
  try {
    const result = hardwareManager.connectScanner(config)
    return { success: result }
  } catch (error) {
    console.error('Scanner connect error:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('scanner:disconnect', async () => {
  try {
    hardwareManager.disconnectScanner()
    return { success: true }
  } catch (error) {
    console.error('Scanner disconnect error:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('scanner:test', async () => {
  try {
    const result = hardwareManager.testScanner()
    return { success: result }
  } catch (error) {
    console.error('Scanner test error:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('scanner:get-active', async () => {
  try {
    const scanner = hardwareManager.getActiveScanner()
    return { success: true, data: scanner }
  } catch (error) {
    console.error('Get active scanner error:', error)
    return { success: false, error: String(error) }
  }
})

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
  // Cleanup hardware manager before quitting
  hardwareManager.shutdown()
})

