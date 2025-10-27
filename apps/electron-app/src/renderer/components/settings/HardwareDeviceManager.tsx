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
    clearLogs,
    setDeviceType,
    setEscPosMode
  } = useHardwareStore()

  const [selectedTab, setSelectedTab] = useState<'printers' | 'scanners' | 'devices' | 'logs'>('printers')
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null)
  const [apiAvailable, setApiAvailable] = useState(false)
  const [selectedTestPrinter, setSelectedTestPrinter] = useState<string>('')
  const [useEscPosMode, setUseEscPosMode] = useState(true)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    // Check if Electron API is available
    const checkAPI = () => {
      const available = typeof window !== 'undefined' && !!window.electronAPI
      setApiAvailable(available)
      console.log('[HardwareDeviceManager] Electron API available:', available)
    }
    
    checkAPI()
    
    if (!isInitialized) {
      initialize()
    }
  }, [isInitialized, initialize])

  const handleScanDevices = async () => {
    await scanDevices()
    await scanPrinters()
    await scanScanners()
  }

  const handleTestPrinter = async () => {
    setIsTesting(true)
    try {
      await testPrinter(selectedTestPrinter || undefined, useEscPosMode)
      // Refresh devices after test to update connection status
      await scanPrinters()
    } finally {
      setIsTesting(false)
    }
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
      {/* API Not Available Warning */}
      {!apiAvailable && (
        <div className={`p-4 rounded-lg border-2 ${theme === 'dark' ? 'bg-yellow-900/20 border-yellow-600' : 'bg-yellow-50 border-yellow-400'}`}>
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'}`}>
                Hardware API Not Available
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                The Electron hardware API is not loaded. This usually happens when:
              </p>
              <ul className={`text-sm mt-2 ml-4 list-disc space-y-1 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                <li>The preload script failed to load</li>
                <li>Running in a browser instead of Electron</li>
                <li>The application needs to be restarted</li>
              </ul>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                <strong>Solution:</strong> Restart the application. If the issue persists, check the console for errors.
              </p>
            </div>
          </div>
        </div>
      )}

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
            </div>

            {/* Test Print Section */}
            {printers.length > 0 && (
              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Test Print
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Printer Selection */}
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Select Printer
                    </label>
                    <select
                      value={selectedTestPrinter}
                      onChange={(e) => setSelectedTestPrinter(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Active Printer</option>
                      {printers.map((printer) => (
                        <option key={printer.id} value={printer.id}>
                          {printer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ESC/POS Mode Toggle */}
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Print Mode
                    </label>
                    <select
                      value={useEscPosMode ? 'escpos' : 'standard'}
                      onChange={(e) => setUseEscPosMode(e.target.value === 'escpos')}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="escpos">ESC/POS (Thermal)</option>
                      <option value="standard">Standard Printer</option>
                    </select>
                  </div>

                  {/* Test Print Button */}
                  <div className="flex items-end">
                    <button
                      onClick={handleTestPrinter}
                      disabled={printers.length === 0 || isTesting}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-700 disabled:text-gray-500'
                          : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300 disabled:text-gray-500'
                      }`}
                    >
                      {isTesting ? 'Testing...' : 'Test Print'}
                    </button>
                  </div>
                </div>
                <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {useEscPosMode
                    ? '📄 ESC/POS mode uses thermal printer commands (recommended for receipt printers)'
                    : '📄 Standard mode uses plain text (for regular office printers)'}
                </p>
              </div>
            )}

            {/* Active Printer Disconnect */}
            {activePrinter && (
              <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>
                      Active Printer: {activePrinter.name}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                      {activePrinter.connection} • {activePrinter.status}
                    </p>
                  </div>
                  <button
                    onClick={disconnectPrinter}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}

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
                    <div className="space-y-3">
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
                        <div className="flex flex-col gap-2">
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
                            <span className={`px-4 py-2 rounded-lg font-medium text-center ${
                              theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                            }`}>
                              Connected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ESC/POS Mode Toggle for Printer */}
                      <div className={`flex items-center justify-between p-2 rounded ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <div>
                          <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            ESC/POS Mode
                          </label>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {printer.useEscPos ? 'Thermal printer commands' : 'Standard text mode'}
                          </p>
                        </div>
                        <button
                          onClick={() => setEscPosMode(printer.id, !printer.useEscPos)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            printer.useEscPos
                              ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                              : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              printer.useEscPos ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
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
                    <div className="flex items-start justify-between gap-4">
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
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {device.type}
                        </span>
                        {device.type === 'unknown' && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => setDeviceType(device.id, 'printer')}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                theme === 'dark'
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }`}
                            >
                              Mark as Printer
                            </button>
                            <button
                              onClick={() => setDeviceType(device.id, 'scanner')}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                theme === 'dark'
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              Mark as Scanner
                            </button>
                          </div>
                        )}
                      </div>
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
