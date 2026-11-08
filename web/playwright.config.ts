import { defineConfig, devices } from '@playwright/test';

// e2e runs against production builds: mock mode on :4173, the demo build on :4174.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node node_modules/vite/bin/vite.js build && node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: false,
      timeout: 120_000,
      env: { VITE_API_MODE: 'mock', VITE_MOCK_LATENCY: '0' },
    },
    {
      command: 'node node_modules/vite/bin/vite.js build --mode demo && node node_modules/vite/bin/vite.js preview --mode demo --host 127.0.0.1 --port 4174 --strictPort',
      url: 'http://127.0.0.1:4174/demos/foodapp/',
      reuseExistingServer: false,
      timeout: 120_000,
      env: { VITE_MOCK_LATENCY: '0' },
    },
  ],
});
