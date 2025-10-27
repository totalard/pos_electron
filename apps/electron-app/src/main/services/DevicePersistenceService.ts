/**
 * Device Persistence Service
 * Handles saving and loading device configurations to/from disk
 */

import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import { DeviceType } from './types'

export interface PersistedDeviceConfig {
  deviceId: string
  type: DeviceType
  useEscPos?: boolean
  timestamp: number
}

export interface DevicePersistenceData {
  devices: PersistedDeviceConfig[]
  version: string
}

export class DevicePersistenceService {
  private configPath: string
  private data: DevicePersistenceData

  constructor() {
    // Store config in user data directory
    const userDataPath = app.getPath('userData')
    this.configPath = path.join(userDataPath, 'device-config.json')
    this.data = this.loadData()
  }

  /**
   * Load persisted device configurations from disk
   */
  private loadData(): DevicePersistenceData {
    try {
      if (fs.existsSync(this.configPath)) {
        const fileContent = fs.readFileSync(this.configPath, 'utf-8')
        const data = JSON.parse(fileContent) as DevicePersistenceData
        console.log(`Loaded ${data.devices.length} persisted device configurations`)
        return data
      }
    } catch (error) {
      console.error('Error loading device configurations:', error)
    }

    // Return default data if file doesn't exist or error occurred
    return {
      devices: [],
      version: '1.0.0'
    }
  }

  /**
   * Save device configurations to disk
   */
  private saveData(): void {
    try {
      const fileContent = JSON.stringify(this.data, null, 2)
      fs.writeFileSync(this.configPath, fileContent, 'utf-8')
      console.log(`Saved ${this.data.devices.length} device configurations`)
    } catch (error) {
      console.error('Error saving device configurations:', error)
    }
  }

  /**
   * Save or update device configuration
   */
  saveDeviceConfig(deviceId: string, type: DeviceType, useEscPos?: boolean): void {
    const existingIndex = this.data.devices.findIndex(d => d.deviceId === deviceId)
    
    const config: PersistedDeviceConfig = {
      deviceId,
      type,
      useEscPos,
      timestamp: Date.now()
    }

    if (existingIndex >= 0) {
      // Update existing configuration
      this.data.devices[existingIndex] = config
    } else {
      // Add new configuration
      this.data.devices.push(config)
    }

    this.saveData()
  }

  /**
   * Get device configuration by ID
   */
  getDeviceConfig(deviceId: string): PersistedDeviceConfig | undefined {
    return this.data.devices.find(d => d.deviceId === deviceId)
  }

  /**
   * Get all persisted device configurations
   */
  getAllConfigs(): PersistedDeviceConfig[] {
    return [...this.data.devices]
  }

  /**
   * Remove device configuration
   */
  removeDeviceConfig(deviceId: string): void {
    this.data.devices = this.data.devices.filter(d => d.deviceId !== deviceId)
    this.saveData()
  }

  /**
   * Clear all device configurations
   */
  clearAll(): void {
    this.data.devices = []
    this.saveData()
  }

  /**
   * Get device type from persisted config
   */
  getDeviceType(deviceId: string): DeviceType | undefined {
    const config = this.getDeviceConfig(deviceId)
    return config?.type
  }

  /**
   * Get ESC/POS mode from persisted config
   */
  getEscPosMode(deviceId: string): boolean | undefined {
    const config = this.getDeviceConfig(deviceId)
    return config?.useEscPos
  }

  /**
   * Update ESC/POS mode for a device
   */
  setEscPosMode(deviceId: string, useEscPos: boolean): void {
    const config = this.getDeviceConfig(deviceId)
    if (config) {
      this.saveDeviceConfig(deviceId, config.type, useEscPos)
    }
  }
}

// Singleton instance
let instance: DevicePersistenceService | null = null

export function getDevicePersistenceService(): DevicePersistenceService {
  if (!instance) {
    instance = new DevicePersistenceService()
  }
  return instance
}

