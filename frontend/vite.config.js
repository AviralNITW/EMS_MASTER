import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/",
  plugins: [react()],
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    minify: 'esbuild',
    chunkSizeWarningLimit: 700,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react', 'react-icons'],
          'vendor-auth': ['@react-oauth/google'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'lodash'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  server: {
    hmr: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      'recharts',
      'date-fns',
      'clsx',
      'tailwind-merge',
    ],
  },
})
