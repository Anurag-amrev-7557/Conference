/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    },
  } as import('vite').UserConfig['resolve'],
  plugins: [
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
})
