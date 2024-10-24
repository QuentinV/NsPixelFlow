import { defineConfig } from 'vite'
import glslify from 'rollup-plugin-glslify'
import * as path from 'path'

export default defineConfig({
  root: '',
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        demo: path.resolve(__dirname, './index.html'),
      },
    },
  },
  server: {
    host: true,
    port: 8586
  },
  plugins: [glslify()],
})
