import { contextBridge, ipcRenderer } from 'electron'

// Define the API interface
export interface IElectronAPI {
  // Add your API methods here
  platform: NodeJS.Platform
  versions: {
    node: string
    chrome: string
    electron: string
  }
  // Network status API
  checkNetworkStatus: () => Promise<{ isOnline: boolean }>
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: IElectronAPI = {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  checkNetworkStatus: () => ipcRenderer.invoke('check-network-status')
}

// Use contextBridge to safely expose the API
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type augmentation for window object
declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

