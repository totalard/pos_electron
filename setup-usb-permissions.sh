#!/bin/bash
# USB Printer Permissions Setup Script
# This script sets up proper USB permissions for thermal/POS printers

echo "╔════════════════════════════════════════╗"
echo "║   USB Printer Permissions Setup       ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root: sudo ./setup-usb-permissions.sh"
    exit 1
fi

echo "🔍 Detecting USB printers..."
echo ""

# List USB devices
lsusb | grep -i -E "printer|thermal|pos|epson|star|bixolon|rongta|zjiang|xprinter" || {
    echo "⚠️  No obvious printers found in lsusb output"
    echo ""
    echo "All USB devices:"
    lsusb
    echo ""
    echo "If your printer is listed above, note its Vendor ID (first hex number after 'ID')"
}

echo ""
echo "📝 Creating udev rules..."

# Create udev rules file
RULES_FILE="/etc/udev/rules.d/99-usb-printer.rules"

cat > "$RULES_FILE" << 'EOF'
# USB Printer Permissions for POS/Thermal Printers
# Allows non-root users to access USB printers

# Common thermal/POS printer vendors
SUBSYSTEM=="usb", ATTR{idVendor}=="04b8", MODE="0666", GROUP="dialout"  # Epson
SUBSYSTEM=="usb", ATTR{idVendor}=="0519", MODE="0666", GROUP="dialout"  # Star Micronics
SUBSYSTEM=="usb", ATTR{idVendor}=="1504", MODE="0666", GROUP="dialout"  # Bixolon
SUBSYSTEM=="usb", ATTR{idVendor}=="20d1", MODE="0666", GROUP="dialout"  # RONGTA
SUBSYSTEM=="usb", ATTR{idVendor}=="6868", MODE="0666", GROUP="dialout"  # Zjiang
SUBSYSTEM=="usb", ATTR{idVendor}=="0fe6", MODE="0666", GROUP="dialout"  # Xprinter
SUBSYSTEM=="usb", ATTR{idVendor}=="154f", MODE="0666", GROUP="dialout"  # Wincor Nixdorf
SUBSYSTEM=="usb", ATTR{idVendor}=="0dd4", MODE="0666", GROUP="dialout"  # Custom Engineering
SUBSYSTEM=="usb", ATTR{idVendor}=="1fc9", MODE="0666", GROUP="dialout"  # NXP Semiconductors
SUBSYSTEM=="usb", ATTR{idVendor}=="1a86", MODE="0666", GROUP="dialout"  # QinHeng Electronics

# Generic printer class devices
SUBSYSTEM=="usb", ATTR{bDeviceClass}=="07", MODE="0666", GROUP="dialout"
EOF

echo "✓ Created udev rules: $RULES_FILE"
echo ""

# Add current user to dialout group if not root
if [ -n "$SUDO_USER" ]; then
    echo "👤 Adding user '$SUDO_USER' to dialout group..."
    usermod -a -G dialout "$SUDO_USER"
    echo "✓ User added to dialout group"
    echo ""
fi

# Reload udev rules
echo "🔄 Reloading udev rules..."
udevadm control --reload-rules
udevadm trigger
echo "✓ Udev rules reloaded"
echo ""

echo "╔════════════════════════════════════════╗"
echo "║         Setup Complete! ✓              ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📋 Next steps:"
echo "1. Unplug and replug your USB printer"
echo "2. Log out and log back in (for group changes to take effect)"
echo "3. Run: node test-usb-printer.js (without sudo)"
echo ""
echo "If you still have issues, check:"
echo "- ls -l /dev/bus/usb/*/* | grep 0666"
echo "- groups (should show 'dialout')"
echo ""
