import { createLogger, defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const proxy = { '/api': { target: `http://127.0.0.1:${process.env.API_PORT || '3001'}`, changeOrigin: true } };
const logger = createLogger();
const safeLogger = { ...logger, error(message, options) {
  // Vite's default proxy error includes the bearer URL and an internal stack.
  if (String(message).includes('http proxy error:')) logger.error('Investigation API unavailable. Start the local API and refresh.', { timestamp: true });
  else logger.error(message, options);
} };
export default defineConfig({
  root,
  customLogger: safeLogger,
  plugins: [react(), {
    name: 'web-import-boundary',
    generateBundle(_options, bundle) {
      const normalizedRoot = root.replaceAll('\\', '/').toLowerCase();
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        for (const id of Object.keys(chunk.modules)) {
          if (id.startsWith('\0')) continue;
          if (!id.replaceAll('\\', '/').toLowerCase().startsWith(normalizedRoot)) this.error('Build imports a module outside the isolated web package.');
        }
      }
    },
  }],
  server: { host: '127.0.0.1', port: 5173, strictPort: true, fs: { strict: true, allow: [root], deny: ['**/.env*', '**/*.{crt,pem}', '**/.git/**', '**/e2e/**', '**/scripts/**'] }, proxy },
  preview: { host: '127.0.0.1', port: 5173, strictPort: true, proxy },
  build: { sourcemap: false },
});
