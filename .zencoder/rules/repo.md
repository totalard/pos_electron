---
description: Repository Information Overview
alwaysApply: true
---

# Repository Information Overview

## Repository Summary
A modern Point of Sale (POS) application built with Electron, TypeScript, React, Tailwind CSS v4, Zustand for state management, and a Python FastAPI backend. The application is designed for retail and restaurant environments with support for various hardware peripherals.

## Repository Structure
The repository is organized as a monorepo using pnpm workspaces and Turborepo for build orchestration:

- **apps/**: Contains the main applications
  - **electron-app/**: Electron frontend application
  - **python-backend/**: Python FastAPI backend service
- **packages/**: Directory for shared packages (currently empty)

### Main Repository Components
- **Electron Frontend**: React-based UI for the POS system with hardware integration
- **Python Backend**: FastAPI service providing data storage and business logic
- **Monorepo Configuration**: Turborepo setup for coordinated builds and development

## Projects

### Electron Frontend
**Configuration File**: `apps/electron-app/package.json`

#### Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.7.3
**Build System**: Vite 6.0.7
**Package Manager**: pnpm 9.15.4

#### Dependencies
**Main Dependencies**:
- React 18.3.1
- React DOM 18.3.1
- Zustand 5.0.2 (State management)
- Electron 33.3.1

**Development Dependencies**:
- Vite 6.0.7
- TypeScript 5.7.3
- Tailwind CSS 4.0.0-beta.10
- Electron Builder 25.1.8

#### Build & Installation
```bash
pnpm --filter electron-app install
pnpm --filter electron-app build
```

#### Main Files
**Entry Points**:
- `apps/electron-app/src/main/main.ts`: Electron main process
- `apps/electron-app/src/renderer/main.tsx`: React renderer entry
- `apps/electron-app/src/preload/preload.ts`: Preload script

**Key Components**:
- `apps/electron-app/src/renderer/components/`: UI components
- `apps/electron-app/src/renderer/stores/`: Zustand state stores

### Python Backend
**Configuration File**: `apps/python-backend/requirements.txt`

#### Language & Runtime
**Language**: Python
**Version**: Python 3.11+
**Package Manager**: pip

#### Dependencies
**Main Dependencies**:
- FastAPI 0.115.6
- Uvicorn 0.34.0
- Tortoise ORM 0.21.7
- Pydantic 2.10.5

**Development Dependencies**:
- Pylint 3.3.3
- Mypy 1.14.1
- Black 24.10.0
- Pytest 8.3.4

#### Build & Installation
```bash
cd apps/python-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Main Files
**Entry Point**:
- `apps/python-backend/src/main.py`: FastAPI application entry

**Key Components**:
- `apps/python-backend/src/api/`: API endpoints
- `apps/python-backend/src/database/`: Database models and configuration
- `apps/python-backend/src/database/models/`: Data models

#### Testing
**Framework**: Pytest 8.3.4
**Test Location**: No dedicated test directory found
**Run Command**:
```bash
cd apps/python-backend
source venv/bin/activate
python -m pytest
```

## Development Workflow
**Start Development**:
```bash
# Start both frontend and backend
pnpm dev

# Start individual components
pnpm --filter electron-app dev
pnpm --filter python-backend dev
```

**Build All**:
```bash
pnpm build
```