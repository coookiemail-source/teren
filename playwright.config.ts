import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', timeout: 120000, fullyParallel: false, workers: 1,
  use: { baseURL: process.env.QA_BASE_URL || 'http://127.0.0.1:4322', channel: process.env.QA_BROWSER_CHANNEL || 'msedge', reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } },
  reporter: 'list'
});
