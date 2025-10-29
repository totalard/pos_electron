# POS Electron Application - Monorepo

A modern Point of Sale (POS) application built with Electron, TypeScript, Tailwind CSS v4, Zustand, and Python backend.

## Tech Stack

### Frontend (Electron)
- **Electron** - Cross-platform desktop application framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Zustand** - Lightweight state management

### Backend
- **Python 3.10+** - Backend API and business logic
- **FastAPI** - Modern, fast web framework
- **Uvicorn** - ASGI server
- **Tortoise ORM** - Async ORM for database operations
- **SQLite** - Embedded database
- **PyInstaller** - Compiles Python to standalone executable

## Project Structure

```
pos_electron/
├── apps/
│   ├── electron-app/     # Electron frontend application
│   └── python-backend/   # Python backend service
├── packages/             # Shared packages (if needed)
├── package.json          # Root package.json
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── turbo.json           # Turborepo configuration
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Python >= 3.11

### Installation

```bash
# Install dependencies
pnpm install

# Set up Python backend
cd apps/python-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm --filter electron-app dev
pnpm --filter python-backend dev
```

### Build

For detailed build instructions, see [BUILD.md](BUILD.md).

**Quick build for distribution:**

```bash
# Linux/macOS - Build for all platforms
./build.sh all

# Windows - Build for all platforms
build.bat all

# Or build for specific platform
./build.sh windows    # Windows only
./build.sh linux      # Linux only
```

**Manual build:**

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter electron-app build

# Build with Python server embedded
cd apps/electron-app
pnpm run build:win      # Windows installer
pnpm run build:linux    # Linux packages (AppImage, DEB, RPM)
pnpm run build:all      # All platforms
```

**Build output:**

Installers are created in `apps/electron-app/release/`:
- Windows: NSIS installer + Portable executable
- Linux: AppImage, DEB, and RPM packages

## Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm lint` - Lint all apps
- `pnpm type-check` - Type check all TypeScript code
- `pnpm clean` - Clean build artifacts

## Distribution

The build process creates self-contained installers that include:
- Electron frontend application
- Compiled Python backend (non-revertable binary)
- All dependencies bundled
- No Python installation required on user machines

**Supported Platforms:**
- Windows 10/11 (64-bit)
- Linux (64-bit) - Ubuntu, Debian, Fedora, etc.

**Installer Types:**
- **Windows**: NSIS installer (.exe) and Portable executable
- **Linux**: AppImage (universal), DEB (Debian/Ubuntu), RPM (RedHat/Fedora)

See [BUILD.md](BUILD.md) for detailed build and distribution instructions.

## Features

- 🖥️ Cross-platform desktop application (Windows & Linux)
- 🐍 Embedded Python backend (compiled, secure)
- 💾 SQLite database (local, embedded)
- 🔒 Secure distribution (Python code compiled to binary)
- 📦 Single installer includes everything
- 🚀 No external dependencies for end users

## License

MIT

