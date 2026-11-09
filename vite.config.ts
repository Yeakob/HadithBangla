import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Single self-contained HTML (JS + CSS inlined). The large Hadith data lives in
// public/data and is fetched on demand with relative URLs.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: { target: 'es2020', chunkSizeWarningLimit: 4000, assetsInlineLimit: 100000000 },
})
