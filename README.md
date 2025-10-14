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
- **Python** - Backend API and business logic

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

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter electron-app build
```

## Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm lint` - Lint all apps
- `pnpm type-check` - Type check all TypeScript code
- `pnpm clean` - Clean build artifacts

## License

MIT

