/**
 * Python Server Manager
 * Manages the lifecycle of the embedded Python backend server
 */

import { spawn, ChildProcess } from 'child_process'
import { app } from 'electron'
import path from 'path'
import { net } from 'electron'

export class PythonServerManager {
  private serverProcess: ChildProcess | null = null
  private readonly serverPort = 8000
  private readonly serverHost = '127.0.0.1'
  private isStarting = false
  private isRunning = false

  /**
   * Get the path to the Python server executable
   */
  private getServerPath(): string {
    const isDev = process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL

    if (isDev) {
      // In development, use Python directly
      const backendPath = path.join(app.getAppPath(), '..', '..', 'apps', 'python-backend')
      return backendPath
    } else {
      // In production, use the bundled executable
      const resourcesPath = process.resourcesPath
      const serverPath = path.join(resourcesPath, 'python-server', 'pos-server', 'pos-server.exe')
      return serverPath
    }
  }

  /**
   * Get the data directory path
   */
  private getDataPath(): string {
    const isDev = process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL

    if (isDev) {
      // In development, use the backend data directory
      const backendPath = path.join(app.getAppPath(), '..', '..', 'apps', 'python-backend', 'data')
      return backendPath
    } else {
      // In production, use app data directory
      const userDataPath = app.getPath('userData')
      const dataPath = path.join(userDataPath, 'data')
      return dataPath
    }
  }

  /**
   * Start the Python server
   */
  async start(): Promise<void> {
    if (this.isRunning || this.isStarting) {
      console.log('Python server is already running or starting')
      return
    }

    this.isStarting = true
    console.log('Starting Python server...')

    try {
      const isDev = process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL

      if (isDev) {
        await this.startDevelopmentServer()
      } else {
        await this.startProductionServer()
      }

      // Wait for server to be ready
      await this.waitForServer()

      this.isRunning = true
      this.isStarting = false
      console.log(`Python server started successfully on http://${this.serverHost}:${this.serverPort}`)
    } catch (error) {
      this.isStarting = false
      this.isRunning = false
      console.error('Failed to start Python server:', error)
      throw error
    }
  }

  /**
   * Start the server in development mode
   */
  private async startDevelopmentServer(): Promise<void> {
    const backendPath = this.getServerPath()
    const venvPython = path.join(backendPath, 'venv', 'bin', 'python3')
    
    // Check if we're on Windows
    const isWindows = process.platform === 'win32'
    const pythonPath = isWindows 
      ? path.join(backendPath, 'venv', 'Scripts', 'python.exe')
      : venvPython

    console.log('Starting development server with Python:', pythonPath)
    console.log('Backend path:', backendPath)

    this.serverProcess = spawn(
      pythonPath,
      [
        '-m', 'uvicorn',
        'src.main:app',
        '--host', this.serverHost,
        '--port', this.serverPort.toString(),
      ],
      {
        cwd: backendPath,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    )

    this.setupProcessHandlers()
  }

  /**
   * Start the server in production mode
   */
  private async startProductionServer(): Promise<void> {
    const serverExePath = this.getServerPath()
    const dataPath = this.getDataPath()

    console.log('Starting production server:', serverExePath)
    console.log('Data path:', dataPath)

    // Ensure data directory exists
    const fs = require('fs')
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true })
    }

    this.serverProcess = spawn(
      serverExePath,
      [
        '--host', this.serverHost,
        '--port', this.serverPort.toString(),
      ],
      {
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          DATA_PATH: dataPath,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    )

    this.setupProcessHandlers()
  }

  /**
   * Setup process event handlers
   */
  private setupProcessHandlers(): void {
    if (!this.serverProcess) return

    this.serverProcess.stdout?.on('data', (data) => {
      console.log(`[Python Server] ${data.toString().trim()}`)
    })

    this.serverProcess.stderr?.on('data', (data) => {
      console.error(`[Python Server Error] ${data.toString().trim()}`)
    })

    this.serverProcess.on('error', (error) => {
      console.error('Python server process error:', error)
      this.isRunning = false
    })

    this.serverProcess.on('exit', (code, signal) => {
      console.log(`Python server exited with code ${code} and signal ${signal}`)
      this.isRunning = false
      this.serverProcess = null
    })
  }

  /**
   * Wait for the server to be ready
   */
  private async waitForServer(maxAttempts = 30, delayMs = 1000): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const isReady = await this.checkServerHealth()
        if (isReady) {
          return
        }
      } catch (error) {
        // Server not ready yet
      }

      await new Promise(resolve => setTimeout(resolve, delayMs))
    }

    throw new Error('Python server failed to start within timeout period')
  }

  /**
   * Check if the server is healthy
   */
  private async checkServerHealth(): Promise<boolean> {
    return new Promise((resolve) => {
      const request = net.request(`http://${this.serverHost}:${this.serverPort}/health`)
      let resolved = false

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true
          request.abort()
          resolve(false)
        }
      }, 2000)

      request.on('response', (response) => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          resolve(response.statusCode === 200)
        }
      })

      request.on('error', () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          resolve(false)
        }
      })

      request.end()
    })
  }

  /**
   * Stop the Python server
   */
  async stop(): Promise<void> {
    if (!this.serverProcess) {
      console.log('Python server is not running')
      return
    }

    console.log('Stopping Python server...')

    return new Promise((resolve) => {
      if (!this.serverProcess) {
        resolve()
        return
      }

      this.serverProcess.once('exit', () => {
        console.log('Python server stopped')
        this.serverProcess = null
        this.isRunning = false
        resolve()
      })

      // Try graceful shutdown first
      this.serverProcess.kill('SIGTERM')

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (this.serverProcess) {
          console.log('Force killing Python server...')
          this.serverProcess.kill('SIGKILL')
        }
      }, 5000)
    })
  }

  /**
   * Get the server URL
   */
  getServerUrl(): string {
    return `http://${this.serverHost}:${this.serverPort}`
  }

  /**
   * Check if the server is running
   */
  isServerRunning(): boolean {
    return this.isRunning
  }
}

// Singleton instance
let serverManager: PythonServerManager | null = null

export function getPythonServerManager(): PythonServerManager {
  if (!serverManager) {
    serverManager = new PythonServerManager()
  }
  return serverManager
}

