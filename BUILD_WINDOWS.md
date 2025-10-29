# Building POS Electron Application for Windows

This guide explains how to build a production-ready Windows installer for the POS Electron application with an embedded Python backend server.

## Overview

The build process creates a single Windows installer that includes:
- Electron frontend application
- Python backend server (compiled to a standalone executable using PyInstaller)
- All necessary dependencies bundled together
- No external Python installation required

## Prerequisites

### Required Software

1. **Node.js** (>= 20.0.0)
   - Download from: https://nodejs.org/

2. **pnpm** (>= 9.0.0)
   ```bash
   npm install -g pnpm
   ```

3. **Python** (>= 3.11)
   - Download from: https://www.python.org/downloads/
   - Make sure to check "Add Python to PATH" during installation

4. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/

### System Requirements

- Windows 10 or later (64-bit)
- At least 4GB of RAM
- At least 2GB of free disk space

## Build Instructions

### Option 1: Using the Automated Build Script (Recommended)

#### On Windows:

1. Open Command Prompt or PowerShell
2. Navigate to the project root directory
3. Run the build script:
   ```cmd
   build-windows.bat
   ```

#### On Linux/macOS (Cross-compilation):

1. Open Terminal
2. Navigate to the project root directory
3. Make the script executable:
   ```bash
   chmod +x build-windows.sh
   ```
4. Run the build script:
   ```bash
   ./build-windows.sh
   ```

### Option 2: Manual Build Steps

If you prefer to build manually or need to troubleshoot:

#### Step 1: Install Node.js Dependencies

```bash
pnpm install
```

#### Step 2: Set Up Python Environment

```bash
cd apps/python-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

cd ../..
```

#### Step 3: Build Python Server

```bash
cd apps/electron-app
node scripts/build-python-server.js
cd ../..
```

This will create a standalone executable at:
`apps/python-backend/dist/pos-server/pos-server.exe`

#### Step 4: Build Electron Application

```bash
cd apps/electron-app

# Type check
pnpm run type-check

# Build with Vite
pnpm exec vite build

# Package with electron-builder
pnpm exec electron-builder --win --x64

cd ../..
```

## Build Output

After a successful build, you'll find the installer in:

```
apps/electron-app/release/
```

The installer will be named something like:
- `POS System-1.0.0-x64.exe` (NSIS installer)

## Build Configuration

### Python Server Configuration

The Python server is compiled using PyInstaller with the following configuration:

- **Spec file**: `apps/python-backend/server.spec`
- **Output**: Standalone executable with all dependencies bundled
- **Mode**: Console application (for logging)
- **Compression**: UPX enabled for smaller file size

### Electron Builder Configuration

The Electron application is packaged using electron-builder with:

- **Target**: NSIS installer for Windows x64
- **Bundled resources**: Python server executable
- **Installer options**: 
  - User can choose installation directory
  - Desktop shortcut created
  - Start menu shortcut created

Configuration is in `apps/electron-app/package.json` under the `build` key.

## Troubleshooting

### Python Server Build Fails

**Issue**: PyInstaller fails to build the server

**Solutions**:
1. Ensure all Python dependencies are installed:
   ```bash
   cd apps/python-backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

2. Check for syntax errors in Python code:
   ```bash
   python -m py_compile src/main.py
   ```

3. Try building with verbose output:
   ```bash
   cd apps/python-backend
   pyinstaller server.spec --clean --noconfirm --log-level DEBUG
   ```

### Electron Build Fails

**Issue**: electron-builder fails to create installer

**Solutions**:
1. Ensure Python server was built successfully:
   - Check that `apps/python-backend/dist/pos-server/pos-server.exe` exists

2. Clean and rebuild:
   ```bash
   cd apps/electron-app
   pnpm run clean
   rm -rf release
   pnpm run build:win
   ```

3. Check for TypeScript errors:
   ```bash
   pnpm run type-check
   ```

### Missing Dependencies

**Issue**: "Module not found" errors during build

**Solutions**:
1. Reinstall Node.js dependencies:
   ```bash
   rm -rf node_modules apps/*/node_modules
   pnpm install
   ```

2. Reinstall Python dependencies:
   ```bash
   cd apps/python-backend
   rm -rf venv
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

### Large Installer Size

The installer may be 100-200MB due to:
- Bundled Python runtime and libraries
- Electron framework
- Node.js native modules

This is normal for a self-contained application with no external dependencies.

## Distribution

Once built, you can distribute the installer to end users. They will:

1. Download the installer (`.exe` file)
2. Run the installer
3. Follow the installation wizard
4. Launch the application from the desktop or start menu

**No additional software installation required** - everything is bundled!

## Development vs Production

### Development Mode

In development, the application:
- Uses the Python virtual environment directly
- Runs Python with `uvicorn` in reload mode
- Stores data in `apps/python-backend/data/`

### Production Mode

In production, the application:
- Uses the compiled Python executable
- Runs as a standalone process
- Stores data in the user's AppData directory

## Security Notes

The Python server is compiled into a binary executable, which:
- Makes the source code non-readable (obfuscated)
- Prevents easy modification of the backend logic
- Provides a level of protection for business logic

However, note that:
- PyInstaller binaries can be decompiled with effort
- For maximum security, consider additional obfuscation or encryption
- Sensitive data should still be encrypted in the database

## Next Steps

After building:

1. **Test the installer** on a clean Windows machine
2. **Verify all features** work correctly
3. **Check database creation** and data persistence
4. **Test hardware integration** (printers, barcode scanners, etc.)
5. **Create a code signing certificate** for production releases (optional but recommended)

## Support

For issues or questions:
- Check the troubleshooting section above
- Review build logs in the console output
- Check `apps/electron-app/release/` for detailed build logs

