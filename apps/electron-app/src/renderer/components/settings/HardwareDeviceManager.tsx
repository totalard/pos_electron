/**
 * Hardware Device Manager Component
 * Provides device discovery, connection, and diagnostic tools
 */

import { useEffect, useState } from 'react'
import { useAppStore } from '../../stores'
import { useHardwareStore } from '../../stores/hardwareStore'
import type { DeviceInfo, PrinterConfig, ScannerConfig } from '../../../preload/preload'

export function HardwareDeviceManager() {
  const { theme } = useAppStore()
  const {
    devices,
    printers,
    scanners,
    activePrinter,
    activeScanner,
    isInitialized,
    isScanning,
    printerStatus,
    recentScans,
    logs,
    initialize,
    scanDevices,
    scanPrinters,
    connectPrinter,
    disconnectPrinter,
    testPrinter,
    scanScanners,
    connectScanner,
    disconnectScanner,
    testScanner,
    clearLogs
  } = useHardwareStore()

  const [selectedTab, setSelectedTab] = useState<'printers' | 'scanners' | 'devices' | 'logs'>('printers')
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [isInitialized, initialize])

  const handleScanDevices = async () => {
    await scanDevices()
    await scanPrinters()
    await scanScanners()
  }

  const handleConnectPrinter = async (printer: DeviceInfo) => {
    const config: PrinterConfig = {
      connection: printer.connection as 'USB' | 'Network' | 'Serial',
      vendorId: printer.vendorId,
      productId: printer.productId,
      port: printer.port,
      address: printer.address
    }
    await connectPrinter(config)
  }

  const handleConnectScanner = async (scanner: DeviceInfo) => {
    const config: ScannerConfig = {
      connection: scanner.connection as 'USB' | 'Serial' | 'Bluetooth',
      vendorId: scanner.vendorId,
      productId: scanner.productId,
      path: scanner.path
    }
    await connectScanner(config)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ready':
        return 'text-green-500'
      case 'disconnected':
        return 'text-gray-500'
      case 'error':
        return 'text-red-500'
      case 'busy':
        return 'text-yellow-500'
      default:
        return 'text-gray-500'
    }
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return theme === 'dark' ? 'text-green-400' : 'text-green-600'
      case 'error':
        return theme === 'dark' ? 'text-red-400' : 'text-red-600'
      case 'warning':
        return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
      default:
        return theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    }
  }

  return (
    <div className={`p-6 space-y-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Hardware Device Manager
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Discover, connect, and manage hardware devices
          </p>
        </div>
        <button
          onClick={handleScanDevices}
          disabled={isScanning}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isScanning
              ? 'bg-gray-400 cursor-not-allowed'
              : theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isScanning ? 'Scanning...' : 'Scan Devices'}
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Active Printer</p>
              <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {activePrinter ? activePrinter.name : 'None'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${activePrinter ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Active Scanner</p>
              <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {activeScanner ? activeScanner.name : 'None'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${activeScanner ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Devices</p>
              <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {devices.length}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${devices.length > 0 ? 'bg-blue-500' : 'bg-gray-400'}`} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex space-x-4">
          {['printers', 'scanners', 'devices', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                selectedTab === tab
                  ? theme === 'dark'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Printers Tab */}
        {selectedTab === 'printers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Available Printers ({printers.length})
              </h3>
              {activePrinter && (
                <div className="flex space-x-2">
                  <button
                    onClick={testPrinter}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      theme === 'dark'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    Test Print
                  </button>
                  <button
                    onClick={disconnectPrinter}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      theme === 'dark'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>

            {printers.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>No printers found. Click "Scan Devices" to search for printers.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {printers.map((printer) => (
                  <div
                    key={printer.id}
                    className={`p-4 rounded-lg border ${
                      activePrinter?.id === printer.id
                        ? theme === 'dark'
                          ? 'bg-blue-900/20 border-blue-500'
                          : 'bg-blue-50 border-blue-500'
                        : theme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {printer.name}
                        </h4>
                        <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <p>Connection: {printer.connection}</p>
                          {printer.manufacturer && <p>Manufacturer: {printer.manufacturer}</p>}
                          {printer.path && <p>Path: {printer.path}</p>}
                          <p className={getStatusColor(printer.status)}>Status: {printer.status}</p>
                        </div>
                      </div>
                      {activePrinter?.id !== printer.id && (
                        <button
                          onClick={() => handleConnectPrinter(printer)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            theme === 'dark'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          Connect
                        </button>
                      )}
                      {activePrinter?.id === printer.id && (
                        <span className={`px-4 py-2 rounded-lg font-medium ${
                          theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                        }`}>
                          Connected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Printer Status */}
            {activePrinter && printerStatus && (
              <div className={`mt-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Printer Status
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Online</p>
                    <p className={`font-medium ${printerStatus.online ? 'text-green-500' : 'text-red-500'}`}>
                      {printerStatus.online ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Paper Status</p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {printerStatus.paperStatus}
                    </p>
                  </div>
                </div>
                {printerStatus.error && (
                  <div className="mt-3">
                    <p className="text-sm text-red-500">Error: {printerStatus.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Scanners Tab */}
        {selectedTab === 'scanners' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Available Scanners ({scanners.length})
              </h3>
              {activeScanner && (
                <div className="flex space-x-2">
                  <button
                    onClick={testScanner}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      theme === 'dark'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    Test Scanner
                  </button>
                  <button
                    onClick={disconnectScanner}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      theme === 'dark'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>

            {scanners.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>No scanners found. Click "Scan Devices" to search for scanners.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {scanners.map((scanner) => (
                  <div
                    key={scanner.id}
                    className={`p-4 rounded-lg border ${
                      activeScanner?.id === scanner.id
                        ? theme === 'dark'
                          ? 'bg-blue-900/20 border-blue-500'
                          : 'bg-blue-50 border-blue-500'
                        : theme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {scanner.name}
                        </h4>
                        <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <p>Connection: {scanner.connection}</p>
                          {scanner.manufacturer && <p>Manufacturer: {scanner.manufacturer}</p>}
                          {scanner.path && <p>Path: {scanner.path}</p>}
                          <p className={getStatusColor(scanner.status)}>Status: {scanner.status}</p>
                        </div>
                      </div>
                      {activeScanner?.id !== scanner.id && (
                        <button
                          onClick={() => handleConnectScanner(scanner)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            theme === 'dark'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          Connect
                        </button>
                      )}
                      {activeScanner?.id === scanner.id && (
                        <span className={`px-4 py-2 rounded-lg font-medium ${
                          theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                        }`}>
                          Connected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Scans */}
            {recentScans.length > 0 && (
              <div className={`mt-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent Scans ({recentScans.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentScans.slice(0, 10).map((scan, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {scan.barcode}
                        </span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {scan.type} • {new Date(scan.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Devices Tab */}
        {selectedTab === 'devices' && (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              All USB Devices ({devices.length})
            </h3>

            {devices.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>No devices found. Click "Scan Devices" to search for connected devices.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {device.name}
                        </h4>
                        <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <p>Type: {device.type}</p>
                          <p>Connection: {device.connection}</p>
                          {device.manufacturer && <p>Manufacturer: {device.manufacturer}</p>}
                          {device.vendorId && device.productId && (
                            <p>VID:PID: {device.vendorId.toString(16).toUpperCase()}:{device.productId.toString(16).toUpperCase()}</p>
                          )}
                          <p className={getStatusColor(device.status)}>Status: {device.status}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {device.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {selectedTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Activity Logs ({logs.length})
              </h3>
              <button
                onClick={clearLogs}
                className={`px-4 py-2 rounded-lg font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Clear Logs
              </button>
            </div>

            {logs.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>No logs yet.</p>
              </div>
            ) : (
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-sm">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`font-medium uppercase text-xs ${getLogColor(log.type)}`}>
                        [{log.type}]
                      </span>
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
