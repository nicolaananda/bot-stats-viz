import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    https: {
      key: undefined,
      cert: undefined,
    },
    cors: true,
  },
  preview: {
    host: "::",
    port: 8080,
    https: {
      key: undefined,
      cert: undefined,
    },
    cors: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-avatar', '@radix-ui/react-progress', '@radix-ui/react-separator', '@radix-ui/react-slot', '@radix-ui/react-tooltip', '@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-aspect-ratio', '@radix-ui/react-checkbox', '@radix-ui/react-collapsible', '@radix-ui/react-context-menu', '@radix-ui/react-hover-card', '@radix-ui/react-label', '@radix-ui/react-menubar', '@radix-ui/react-navigation-menu', '@radix-ui/react-popover', '@radix-ui/react-radio-group', '@radix-ui/react-scroll-area', '@radix-ui/react-slider', '@radix-ui/react-switch', '@radix-ui/react-toggle', '@radix-ui/react-toggle-group'],
          'chart-vendor': ['recharts'],
          'query-vendor': ['@tanstack/react-query'],
          'utils-vendor': ['clsx', 'class-variance-authority', 'tailwind-merge', 'date-fns', 'lucide-react'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
