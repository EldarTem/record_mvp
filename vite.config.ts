// vite.config.ts
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { existsSync, readFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { fileURLToPath, URL } from 'node:url';

const certsDir = fileURLToPath(new URL('./.certs', import.meta.url));
const keyPath = `${certsDir}/key.pem`;
const certPath = `${certsDir}/cert.pem`;
const useHttps = existsSync(keyPath) && existsSync(certPath);

function lanIps(): string[] {
  const ips: string[] = [];
  for (const list of Object.values(networkInterfaces())) {
    for (const net of list ?? []) {
      if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
    }
  }
  return ips;
}

/** Serves self-signed cert for phone install + prints LAN HTTPS URLs. */
function httpsDevHelper(): Plugin {
  return {
    name: 'https-dev-helper',
    configureServer(server) {
      server.middlewares.use('/dev-cert.pem', (_req, res) => {
        if (!existsSync(certPath)) {
          res.statusCode = 404;
          res.end('No cert. Run: npm run certs');
          return;
        }
        res.setHeader('Content-Type', 'application/x-pem-file');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="myturn-dev.pem"',
        );
        res.end(readFileSync(certPath));
      });

      if (!useHttps) return;

      const printUrls = () => {
        const port = server.config.server.port ?? 5173;
        const ips = lanIps();
        console.log('\n  HTTPS phone testing (same Wi‑Fi):');
        for (const ip of ips) {
          console.log(`  ➜  Phone:   https://${ip}:${port}/`);
        }
        if (ips[0]) {
          console.log(`  ➜  Cert:    https://${ips[0]}:${port}/dev-cert.pem`);
        }
        console.log(
          '  Accept the certificate warning, then install / Add to Home Screen.\n',
        );
      };

      server.httpServer?.once('listening', printUrls);
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    httpsDevHelper(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon_myTurn.svg',
        'icons/apple-touch-icon.png',
        'icons/icon.svg',
      ],
      manifest: {
        name: 'Моя очередь',
        short_name: 'Очередь',
        description: 'Запись и управление очередью',
        theme_color: '#ff9a62',
        background_color: '#ff9a62',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'ru',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: 'icons/pwa-192-v2.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/pwa-512-v2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/maskable-512-v2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    https: useHttps
      ? {
          key: readFileSync(keyPath),
          cert: readFileSync(certPath),
        }
      : undefined,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    https: useHttps
      ? {
          key: readFileSync(keyPath),
          cert: readFileSync(certPath),
        }
      : undefined,
  },
});
