/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `vite build --mode demo` builds the static, mock-only showcase served at
// /demos/foodapp/ on the portfolio site (output: dist-demo/).
export default defineConfig(({ mode }) => {
  const demo = mode === 'demo';
  return {
    base: demo ? '/demos/foodapp/' : './',
    plugins: [react()],
    build: { outDir: demo ? 'dist-demo' : 'dist', sourcemap: false },
    define: { 'import.meta.env.VITE_DEMO': JSON.stringify(demo ? '1' : '') },
    server: {
      proxy: {
        '/api': process.env.VITE_PROXY_TARGET ?? 'http://127.0.0.1:8000',
        '/static': process.env.VITE_PROXY_TARGET ?? 'http://127.0.0.1:8000',
      },
    },
    test: { env: { VITE_MOCK_LATENCY: '0' }, environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'], setupFiles: ['src/test-setup.ts'] },
  };
});
