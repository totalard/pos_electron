# USB ESC/POS Printer Test Script

A standalone Node.js script to test USB thermal/POS printer connectivity and ESC/POS printing.

## Quick Start

```bash
# Run the test script
sudo node test-usb-printer.js
```

## Features

- ✅ Automatic USB printer detection
- ✅ Support for common thermal/POS printer brands (Epson, Star, Bixolon, etc.)
- ✅ ESC/POS command generation
- ✅ Detailed debugging output
- ✅ Error handling and troubleshooting tips
- ✅ Test receipt printing

## Requirements

- Node.js 20+ installed
- USB printer connected
- USB permissions (see below)

## USB Permissions

### Option 1: Run with sudo (Quick Test)
```bash
sudo node test-usb-printer.js
```

### Option 2: Set USB Permissions (Permanent)

Create a udev rule for your printer:

```bash
# Find your printer's vendor and product ID
lsusb

# Create udev rule (replace XXXX with your vendor ID)
sudo nano /etc/udev/rules.d/99-usb-printer.rules
```

Add this line (replace `1fc9` with your vendor ID):
```
SUBSYSTEM=="usb", ATTR{idVendor}=="1fc9", MODE="0666"
```

Reload udev rules:
```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

Unplug and replug your printer, then run without sudo:
```bash
node test-usb-printer.js
```

### Option 3: Add User to dialout Group
```bash
sudo usermod -a -G dialout $USER
# Log out and log back in
```

## Supported Printers

The script automatically detects printers from these vendors:

- **Epson** (0x04b8) - TM series
- **Star Micronics** (0x0519) - TSP series
- **Bixolon** (0x1504) - SRP series
- **RONGTA** (0x20d1) - RP series
- **Zjiang** (0x6868) - ZJ series
- **Xprinter** (0x0fe6) - XP series
- And many more...

## Test Receipt Output

The script prints a test receipt with:
- Large "TEST PRINT" header
- Current date and time
- Success message
- ESC/POS formatting (bold, alignment, sizing)
- Paper cut command

## Troubleshooting

### No printers found
1. Check USB connection: `lsusb`
2. Verify printer is powered on
3. Try different USB port
4. Check if printer is recognized: `dmesg | grep -i usb`

### LIBUSB_ERROR_ACCESS
- Run with sudo: `sudo node test-usb-printer.js`
- Or set up USB permissions (see above)

### LIBUSB_ERROR_BUSY
- Another application is using the printer
- Close CUPS, printer drivers, or other POS software
- Restart the printer

### Print job succeeds but nothing prints
1. Check if printer has paper
2. Verify printer is in ESC/POS mode (not in another emulation)
3. Some printers need specific initialization
4. Check printer status lights

### Wrong device detected
The script may detect non-printer USB devices. To select a specific printer:

Edit `test-usb-printer.js` and modify the `main()` function to select a different printer from the array.

## Integration with Your App

This script demonstrates the core USB printing logic used in the main application:

- `apps/electron-app/src/main/services/PrinterService.ts` - Main printer service
- `apps/electron-app/src/main/services/HardwareManager.ts` - Hardware coordination
- `apps/electron-app/src/main/services/USBDeviceService.ts` - USB device management

## Advanced Usage

### Custom ESC/POS Commands

Modify the `generateTestReceipt()` function to test different commands:

```javascript
const receipt = new EscPosBuilder()
  .init()
  .align('center')
  .size(2, 2)
  .bold(true)
  .text('CUSTOM TEXT')
  .feed(1)
  .cut()
  .build();
```

### Available ESC/POS Methods

- `init()` - Initialize printer
- `align('left'|'center'|'right')` - Set alignment
- `size(width, height)` - Set text size (1-8)
- `bold(true|false)` - Enable/disable bold
- `underline(0|1|2)` - Set underline mode
- `text(string)` - Add text
- `feed(lines)` - Line feed
- `cut('full'|'partial')` - Cut paper
- `openDrawer()` - Open cash drawer

## Testing Multiple Printers

If you have multiple printers, the script will detect all of them and use the first one. To test a specific printer, modify the script to select by index or vendor ID.

## License

Part of the POS Electron Application project.
