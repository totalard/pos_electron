#!/usr/bin/env node

/**
 * Build script for compiling the Python backend server using PyInstaller
 * This creates a standalone executable that can be bundled with the Electron app
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Paths
const rootDir = path.join(__dirname, '..', '..', '..');
const backendDir = path.join(rootDir, 'apps', 'python-backend');
const distDir = path.join(backendDir, 'dist');
const specFile = path.join(backendDir, 'server.spec');

console.log('='.repeat(60));
console.log('Building Python Backend Server');
console.log('='.repeat(60));
console.log('');

// Check if Python backend directory exists
if (!fs.existsSync(backendDir)) {
  console.error('❌ Error: Python backend directory not found:', backendDir);
  process.exit(1);
}

// Check if spec file exists
if (!fs.existsSync(specFile)) {
  console.error('❌ Error: PyInstaller spec file not found:', specFile);
  console.error('Expected location:', specFile);
  process.exit(1);
}

console.log('📁 Backend directory:', backendDir);
console.log('📄 Spec file:', specFile);
console.log('');

// Clean previous build
console.log('🧹 Cleaning previous build...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
  console.log('✅ Cleaned dist directory');
}

const buildDir = path.join(backendDir, 'build');
if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true, force: true });
  console.log('✅ Cleaned build directory');
}
console.log('');

// Determine the platform
const platform = process.platform;
const isWindows = platform === 'win32';
const isLinux = platform === 'linux';
const isMac = platform === 'darwin';
const venvPath = isWindows
  ? path.join(backendDir, 'venv', 'Scripts')
  : path.join(backendDir, 'venv', 'bin');
const pythonExe = isWindows ? 'python.exe' : 'python3';
const pipExe = isWindows ? 'pip.exe' : 'pip';

console.log('🔧 Platform:', platform);
console.log('🐍 Virtual environment:', venvPath);
console.log('');

// Warning about cross-compilation
console.log('⚠️  IMPORTANT: PyInstaller cannot cross-compile!');
console.log('   This build will create an executable for:', platform);
if (isWindows) {
  console.log('   Output: pos-server.exe (Windows only)');
} else if (isLinux) {
  console.log('   Output: pos-server (Linux only)');
} else if (isMac) {
  console.log('   Output: pos-server (macOS only)');
}
console.log('   To build for other platforms, run this script on that platform.');
console.log('');

// Check if virtual environment exists
if (!fs.existsSync(venvPath)) {
  console.error('❌ Error: Virtual environment not found:', venvPath);
  console.error('Please create a virtual environment first:');
  console.error('  cd apps/python-backend');
  console.error('  python -m venv venv');
  console.error('  source venv/bin/activate  # On Windows: venv\\Scripts\\activate');
  console.error('  pip install -r requirements.txt');
  process.exit(1);
}

// Install PyInstaller if not already installed
console.log('📦 Ensuring PyInstaller is installed...');
try {
  const pipPath = path.join(venvPath, pipExe);
  execSync(`"${pipPath}" install pyinstaller`, {
    cwd: backendDir,
    stdio: 'inherit',
  });
  console.log('✅ PyInstaller is ready');
} catch (error) {
  console.error('❌ Error installing PyInstaller:', error.message);
  process.exit(1);
}
console.log('');

// Build with PyInstaller
console.log('🔨 Building Python server with PyInstaller...');
console.log('This may take several minutes...');
console.log('');

try {
  const pyinstallerPath = path.join(venvPath, isWindows ? 'pyinstaller.exe' : 'pyinstaller');
  
  // Run PyInstaller
  execSync(`"${pyinstallerPath}" "${specFile}" --clean --noconfirm`, {
    cwd: backendDir,
    stdio: 'inherit',
  });

  console.log('');
  console.log('✅ Python server built successfully!');
  console.log('');

  // Verify the build
  const serverExe = isWindows ? 'pos-server.exe' : 'pos-server';
  const serverPath = path.join(distDir, 'pos-server', serverExe);
  
  if (fs.existsSync(serverPath)) {
    const stats = fs.statSync(serverPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log('📦 Server executable:', serverPath);
    console.log('📊 Size:', sizeMB, 'MB');
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Build completed successfully!');
    console.log('='.repeat(60));
  } else {
    console.error('❌ Error: Server executable not found at:', serverPath);
    process.exit(1);
  }
} catch (error) {
  console.error('');
  console.error('❌ Error building Python server:', error.message);
  console.error('');
  console.error('Please check the error messages above and ensure:');
  console.error('1. All dependencies are installed in the virtual environment');
  console.error('2. The spec file is correctly configured');
  console.error('3. There are no syntax errors in the Python code');
  process.exit(1);
}

