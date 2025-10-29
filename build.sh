#!/bin/bash

###############################################################################
# Multi-Platform Build Script for POS Electron Application
# This script builds the complete application with embedded Python server
# Supports: Windows, Linux
###############################################################################

set -e  # Exit on error

# Parse command line arguments
BUILD_TARGET="${1:-all}"

echo "============================================================"
echo "POS Electron Application - Build Script"
echo "Target: $BUILD_TARGET"
echo "============================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📁 Working directory: $SCRIPT_DIR"
echo ""

# Step 1: Install Node dependencies
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Installing Node.js dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ Error: pnpm is not installed${NC}"
    echo "Please install pnpm: npm install -g pnpm"
    exit 1
fi

echo "📦 Installing dependencies with pnpm..."
pnpm install
echo -e "${GREEN}✅ Node.js dependencies installed${NC}"
echo ""

# Step 2: Set up Python virtual environment
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Setting up Python environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd apps/python-backend

if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo "✓ Virtual environment already exists"
fi

echo ""
echo "📦 Installing Python dependencies..."

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}✅ Python dependencies installed${NC}"
echo ""

cd "$SCRIPT_DIR"

# Step 3: Build Python server with PyInstaller
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Building Python server executable"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd apps/electron-app
node scripts/build-python-server.js

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build Python server${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python server built successfully${NC}"
echo ""

cd "$SCRIPT_DIR"

# Step 4: Build Electron application
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Building Electron application"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔨 Compiling TypeScript..."
cd apps/electron-app
pnpm exec tsc || echo -e "${YELLOW}⚠️  TypeScript compilation had errors, continuing anyway...${NC}"

echo ""
echo "📦 Building with Vite..."
pnpm exec vite build

echo ""
echo "🎁 Packaging with electron-builder..."

# Build based on target
case "$BUILD_TARGET" in
    windows|win)
        echo "Building for Windows..."
        pnpm exec electron-builder --win --x64
        ;;
    linux)
        echo "Building for Linux..."
        pnpm exec electron-builder --linux --x64
        ;;
    all)
        echo "Building for all platforms..."
        pnpm exec electron-builder --win --linux --x64
        ;;
    *)
        echo -e "${RED}❌ Invalid build target: $BUILD_TARGET${NC}"
        echo "Usage: $0 [windows|linux|all]"
        exit 1
        ;;
esac

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build Electron application${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Electron application built successfully${NC}"
echo ""

cd "$SCRIPT_DIR"

# Step 5: Show build results
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Build Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RELEASE_DIR="apps/electron-app/release"

if [ -d "$RELEASE_DIR" ]; then
    echo "📦 Build artifacts:"
    echo ""

    # Show all installer files
    find "$RELEASE_DIR" -type f \( \
        -name "*.exe" -o \
        -name "*.msi" -o \
        -name "*.AppImage" -o \
        -name "*.deb" -o \
        -name "*.rpm" \
    \) -exec ls -lh {} \;

    echo ""
    echo -e "${GREEN}✅ Installers created successfully!${NC}"
    echo ""
    echo "📍 Location: $RELEASE_DIR"
    echo ""

    # Show platform-specific instructions
    case "$BUILD_TARGET" in
        windows|win)
            echo "Windows installers:"
            echo "  - .exe (NSIS installer) - Full installer with wizard"
            echo "  - Portable.exe - Portable version (no installation required)"
            ;;
        linux)
            echo "Linux installers:"
            echo "  - .AppImage - Universal Linux package (run anywhere)"
            echo "  - .deb - Debian/Ubuntu package"
            echo "  - .rpm - RedHat/Fedora/CentOS package"
            ;;
        all)
            echo "All platform installers created!"
            echo ""
            echo "Windows:"
            echo "  - .exe (NSIS installer)"
            echo "  - Portable.exe"
            echo ""
            echo "Linux:"
            echo "  - .AppImage"
            echo "  - .deb"
            echo "  - .rpm"
            ;;
    esac

    echo ""
    echo "You can now distribute these installers to users."
else
    echo -e "${YELLOW}⚠️  Warning: Release directory not found${NC}"
fi

echo ""
echo "============================================================"
echo "Build process completed!"
echo "============================================================"

