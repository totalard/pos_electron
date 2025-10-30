#!/bin/bash

###############################################################################
# Build Windows Python Backend on Linux using Wine
# This script creates a Windows executable of the Python backend
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "============================================================"
echo "Building Windows Python Backend (using Wine)"
echo "============================================================"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/apps/python-backend"
WINE_PREFIX="$HOME/.wine-pos-build"

echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Backend directory: $BACKEND_DIR"
echo "🍷 Wine prefix: $WINE_PREFIX"
echo ""

# Check Wine
if ! command -v wine &> /dev/null; then
    echo -e "${RED}❌ Wine is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Wine: $(wine --version)${NC}"
echo ""

# Step 1: Setup Wine environment
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Setting up Wine environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -d "$WINE_PREFIX" ]; then
    echo "Creating Wine prefix..."
    WINEPREFIX="$WINE_PREFIX" WINEARCH=win64 wine wineboot 2>&1 | grep -v "^wine: " || true
    echo -e "${GREEN}✅ Wine prefix created${NC}"
else
    echo "✓ Wine prefix exists"
fi
echo ""

# Step 2: Check/Install Windows Python
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Checking Windows Python installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PYTHON_EXE="$WINE_PREFIX/drive_c/Program Files/Python312/python.exe"

if [ ! -f "$PYTHON_EXE" ]; then
    echo -e "${YELLOW}⚠️  Windows Python not found in Wine${NC}"
    echo ""
    echo "Please install Python 3.12 for Windows in Wine:"
    echo "1. Download: https://www.python.org/ftp/python/3.12.0/python-3.12.0-amd64.exe"
    echo "2. Install: WINEPREFIX=\"$WINE_PREFIX\" wine python-3.12.0-amd64.exe /quiet InstallAllUsers=1 PrependPath=1"
    echo ""
    echo "Or run this command:"
    echo "  wget https://www.python.org/ftp/python/3.12.0/python-3.12.0-amd64.exe"
    echo "  WINEPREFIX=\"$WINE_PREFIX\" wine python-3.12.0-amd64.exe /quiet InstallAllUsers=1 PrependPath=1"
    exit 1
fi

echo -e "${GREEN}✅ Windows Python found${NC}"
echo ""

# Step 3: Install Python dependencies in Wine
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Installing Python dependencies in Wine"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$BACKEND_DIR"

echo "Installing pip packages..."
WINEPREFIX="$WINE_PREFIX" wine "$PYTHON_EXE" -m pip install --upgrade pip 2>&1 | grep -v "^wine: " || true
WINEPREFIX="$WINE_PREFIX" wine "$PYTHON_EXE" -m pip install -r requirements-windows.txt 2>&1 | grep -v "^wine: " || true

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Build with PyInstaller
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Building Windows executable with PyInstaller"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Clean previous build
if [ -d "dist/pos-server-windows" ]; then
    rm -rf dist/pos-server-windows
fi
if [ -d "build" ]; then
    rm -rf build
fi

echo "Running PyInstaller..."
WINEPREFIX="$WINE_PREFIX" wine "$PYTHON_EXE" -m PyInstaller server.spec --clean --noconfirm 2>&1 | grep -v "^wine: " || true

echo ""

# Step 5: Rename and verify
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Verifying build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "dist/pos-server" ]; then
    mv dist/pos-server dist/pos-server-windows
    
    SERVER_EXE="dist/pos-server-windows/pos-server.exe"
    
    if [ -f "$SERVER_EXE" ]; then
        FILE_TYPE=$(file "$SERVER_EXE")
        SIZE_MB=$(du -h "$SERVER_EXE" | cut -f1)
        
        echo -e "${GREEN}✅ Build successful!${NC}"
        echo ""
        echo "📦 Executable: $SERVER_EXE"
        echo "📊 Size: $SIZE_MB"
        echo "🔍 Type: $FILE_TYPE"
        echo ""
        
        # Check if it's a Windows executable
        if echo "$FILE_TYPE" | grep -q -E "PE32|MS Windows"; then
            echo -e "${GREEN}✅ Verified: Windows PE executable${NC}"
        else
            echo -e "${YELLOW}⚠️  Warning: File type doesn't look like a Windows executable${NC}"
            echo "File type: $FILE_TYPE"
        fi
    else
        echo -e "${RED}❌ Build failed: pos-server.exe not found${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Build failed: dist/pos-server directory not found${NC}"
    exit 1
fi

echo ""
echo "============================================================"
echo "Windows Python Backend Build Complete!"
echo "============================================================"
echo ""

cd "$PROJECT_ROOT"

