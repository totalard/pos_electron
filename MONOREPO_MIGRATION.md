# Monorepo Migration: Turborepo → Concurrently

## Overview

This document describes the migration from **Turborepo** to **Concurrently** for managing monorepo lifecycle scripts in the POS Electron application.

## Why Migrate?

- **Simplicity**: Concurrently is a lightweight tool focused solely on running multiple commands in parallel
- **No Build Cache Complexity**: Removes the overhead of Turbo's caching system which may not be needed for this project
- **Transparent Execution**: Direct command execution without abstraction layers
- **Smaller Dependency Footprint**: Concurrently is much lighter than Turborepo

## Changes Made

### 1. Dependencies

**Removed:**
```json
"turbo": "^2.3.3"
```

**Added:**
```json
"concurrently": "^9.2.1"
```

### 2. Configuration Files

**Removed:**
- `turbo.json` - Turborepo configuration file
- `.turbo/` - Turborepo cache directory

### 3. Package Scripts

All scripts in `package.json` have been updated to use `concurrently` and `pnpm` workspace filters:

#### Before (Turborepo):
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean"
  }
}
```

#### After (Concurrently):
```json
{
  "scripts": {
    "dev": "concurrently --kill-others --names \"ELECTRON,PYTHON\" --prefix-colors \"cyan,magenta\" \"pnpm --filter electron-app dev\" \"pnpm --filter python-backend dev\"",
    "build": "pnpm --filter electron-app build && pnpm --filter python-backend build",
    "lint": "concurrently --names \"ELECTRON,PYTHON\" --prefix-colors \"cyan,magenta\" \"pnpm --filter electron-app lint\" \"pnpm --filter python-backend lint\"",
    "type-check": "concurrently --names \"ELECTRON,PYTHON\" --prefix-colors \"cyan,magenta\" \"pnpm --filter electron-app type-check\" \"pnpm --filter python-backend type-check\"",
    "clean": "concurrently --names \"ELECTRON,PYTHON\" --prefix-colors \"cyan,magenta\" \"pnpm --filter electron-app clean\" \"pnpm --filter python-backend clean\"",
    "dev:electron": "pnpm --filter electron-app dev",
    "dev:python": "pnpm --filter python-backend dev"
  }
}
```

## Script Explanations

### Development Scripts

#### `pnpm run dev`
Runs both Electron app and Python backend in parallel with:
- **`--kill-others`**: Kills all processes if one exits (useful for development)
- **`--names`**: Labels output with "ELECTRON" and "PYTHON"
- **`--prefix-colors`**: Colors output (cyan for Electron, magenta for Python)

#### `pnpm run dev:electron`
Runs only the Electron app in development mode

#### `pnpm run dev:python`
Runs only the Python backend in development mode

### Build Scripts

#### `pnpm run build`
Builds both apps **sequentially** (Electron first, then Python):
- Uses `&&` to ensure Electron builds successfully before Python
- Python backend doesn't require a build step (just echoes a message)

### Quality Assurance Scripts

#### `pnpm run lint`
Runs linting for both apps in parallel

#### `pnpm run type-check`
Runs type checking for both apps in parallel

#### `pnpm run clean`
Cleans build artifacts for both apps in parallel

## Concurrently Options Explained

### `--kill-others`
When one process exits, kill all other processes. This is useful for the `dev` script because if either the Electron app or Python backend crashes, you want to restart both.

### `--names "ELECTRON,PYTHON"`
Prefixes each line of output with the process name, making it easy to identify which app is logging what.

### `--prefix-colors "cyan,magenta"`
Colors the prefixes to make them more visually distinct:
- **Cyan** for Electron app
- **Magenta** for Python backend

## PNPM Workspace Filters

The scripts use `pnpm --filter <package-name>` to target specific workspace packages:

- `--filter electron-app`: Targets `apps/electron-app`
- `--filter python-backend`: Targets `apps/python-backend`

This is equivalent to Turbo's automatic workspace detection but more explicit.

## Usage Examples

### Start Development Environment
```bash
pnpm run dev
```
This will start both the Electron app and Python backend simultaneously.

### Start Only Electron App
```bash
pnpm run dev:electron
```

### Start Only Python Backend
```bash
pnpm run dev:python
```

### Build All Apps
```bash
pnpm run build
```

### Run Linting
```bash
pnpm run lint
```

### Run Type Checking
```bash
pnpm run type-check
```

### Clean Build Artifacts
```bash
pnpm run clean
```

## Benefits of This Approach

1. **Explicit Control**: You can see exactly what commands are being run
2. **Easy Debugging**: Clear output with color-coded prefixes
3. **Flexible**: Easy to add new scripts or modify existing ones
4. **Lightweight**: No build cache to manage or clear
5. **Transparent**: No hidden abstractions or magic

## Differences from Turborepo

### What We Lost
- **Build Caching**: Turbo's intelligent caching system
- **Dependency Graph**: Automatic task ordering based on dependencies
- **Remote Caching**: Ability to share cache across team/CI

### What We Gained
- **Simplicity**: Straightforward command execution
- **Transparency**: Clear understanding of what's running
- **Flexibility**: Easy to customize without learning Turbo's API
- **Smaller Bundle**: Fewer dependencies to install

## When to Consider Going Back to Turborepo

Consider switching back to Turborepo if:
1. Build times become significantly long and caching would help
2. You have complex inter-package dependencies that need orchestration
3. You want to share build cache across team members or CI/CD
4. You add more packages to the monorepo and need better task coordination

## Troubleshooting

### Issue: Commands not running in parallel
**Solution**: Check that `concurrently` is installed:
```bash
pnpm install
```

### Issue: Workspace not found
**Solution**: Ensure package names in `pnpm --filter` match the `name` field in each workspace's `package.json`:
- `apps/electron-app/package.json` → `"name": "electron-app"`
- `apps/python-backend/package.json` → `"name": "python-backend"`

### Issue: Colors not showing
**Solution**: Ensure your terminal supports ANSI colors. Most modern terminals do by default.

### Issue: Python backend exits immediately
**Solution**: This was resolved by:
1. Creating a dedicated `dev.sh` script in `apps/python-backend/`
2. Making it executable: `chmod +x apps/python-backend/dev.sh`
3. Updating the dev script to use `./dev.sh` instead of inline bash commands
4. Recreating the Python virtual environment if it's corrupted:
```bash
cd apps/python-backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Additional Resources

- [Concurrently Documentation](https://github.com/open-cli-tools/concurrently)
- [PNPM Workspace Documentation](https://pnpm.io/workspaces)
- [PNPM Filtering Documentation](https://pnpm.io/filtering)

## Additional Files Created

### `apps/python-backend/dev.sh`
A shell script to start the Python backend development server:

```bash
#!/bin/bash
# Development server startup script for Python backend

# Activate virtual environment
source venv/bin/activate

# Start uvicorn server with hot reload
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8001
```

This script was created to avoid issues with nested bash commands in pnpm scripts.

## Migration Checklist

- [x] Uninstall `turbo` package
- [x] Install `concurrently` package
- [x] Update all scripts in root `package.json`
- [x] Update Python backend `package.json` to use `dev.sh`
- [x] Create `apps/python-backend/dev.sh` script
- [x] Make `dev.sh` executable
- [x] Remove `turbo.json` configuration file
- [x] Remove `.turbo` cache directory
- [x] Fix Python virtual environment (reinstall dependencies)
- [x] Test all scripts (`dev`, `build`, `lint`, `type-check`, `clean`)
- [x] Verify both apps run simultaneously
- [x] Document the migration

## Conclusion

The migration from Turborepo to Concurrently simplifies the monorepo management while maintaining all essential functionality. The new setup is more transparent, easier to understand, and sufficient for the current project needs.

