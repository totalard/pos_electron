@echo off
REM ============================================================================
REM Multi-Platform Build Script for POS Electron Application
REM This script builds the complete application with embedded Python server
REM Supports: Windows, Linux, All
REM ============================================================================

setlocal enabledelayedexpansion

REM Parse command line arguments
set BUILD_TARGET=%1
if "%BUILD_TARGET%"=="" set BUILD_TARGET=all

echo ============================================================
echo POS Electron Application - Build Script
echo Target: %BUILD_TARGET%
echo ============================================================
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo Working directory: %SCRIPT_DIR%
echo.

REM Step 1: Install Node dependencies
echo ================================================================
echo Step 1: Installing Node.js dependencies
echo ================================================================
echo.

where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] pnpm is not installed
    echo Please install pnpm: npm install -g pnpm
    exit /b 1
)

echo Installing dependencies with pnpm...
call pnpm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install Node.js dependencies
    exit /b 1
)
echo [SUCCESS] Node.js dependencies installed
echo.

REM Step 2: Set up Python virtual environment
echo ================================================================
echo Step 2: Setting up Python environment
echo ================================================================
echo.

cd apps\python-backend

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to create virtual environment
        exit /b 1
    )
    echo [SUCCESS] Virtual environment created
) else (
    echo Virtual environment already exists
)

echo.
echo Installing Python dependencies...

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install Python dependencies
    exit /b 1
)

echo [SUCCESS] Python dependencies installed
echo.

cd /d "%SCRIPT_DIR%"

REM Step 3: Build Python server with PyInstaller
echo ================================================================
echo Step 3: Building Python server executable
echo ================================================================
echo.

cd apps\electron-app
call node scripts\build-python-server.js
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to build Python server
    exit /b 1
)

echo [SUCCESS] Python server built successfully
echo.

cd /d "%SCRIPT_DIR%"

REM Step 4: Build Electron application
echo ================================================================
echo Step 4: Building Electron application
echo ================================================================
echo.

echo Compiling TypeScript...
cd apps\electron-app
call pnpm run type-check
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] TypeScript compilation failed
    exit /b 1
)

echo.
echo Building with Vite...
call pnpm exec vite build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Vite build failed
    exit /b 1
)

echo.
echo Packaging with electron-builder...

REM Build based on target
if /i "%BUILD_TARGET%"=="windows" goto build_windows
if /i "%BUILD_TARGET%"=="win" goto build_windows
if /i "%BUILD_TARGET%"=="linux" goto build_linux
if /i "%BUILD_TARGET%"=="all" goto build_all
goto invalid_target

:build_windows
echo Building for Windows...
call pnpm exec electron-builder --win --x64
goto check_result

:build_linux
echo Building for Linux...
call pnpm exec electron-builder --linux --x64
goto check_result

:build_all
echo Building for all platforms...
call pnpm exec electron-builder --win --linux --x64
goto check_result

:invalid_target
echo [ERROR] Invalid build target: %BUILD_TARGET%
echo Usage: %0 [windows^|linux^|all]
exit /b 1

:check_result
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to build Electron application
    exit /b 1
)

echo [SUCCESS] Electron application built successfully
echo.

cd /d "%SCRIPT_DIR%"

REM Step 5: Show build results
echo ================================================================
echo Build Complete!
echo ================================================================
echo.

set RELEASE_DIR=apps\electron-app\release

if exist "%RELEASE_DIR%" (
    echo Build artifacts:
    echo.

    REM Show all installer files
    dir /s /b "%RELEASE_DIR%\*.exe" "%RELEASE_DIR%\*.AppImage" "%RELEASE_DIR%\*.deb" "%RELEASE_DIR%\*.rpm" 2>nul

    echo.
    echo [SUCCESS] Installers created successfully!
    echo.
    echo Location: %RELEASE_DIR%
    echo.

    REM Show platform-specific instructions
    if /i "%BUILD_TARGET%"=="windows" goto show_windows
    if /i "%BUILD_TARGET%"=="win" goto show_windows
    if /i "%BUILD_TARGET%"=="linux" goto show_linux
    if /i "%BUILD_TARGET%"=="all" goto show_all

    :show_windows
    echo Windows installers:
    echo   - .exe (NSIS installer) - Full installer with wizard
    echo   - Portable.exe - Portable version (no installation required)
    goto show_done

    :show_linux
    echo Linux installers:
    echo   - .AppImage - Universal Linux package (run anywhere)
    echo   - .deb - Debian/Ubuntu package
    echo   - .rpm - RedHat/Fedora/CentOS package
    goto show_done

    :show_all
    echo All platform installers created!
    echo.
    echo Windows:
    echo   - .exe (NSIS installer)
    echo   - Portable.exe
    echo.
    echo Linux:
    echo   - .AppImage
    echo   - .deb
    echo   - .rpm
    goto show_done

    :show_done
    echo.
    echo You can now distribute these installers to users.
) else (
    echo [WARNING] Release directory not found
)

echo.
echo ============================================================
echo Build process completed!
echo ============================================================

endlocal

