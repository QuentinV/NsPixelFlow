import { defineConfig } from 'vite'
import glslify from 'rollup-plugin-glslify'

export default defineConfig({
  root: '',
  base: './',
  build: {
    outDir: 'dist'
  },
   optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  server: {
    host: true,
    port: 3000,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  plugins: [glslify()],
})
