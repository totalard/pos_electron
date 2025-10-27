# ESC/POS Printer Integration Guide

## Overview

The POS application now uses the official `escpos` and `escpos-usb` libraries for proper ESC/POS thermal printer integration. This document explains the implementation, fixes applied, and how to use the printer functionality.

## Issues Fixed

### 1. **"No printer connected" Error**
**Root Cause:** The `print()` method was being called without properly opening the device connection first.

**Solution:** Implemented proper device initialization using the escpos library's `device.open()` callback pattern.

### 2. **Custom ESC/POS Implementation**
**Root Cause:** The code had a custom `EscPosBuilder` class instead of using the installed escpos library.

**Solution:** Integrated the official `escpos` library while keeping the custom builder as a fallback.

### 3. **USB Interface Claiming Issues**
**Root Cause:** Direct USB manipulation without following the escpos library patterns.

**Solution:** Use escpos USB adapter which handles interface claiming automatically.

## Architecture

### Libraries Used
- **escpos** (v3.0.0-alpha.6): Core ESC/POS printer driver
- **escpos-usb** (v3.0.0-alpha.4): USB adapter for escpos
- **serialport** (v13.0.0): Serial port communication
- **usb** (v2.16.0): Low-level USB device access

### File Structure
```
apps/electron-app/src/main/services/
├── PrinterService.ts      # Main printer service with escpos integration
├── HardwareManager.ts     # Hardware coordination layer
└── types.ts              # Type definitions
```

## Implementation Details

### Connection Flow

```typescript
// 1. Create USB device adapter
this.escposDevice = new escpos.USB(vendorId, productId)

// 2. Create printer instance
const options = { encoding: 'UTF-8' }
this.escposPrinter = new escpos.Printer(this.escposDevice, options)

// 3. Open device with callback
this.escposDevice.open((error) => {
  if (error) {
    // Handle error
  } else {
    // Device is ready
  }
})
```

### Printing Methods

#### 1. **Test Print**
```typescript
await testPrinter(printerId?: string, useEscPos?: boolean)
```
- Uses escpos library for ESC/POS mode
- Falls back to custom builder if escpos not available
- Supports both thermal and standard printers

#### 2. **Raw Print**
```typescript
await print(data: Buffer | string)
```
- Queues print jobs
- Uses escpos printer's `raw()` method
- Handles both Buffer and string data

#### 3. **Receipt Print**
```typescript
await printReceipt(receiptData: any)
```
- Formatted receipt printing
- Uses escpos library's fluent API
- Supports:
  - Store header (name, address, phone)
  - Receipt metadata (number, date, cashier)
  - Line items with quantities and prices
  - Totals (subtotal, tax, discount)
  - Paper cut command

### ESC/POS Commands Available

The escpos library provides these commands:
- **Text formatting**: `font()`, `align()`, `style()`, `size()`
- **Layout**: `feed()`, `text()`, `table()`
- **Graphics**: `barcode()`, `qrimage()`
- **Control**: `cut()`, `flush()`, `close()`

## Usage Guide

### 1. Initialize Hardware Manager
```typescript
// In main process
hardwareManager.initialize()
```

### 2. Scan for Printers
```typescript
const devices = await hardwareManager.scanAllDevices()
const printers = devices.printers
```

### 3. Connect to Printer
```typescript
const config: PrinterConfig = {
  connection: 'USB',
  vendorId: 0x04b8,  // Example: Epson
  productId: 0x0e15
}
await hardwareManager.connectPrinter(config)
```

### 4. Test Print
```typescript
// ESC/POS mode (thermal printer)
await hardwareManager.testPrinter(printerId, true)

// Standard mode (regular printer)
await hardwareManager.testPrinter(printerId, false)
```

### 5. Print Receipt
```typescript
const receiptData = {
  storeName: 'My Store',
  address: '123 Main St',
  phone: '555-1234',
  receiptNumber: 'R-001',
  date: new Date().toLocaleString(),
  cashier: 'John Doe',
  items: [
    { name: 'Product 1', quantity: 2, price: '10.00', total: '20.00' },
    { name: 'Product 2', quantity: 1, price: '15.00', total: '15.00' }
  ],
  subtotal: '35.00',
  tax: '3.50',
  discount: '0.00',
  total: '38.50'
}

await printerService.printReceipt(receiptData)
```

## Frontend Integration

### HardwareDeviceManager Component

Located at: `src/renderer/components/settings/HardwareDeviceManager.tsx`

**Features:**
- Device scanning and discovery
- Printer connection management
- Test print with mode selection (ESC/POS or Standard)
- Real-time device status monitoring
- Activity logs

**Usage:**
1. Navigate to Settings → Hardware
2. Click "Scan Devices" to discover printers
3. Select a printer from the list
4. Click "Connect" to establish connection
5. Use "Test Print" to verify functionality
6. Choose ESC/POS mode for thermal printers
7. Choose Standard mode for regular printers

## Troubleshooting

### "No printer connected" Error

**Cause:** Attempting to print without an active connection.

**Solution:**
1. Scan for devices
2. Connect to a printer first
3. Wait for connection confirmation
4. Then attempt to print

### "escpos-usb adapter not available" Error

**Cause:** The escpos-usb package is not installed or not loading.

**Solution:**
```bash
cd apps/electron-app
npm install escpos-usb@3.0.0-alpha.4
```

### USB Permission Issues (Linux)

**Cause:** Insufficient permissions to access USB devices.

**Solution:**
```bash
# Add udev rule for your printer
sudo nano /etc/udev/rules.d/99-escpos.rules

# Add this line (replace VENDOR_ID and PRODUCT_ID):
SUBSYSTEM=="usb", ATTR{idVendor}=="04b8", ATTR{idProduct}=="0e15", MODE="0666"

# Reload udev rules
sudo udevadm control --reload-rules
sudo udevadm trigger
```

### Printer Not Detected

**Possible Causes:**
1. Printer not powered on
2. USB cable not connected
3. Printer not in the KNOWN_PRINTER_IDS list
4. Driver issues

**Solution:**
1. Check physical connections
2. Verify printer is powered on
3. Check if printer appears in system devices:
   ```bash
   lsusb  # Linux
   ```
4. Add printer VID/PID to KNOWN_PRINTER_IDS in `types.ts`

## Known Printer IDs

Common ESC/POS printer vendor IDs:
- **Epson**: 0x04b8
- **Star Micronics**: 0x0519
- **Citizen**: 0x1CBE
- **Bixolon**: 0x1504
- **Custom**: 0x0DD4

To add a new printer, update `KNOWN_PRINTER_IDS` in `src/main/services/types.ts`.

## API Reference

### PrinterService Methods

```typescript
class PrinterService {
  // Scan for available printers
  scanPrinters(): Promise<DeviceInfo[]>
  
  // Connect to printer
  connect(config: PrinterConfig): Promise<boolean>
  
  // Disconnect from printer
  disconnect(): void
  
  // Print raw data
  print(data: Buffer | string): Promise<boolean>
  
  // Test print
  testPrint(useEscPos?: boolean): Promise<boolean>
  
  // Print formatted receipt
  printReceipt(receiptData: any): Promise<boolean>
  
  // Get printer status
  getStatus(): Promise<PrinterStatus>
  
  // Get active printer
  getActivePrinter(): DeviceInfo | null
}
```

### IPC Handlers

```typescript
// Scan printers
ipcMain.handle('printer:scan')

// Connect to printer
ipcMain.handle('printer:connect', config: PrinterConfig)

// Disconnect printer
ipcMain.handle('printer:disconnect')

// Print data
ipcMain.handle('printer:print', data: string)

// Test printer
ipcMain.handle('printer:test', printerId?: string, useEscPos?: boolean)

// Get printer status
ipcMain.handle('printer:status')

// Get active printer
ipcMain.handle('printer:get-active')
```

## Best Practices

1. **Always connect before printing**: Ensure a printer is connected before attempting to print
2. **Handle errors gracefully**: Wrap print operations in try-catch blocks
3. **Use ESC/POS mode for thermal printers**: Thermal printers work best with ESC/POS commands
4. **Test with actual hardware**: Emulators may not accurately represent real printer behavior
5. **Keep escpos library updated**: Check for updates to the escpos library for bug fixes
6. **Monitor print queue**: The service maintains a print queue to handle multiple jobs

## Future Enhancements

- [ ] Network printer support (TCP/IP)
- [ ] Bluetooth printer support
- [ ] Print preview functionality
- [ ] Custom receipt templates
- [ ] Printer configuration profiles
- [ ] Multi-printer support
- [ ] Print job history and retry
- [ ] Advanced error recovery

## References

- [node-escpos GitHub](https://github.com/lsongdev/node-escpos)
- [ESC/POS Command Reference](https://reference.epson-biz.com/modules/ref_escpos/index.php)
- [TILL Engineering Blog](https://medium.com/till-engineering/receipt-printing-with-esc-pos-a-javascript-cross-platform-library-7110d7f7a1db)
