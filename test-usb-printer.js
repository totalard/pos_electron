#!/usr/bin/env node
/**
 * USB ESC/POS Printer Test Script
 * 
 * This script tests USB printer connectivity and ESC/POS printing
 * Run with: node test-usb-printer.js
 * 
 * Requirements:
 * - USB printer connected
 * - Proper USB permissions (may need sudo on Linux)
 */

const usb = require('usb');

// Known printer vendor IDs (common thermal/POS printers)
const KNOWN_PRINTER_VENDORS = [
  { vendorId: 0x04b8, name: 'Epson' },
  { vendorId: 0x0519, name: 'Star Micronics' },
  { vendorId: 0x154f, name: 'Wincor Nixdorf' },
  { vendorId: 0x0483, name: 'STMicroelectronics' },
  { vendorId: 0x0416, name: 'Winbond' },
  { vendorId: 0x1504, name: 'Bixolon' },
  { vendorId: 0x0dd4, name: 'Custom Engineering' },
  { vendorId: 0x1fc9, name: 'NXP Semiconductors' },
  { vendorId: 0x0525, name: 'Netchip Technology' },
  { vendorId: 0x1a86, name: 'QinHeng Electronics' },
  { vendorId: 0x067b, name: 'Prolific' },
  { vendorId: 0x0fe6, name: 'ICS Advent' },
  { vendorId: 0x20d1, name: 'RONGTA' },
  { vendorId: 0x6868, name: 'Zjiang' },
  { vendorId: 0x0fe6, name: 'Xprinter' }
];

/**
 * ESC/POS Command Builder
 */
class EscPosBuilder {
  constructor() {
    this.buffer = [];
  }

  // Initialize printer
  init() {
    this.buffer.push(0x1b, 0x40);
    return this;
  }

  // Set text alignment (0=left, 1=center, 2=right)
  align(alignment) {
    const alignCode = alignment === 'left' ? 0x00 : alignment === 'center' ? 0x01 : 0x02;
    this.buffer.push(0x1b, 0x61, alignCode);
    return this;
  }

  // Set text size (width: 1-8, height: 1-8)
  size(width, height) {
    const size = ((width - 1) << 4) | (height - 1);
    this.buffer.push(0x1d, 0x21, size);
    return this;
  }

  // Set bold
  bold(enabled) {
    this.buffer.push(0x1b, 0x45, enabled ? 0x01 : 0x00);
    return this;
  }

  // Set underline (0=off, 1=1-dot, 2=2-dot)
  underline(mode) {
    this.buffer.push(0x1b, 0x2d, mode);
    return this;
  }

  // Add text
  text(text) {
    const textBuffer = Buffer.from(text, 'utf-8');
    this.buffer.push(...textBuffer);
    return this;
  }

  // Line feed
  feed(lines = 1) {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0a);
    }
    return this;
  }

  // Cut paper (full or partial)
  cut(mode = 'full') {
    this.buffer.push(0x1d, 0x56, mode === 'full' ? 0x00 : 0x01);
    return this;
  }

  // Open cash drawer
  openDrawer() {
    this.buffer.push(0x1b, 0x70, 0x00, 0x19, 0xfa);
    return this;
  }

  // Build final buffer
  build() {
    return Buffer.from(this.buffer);
  }
}

/**
 * Scan for USB printers
 */
function scanUSBPrinters() {
  console.log('\n🔍 Scanning for USB printers...\n');
  
  const devices = usb.getDeviceList();
  const printers = [];

  devices.forEach((device, index) => {
    const descriptor = device.deviceDescriptor;
    const vendorId = descriptor.idVendor;
    const productId = descriptor.idProduct;
    
    // Check if it's a known printer vendor
    const knownVendor = KNOWN_PRINTER_VENDORS.find(v => v.vendorId === vendorId);
    
    // Also check device class (7 = printer class)
    const isPrinterClass = descriptor.bDeviceClass === 7;
    
    if (knownVendor || isPrinterClass) {
      const deviceInfo = {
        index,
        device,
        vendorId,
        productId,
        vendorName: knownVendor ? knownVendor.name : 'Unknown',
        deviceClass: descriptor.bDeviceClass,
        isPrinterClass
      };
      
      printers.push(deviceInfo);
      
      console.log(`✓ Found printer #${printers.length}:`);
      console.log(`  Vendor: ${deviceInfo.vendorName} (0x${vendorId.toString(16).padStart(4, '0')})`);
      console.log(`  Product ID: 0x${productId.toString(16).padStart(4, '0')}`);
      console.log(`  Device Class: ${descriptor.bDeviceClass}${isPrinterClass ? ' (Printer)' : ''}`);
      console.log('');
    }
  });

  if (printers.length === 0) {
    console.log('❌ No USB printers found!');
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your printer is connected via USB');
    console.log('2. Check if the printer is powered on');
    console.log('3. On Linux, you may need to run with sudo: sudo node test-usb-printer.js');
    console.log('4. Check USB permissions: ls -l /dev/bus/usb/*/*');
    console.log('\nAll USB devices found:');
    devices.forEach((device, i) => {
      const desc = device.deviceDescriptor;
      console.log(`  ${i + 1}. Vendor: 0x${desc.idVendor.toString(16).padStart(4, '0')}, Product: 0x${desc.idProduct.toString(16).padStart(4, '0')}, Class: ${desc.bDeviceClass}`);
    });
  }

  return printers;
}

/**
 * Print to USB device
 */
async function printToUSB(device, data) {
  return new Promise((resolve, reject) => {
    console.log('\n📄 Attempting to print...\n');
    
    try {
      // Open the device
      console.log('1. Opening USB device...');
      device.open();
      console.log('   ✓ Device opened');

      // Get the first interface
      console.log('2. Getting interface...');
      const iface = device.interface(0);
      console.log(`   ✓ Interface 0 obtained (${iface.endpoints.length} endpoints)`);

      // Claim the interface
      console.log('3. Claiming interface...');
      try {
        // Check if kernel driver is active (Linux)
        if (iface.isKernelDriverActive()) {
          console.log('   ⚠ Kernel driver is active, attempting to detach...');
          try {
            iface.detachKernelDriver();
            console.log('   ✓ Kernel driver detached');
          } catch (error) {
            console.log('   ⚠ Could not detach kernel driver:', error.message);
            console.log('   ℹ This is normal on some systems. Continuing...');
          }
        }
        
        iface.claim();
        console.log('   ✓ Interface claimed');
      } catch (error) {
        console.log('   ⚠ Could not claim interface:', error.message);
        console.log('   ℹ Attempting to continue anyway...');
      }

      // Find the OUT endpoint
      console.log('4. Finding OUT endpoint...');
      const endpoints = iface.endpoints;
      console.log(`   Available endpoints:`);
      endpoints.forEach((ep, i) => {
        console.log(`   - Endpoint ${i}: direction=${ep.direction}, type=${ep.transferType}`);
      });
      
      const outEndpoint = endpoints.find(ep => ep.direction === 'out');
      
      if (!outEndpoint) {
        throw new Error('No OUT endpoint found on USB device');
      }
      
      console.log(`   ✓ OUT endpoint found`);

      // Send data to printer
      console.log(`5. Sending ${data.length} bytes to printer...`);
      outEndpoint.transfer(data, (error) => {
        if (error) {
          console.log('   ❌ Transfer failed:', error.message);
          
          // Try to release interface
          try {
            iface.release(true, () => {
              device.close();
              reject(new Error(`USB transfer failed: ${error.message}`));
            });
          } catch (e) {
            device.close();
            reject(new Error(`USB transfer failed: ${error.message}`));
          }
        } else {
          console.log('   ✓ Data sent successfully!');
          console.log('6. Releasing interface...');
          
          // Release interface and close device
          try {
            iface.release(true, (releaseError) => {
              if (releaseError) {
                console.log('   ⚠ Error releasing interface:', releaseError.message);
              } else {
                console.log('   ✓ Interface released');
              }
              
              console.log('7. Closing device...');
              device.close();
              console.log('   ✓ Device closed');
              
              console.log('\n✅ Print job completed successfully!\n');
              resolve();
            });
          } catch (e) {
            console.log('   ⚠ Error during cleanup:', e.message);
            device.close();
            resolve();
          }
        }
      });
    } catch (error) {
      console.log('\n❌ Error during print operation:', error.message);
      console.log('\nError details:', error);
      
      try {
        device.close();
      } catch (e) {
        // Ignore close errors
      }
      
      reject(error);
    }
  });
}

/**
 * Generate test receipt
 */
function generateTestReceipt() {
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();
  
  return new EscPosBuilder()
    .init()
    .align('center')
    .size(2, 2)
    .bold(true)
    .text('TEST PRINT')
    .feed(1)
    .size(1, 1)
    .bold(false)
    .text('ESC/POS USB Printer Test')
    .feed(2)
    .align('left')
    .text('================================')
    .feed(1)
    .text(`Date: ${dateStr}`)
    .feed(1)
    .text(`Time: ${timeStr}`)
    .feed(1)
    .text('================================')
    .feed(2)
    .text('If you can read this message,')
    .feed(1)
    .text('your USB printer is working')
    .feed(1)
    .text('correctly with ESC/POS!')
    .feed(2)
    .align('center')
    .text('--------------------------------')
    .feed(1)
    .bold(true)
    .text('SUCCESS!')
    .bold(false)
    .feed(1)
    .text('--------------------------------')
    .feed(3)
    .cut()
    .build();
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    printerIndex: 0,
    listOnly: false,
    help: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--list' || arg === '-l') {
      options.listOnly = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--printer' || arg === '-p') {
      options.printerIndex = parseInt(args[++i]) - 1;
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log('USB ESC/POS Printer Test Script');
  console.log('');
  console.log('Usage: node test-usb-printer.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  -h, --help              Show this help message');
  console.log('  -l, --list              List available printers and exit');
  console.log('  -p, --printer <number>  Select printer by number (default: 1)');
  console.log('  -v, --verbose           Enable verbose output');
  console.log('');
  console.log('Examples:');
  console.log('  node test-usb-printer.js                 # Test first printer');
  console.log('  node test-usb-printer.js --list          # List all printers');
  console.log('  node test-usb-printer.js --printer 2     # Test second printer');
  console.log('  sudo node test-usb-printer.js            # Run with elevated permissions');
  console.log('');
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  console.log('╔════════════════════════════════════════╗');
  console.log('║   USB ESC/POS Printer Test Script     ║');
  console.log('╚════════════════════════════════════════╝');
  
  try {
    // Scan for printers
    const printers = scanUSBPrinters();
    
    if (printers.length === 0) {
      process.exit(1);
    }

    // List only mode
    if (options.listOnly) {
      console.log(`\n✓ Found ${printers.length} printer(s)`);
      console.log('\nTo test a specific printer, use:');
      console.log('  node test-usb-printer.js --printer <number>');
      process.exit(0);
    }

    // Validate printer selection
    if (options.printerIndex < 0 || options.printerIndex >= printers.length) {
      console.log(`\n❌ Invalid printer number. Available: 1-${printers.length}`);
      console.log('Use --list to see all printers');
      process.exit(1);
    }

    // Use the selected printer
    const printerInfo = printers[options.printerIndex];
    console.log(`\n📌 Selected printer #${options.printerIndex + 1}: ${printerInfo.vendorName}`);
    console.log(`   Vendor ID: 0x${printerInfo.vendorId.toString(16).padStart(4, '0')}`);
    console.log(`   Product ID: 0x${printerInfo.productId.toString(16).padStart(4, '0')}`);

    // Generate test receipt
    console.log('\n📝 Generating test receipt...');
    const testData = generateTestReceipt();
    console.log(`   ✓ Generated ${testData.length} bytes of ESC/POS data`);

    if (options.verbose) {
      console.log('\n📊 ESC/POS Data (hex):');
      console.log('   ' + testData.toString('hex').match(/.{1,32}/g).join('\n   '));
    }

    // Print
    await printToUSB(printerInfo.device, testData);
    
    console.log('╔════════════════════════════════════════╗');
    console.log('║          Test Completed! ✓             ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('\nCheck your printer for the test receipt.');
    
  } catch (error) {
    console.error('\n╔════════════════════════════════════════╗');
    console.error('║            Test Failed! ✗              ║');
    console.error('╚════════════════════════════════════════╝');
    console.error('\nError:', error.message);
    console.error('\nFull error details:');
    console.error(error);
    
    console.error('\n📋 Troubleshooting tips:');
    console.error('1. Run with sudo on Linux: sudo node test-usb-printer.js');
    console.error('2. Check USB permissions: sudo chmod 666 /dev/bus/usb/*/*');
    console.error('3. Make sure no other application is using the printer');
    console.error('4. Try unplugging and replugging the USB cable');
    console.error('5. Check dmesg for USB errors: dmesg | tail -20');
    
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { scanUSBPrinters, printToUSB, generateTestReceipt, EscPosBuilder };
