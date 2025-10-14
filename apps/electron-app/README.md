# POS Electron Application

Modern Point of Sale desktop application built with Electron, TypeScript, Tailwind CSS v4, and Zustand.

## Tech Stack

- **Electron** - Cross-platform desktop framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React** - UI library
- **Tailwind CSS v4** - Utility-first CSS framework
- **Zustand** - Lightweight state management

## Development

### Install Dependencies

```bash
# From monorepo root
pnpm install
```

### Run Development Server

```bash
# From monorepo root
pnpm --filter electron-app dev

# Or from this directory
pnpm dev
```

### Build for Production

```bash
# From monorepo root
pnpm --filter electron-app build

# Or from this directory
pnpm build
```

## Project Structure

```
electron-app/
├── src/
│   ├── main/              # Electron main process
│   │   └── main.ts
│   ├── preload/           # Preload scripts
│   │   └── preload.ts
│   └── renderer/          # React renderer process
│       ├── components/    # React components
│       ├── stores/        # Zustand stores
│       ├── styles/        # CSS files
│       ├── App.tsx        # Root component
│       └── main.tsx       # Entry point
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json
```

## Features

- ✅ Modern Electron setup with TypeScript
- ✅ Vite for fast development and building
- ✅ React for UI components
- ✅ Tailwind CSS v4 with custom theme
- ✅ Zustand for state management
- ✅ Context isolation for security
- ✅ Hot Module Replacement (HMR)
- ✅ Type-safe IPC communication

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Run ESLint
- `pnpm clean` - Clean build artifacts

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## State Management

The app uses Zustand for state management. Stores are located in `src/renderer/stores/`.

Example usage:

```tsx
import { useAppStore } from '@/stores'

function MyComponent() {
  const { currentUser, setCurrentUser } = useAppStore()
  
  return <div>User: {currentUser}</div>
}
```

## Styling

The app uses Tailwind CSS v4 with custom utilities defined in `src/renderer/styles/index.css`.

Custom utilities:
- `card` - Card container with shadow and border
- `btn-primary` - Primary button style
- `btn-secondary` - Secondary button style

## Security

- Context isolation is enabled
- Node integration is disabled in renderer
- Preload script provides safe API access
- Content Security Policy is configured

