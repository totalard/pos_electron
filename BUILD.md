# POS System - Build Guide

This guide explains how to build the POS System for Windows and Linux platforms.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Build Options](#build-options)
- [Manual Build Steps](#manual-build-steps)
- [Build Artifacts](#build-artifacts)
- [Distribution](#distribution)
- [Troubleshooting](#troubleshooting)

## Overview

The POS System is built as an Electron application with an embedded Python backend server. The build process:

1. Compiles the Python backend into a standalone executable using PyInstaller
2. Bundles the Python executable with the Electron frontend
3. Creates platform-specific installers (NSIS for Windows, AppImage/DEB/RPM for Linux)

The Python server is compiled into a non-revertable binary, making it secure for distribution.

## Prerequisites

### All Platforms

- **Node.js** 18.x or higher
- **pnpm** 8.x or higher
- **Python** 3.10 or higher
- **Git**

### Windows-Specific

- **Windows 10/11** (64-bit)
- **Visual Studio Build Tools** (for native modules)
- **NSIS** (automatically downloaded by electron-builder)

### Linux-Specific

- **Ubuntu 20.04+** or equivalent
- **Build essentials**: `sudo apt install build-essential`
- **FPM** (for DEB/RPM): `gem install fpm` (optional, electron-builder can work without it)

## Quick Start

### Automated Build (Recommended)

#### Linux/macOS:

```bash
# Build for current platform only
./build.sh

# Build for Windows only
./build.sh windows

# Build for Linux only
./build.sh linux

# Build for all platforms
./build.sh all
```

#### Windows:

```cmd
REM Build for current platform only
build.bat

REM Build for Windows only
build.bat windows

REM Build for Linux only (requires WSL or cross-compilation setup)
build.bat linux

REM Build for all platforms
build.bat all
```

## Build Options

### Using npm/pnpm Scripts

From the `apps/electron-app` directory:

```bash
# Build Python server only
pnpm run build:python

# Build for Windows
pnpm run build:win

# Build for Linux
pnpm run build:linux

# Build for all platforms
pnpm run build:all
```

### Platform-Specific Builds

#### Windows Installers

The Windows build creates:
- **NSIS Installer** (`.exe`) - Full installer with installation wizard
- **Portable** (`.exe`) - Standalone executable, no installation required

#### Linux Installers

The Linux build creates:
- **AppImage** (`.AppImage`) - Universal Linux package, runs on any distribution
- **DEB** (`.deb`) - Debian/Ubuntu package
- **RPM** (`.rpm`) - RedHat/Fedora/CentOS package

## Manual Build Steps

If you prefer to build manually or need more control:

### 1. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Set up Python virtual environment
cd apps/python-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

### 2. Build Python Server

```bash
cd apps/electron-app
node scripts/build-python-server.js
```

This creates a compiled Python executable at:
`apps/python-backend/dist/pos-server/pos-server`

### 3. Build Electron Application

```bash
# Still in apps/electron-app directory

# Compile TypeScript
pnpm run type-check
tsc

# Build frontend with Vite
vite build

# Package with electron-builder
pnpm exec electron-builder --win --x64  # For Windows
pnpm exec electron-builder --linux --x64  # For Linux
pnpm exec electron-builder --win --linux --x64  # For both
```

## Build Artifacts

After a successful build, installers will be located in:

```
apps/electron-app/release/
├── POS System-1.0.0-Windows-x64.exe          # Windows NSIS installer
├── POS System-1.0.0-Windows-x64 Portable.exe # Windows portable
├── POS System-1.0.0-Linux-x64.AppImage       # Linux AppImage
├── POS System-1.0.0-Linux-x64.deb            # Debian/Ubuntu package
└── POS System-1.0.0-Linux-x64.rpm            # RedHat/Fedora package
```

### File Sizes (Approximate)

- Windows NSIS Installer: ~80-100 MB
- Windows Portable: ~80-100 MB
- Linux AppImage: ~90-110 MB
- Linux DEB: ~80-100 MB
- Linux RPM: ~80-100 MB

## Distribution

### Windows

**NSIS Installer:**
- Users double-click the `.exe` file
- Installation wizard guides through setup
- Creates Start Menu shortcuts and desktop icon
- Installs to `C:\Program Files\POS System` by default

**Portable:**
- Users can run directly without installation
- Extract to any folder and run
- Useful for USB drives or temporary installations

### Linux

**AppImage:**
```bash
chmod +x "POS System-1.0.0-Linux-x64.AppImage"
./"POS System-1.0.0-Linux-x64.AppImage"
```

**DEB (Debian/Ubuntu):**
```bash
sudo dpkg -i "POS System-1.0.0-Linux-x64.deb"
sudo apt-get install -f  # Fix dependencies if needed
```

**RPM (RedHat/Fedora):**
```bash
sudo rpm -i "POS System-1.0.0-Linux-x64.rpm"
# Or with dnf:
sudo dnf install "POS System-1.0.0-Linux-x64.rpm"
```

## Troubleshooting

### Python Build Issues

**Error: PyInstaller not found**
```bash
cd apps/python-backend
source venv/bin/activate
pip install pyinstaller
```

**Error: Module not found during runtime**
- Check `apps/python-backend/server.spec` hiddenimports list
- Add missing modules to the hiddenimports array
- Rebuild with `pnpm run build:python`

### Electron Build Issues

**Error: Cannot find Python server**
- Ensure Python server is built first: `pnpm run build:python`
- Check that `apps/python-backend/dist/pos-server/` exists

**Error: Icon not found**
- Create or download icon files:
  - `apps/electron-app/build/icon.png` (512x512 PNG)
  - `apps/electron-app/build/icon.ico` (256x256 ICO for Windows)

**Error: NSIS not found (Windows)**
- electron-builder should download NSIS automatically
- If it fails, install NSIS manually from https://nsis.sourceforge.io/

### Linux-Specific Issues

**Error: fpm not found**
- Install fpm: `gem install fpm`
- Or let electron-builder use its built-in packaging

**Error: Missing dependencies**
```bash
sudo apt-get install build-essential libxtst-dev libpng-dev
```

### Cross-Platform Building

**Building Linux packages on Windows:**
- Use WSL2 (Windows Subsystem for Linux)
- Or use Docker with electron-builder image
- Or build on a Linux CI/CD server

**Building Windows packages on Linux:**
- Install Wine: `sudo apt install wine64`
- electron-builder will use Wine for Windows builds
- May have limitations compared to native Windows builds

## Advanced Configuration

### Customizing the Build

Edit `apps/electron-app/package.json` under the `build` section:

```json
{
  "build": {
    "appId": "com.yourcompany.pos",
    "productName": "Your POS System",
    "win": {
      "target": ["nsis", "portable"]
    },
    "linux": {
      "target": ["AppImage", "deb", "rpm"],
      "category": "Office"
    }
  }
}
```

### Code Signing

For production releases, you should sign your applications:

**Windows:**
```json
{
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "password"
  }
}
```

**macOS (if building for Mac):**
```json
{
  "mac": {
    "identity": "Developer ID Application: Your Name"
  }
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build

on: [push]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - uses: pnpm/action-setup@v2
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: |
          cd apps/electron-app
          pnpm run build:all
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: installers-${{ matrix.os }}
          path: apps/electron-app/release/*
```

## Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review build logs in `apps/python-backend/build/`
- Check electron-builder logs in `apps/electron-app/`

## License

See [LICENSE](LICENSE) file for details.

