/// <reference types="vitest/config" />
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import viteCompression from 'vite-plugin-compression';

function resolveBootstrapUrl(): string {
  const envApi = process.env.VITE_API_URL?.trim();
  if (envApi) {
    return `${envApi.replace(/\/$/, '')}/content/bootstrap`;
  }
  return '/api/v1/content/bootstrap';
}

function requireProductionApiUrlPlugin(): Plugin {
  return {
    name: 'require-production-api-url',
    config(_config, { command, mode }) {
      if (command === 'build' && mode === 'production' && !process.env.VITE_API_URL?.trim()) {
        throw new Error(
          'VITE_API_URL is required for production builds. Copy .env.production.example to .env.production.',
        );
      }
    },
  };
}

function injectBootstrapPrefetchPlugin(): Plugin {
  return {
    name: 'inject-bootstrap-prefetch-url',
    transformIndexHtml(html, ctx) {
      const isProdBuild = ctx.server === undefined && process.env.NODE_ENV === 'production';
      const bootstrapUrl = isProdBuild ? resolveBootstrapUrl() : '/api/v1/content/bootstrap';
      return html.replace("fetch('/api/v1/content/bootstrap'", `fetch('${bootstrapUrl}'`);
    },
  };
}

function injectCmsBootstrapIntoHtml(html: string, payload: unknown): string {
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  const tag = `<script id="cms-bootstrap" type="application/json">${json}</script>`;
  const withoutExisting = html.replace(
    /\s*<script id="cms-bootstrap" type="application\/json">[\s\S]*?<\/script>/,
    '',
  );
  return withoutExisting.replace('</head>', `    ${tag}\n  </head>`);
}

function cmsBootstrapInjectPlugin(): Plugin {
  const bootstrapPath = resolve(__dirname, 'public/cms-bootstrap.json');

  return {
    name: 'cms-bootstrap-inject',
    transformIndexHtml(html) {
      if (!existsSync(bootstrapPath)) return html;
      try {
        const payload = JSON.parse(readFileSync(bootstrapPath, 'utf8'));
        return injectCmsBootstrapIntoHtml(html, payload);
      } catch {
        return html;
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    },
  } as import('vite').UserConfig['resolve'],
  plugins: [
    requireProductionApiUrlPlugin(),
    injectBootstrapPrefetchPlugin(),
    cmsBootstrapInjectPlugin(),
    react(),
    tailwindcss(),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/media': 'http://localhost:3001',
      '/og': 'http://localhost:3001',
      '/sitemap.xml': 'http://localhost:3001',
      '/robots.txt': 'http://localhost:3001',
    },
  },
  preview: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/media': 'http://localhost:3001',
      '/og': 'http://localhost:3001',
      '/sitemap.xml': 'http://localhost:3001',
      '/robots.txt': 'http://localhost:3001',
    },
  },
  test: {
    environment: 'node',
  },
});
