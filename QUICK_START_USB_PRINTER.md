# Quick Start: USB Printer Testing

## 🚀 Quick Test (3 Steps)

### 1. Run the test script
```bash
sudo node test-usb-printer.js
```

### 2. Check your printer
A test receipt should print with:
- "TEST PRINT" header
- Current date/time
- Success message

### 3. Done! ✅
If it printed successfully, your USB printer is working with ESC/POS!

---

## 📋 Command Reference

### List available printers
```bash
sudo node test-usb-printer.js --list
```

### Test specific printer
```bash
sudo node test-usb-printer.js --printer 2
```

### Verbose output (see ESC/POS hex data)
```bash
sudo node test-usb-printer.js --verbose
```

### Show help
```bash
node test-usb-printer.js --help
```

---

## 🔧 Setup USB Permissions (Optional)

To run without `sudo`:

```bash
# Run the setup script
sudo ./setup-usb-permissions.sh

# Unplug and replug your printer
# Log out and log back in

# Now test without sudo
node test-usb-printer.js
```

---

## ❌ Troubleshooting

### "No USB printers found"
- Check USB cable connection
- Verify printer is powered on
- Run: `lsusb` to see all USB devices

### "LIBUSB_ERROR_ACCESS"
- Run with sudo: `sudo node test-usb-printer.js`
- Or setup permissions: `sudo ./setup-usb-permissions.sh`

### "LIBUSB_ERROR_BUSY"
- Close other applications using the printer
- Stop CUPS: `sudo systemctl stop cups`
- Restart printer

### Print succeeds but nothing prints
- Check printer has paper
- Verify printer is in ESC/POS mode
- Check printer status lights
- Try: `sudo node test-usb-printer.js --verbose`

---

## 📚 Files Created

- **test-usb-printer.js** - Main test script
- **setup-usb-permissions.sh** - USB permissions setup
- **USB_PRINTER_TEST_README.md** - Detailed documentation
- **QUICK_START_USB_PRINTER.md** - This file

---

## 🔗 Integration

This test script uses the same USB printing logic as the main application:

- `apps/electron-app/src/main/services/PrinterService.ts`
- `apps/electron-app/src/main/services/HardwareManager.ts`

The `EscPosBuilder` class in the test script matches the one in `PrinterService.ts`.

---

## ✨ Features

- ✅ Automatic printer detection
- ✅ Support for 15+ printer brands
- ✅ ESC/POS command generation
- ✅ Detailed error messages
- ✅ Multiple printer selection
- ✅ Verbose debugging mode
- ✅ Permission setup helper

---

**Need help?** Check `USB_PRINTER_TEST_README.md` for detailed documentation.
