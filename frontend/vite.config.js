import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    // Use esbuild for fast, native minification
    minify: 'esbuild',
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — barely changes, should be cached long-term
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charts — heavy lib, separate chunk
          'vendor-charts': ['recharts'],
          // Animations — heavy, separate chunk
          'vendor-motion': ['framer-motion'],
          // UI icons
          'vendor-icons': ['lucide-react', 'react-icons'],
          // Auth
          'vendor-auth': ['@react-oauth/google'],
          // Utilities
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'lodash'],
        },
        // Hash-based file names for cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk warning limit slightly (recharts is large by design)
    chunkSizeWarningLimit: 700,
    // Enable source map only for prod debugging if needed (disable for fastest load)
    sourcemap: false,
  },
  // Optimize dev server
  server: {
    hmr: true,
  },
  // Optimize dependency pre-bundling
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
