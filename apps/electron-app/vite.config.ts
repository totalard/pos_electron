import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import renderer from 'vite-plugin-electron-renderer'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: 'src/main/main.ts',
        vite: {
          build: {
            outDir: 'dist/main',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      preload: {
        input: 'src/preload/preload.ts',
        vite: {
          build: {
            outDir: 'dist/preload'
          }
        }
      },
      renderer: {}
    }),
    // Enable HMR for Electron renderer process
    renderer()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist/renderer',
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    // Ensure HMR works properly
    strictPort: true,
    hmr: {
      overlay: true
    }
  }
})

