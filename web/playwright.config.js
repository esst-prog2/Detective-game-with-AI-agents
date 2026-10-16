import { defineConfig } from '@playwright/test';
const apiPort = process.env.E2E_API_PORT || '3001';
const isolated = process.env.E2E_ISOLATED === '1';
const baseURL = isolated ? 'http://localhost:5173' : 'http://127.0.0.1:5173';
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, timeout: 30000,
  expect: { timeout: 5000 }, reporter: 'list',
  use: { baseURL, browserName: 'chromium', trace: 'off', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: [
    { command: 'node e2e/offline-api.mjs', port: Number(apiPort), env: { API_PORT: apiPort }, reuseExistingServer: false },
    { command: isolated ? 'npm run dev -- --host ::1' : 'npm run dev', url: isolated ? 'http://[::1]:5173' : baseURL, env: { API_PORT: apiPort }, reuseExistingServer: false },
  ],
});
