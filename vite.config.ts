import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { mkdirSync } from 'node:fs'

// esbuild 在系统临时目录删除临时文件偶发「Access is denied」，
// 将临时目录重定向到项目内 .tmp 规避（对 dev / build 同时生效）。
const tmpDir = fileURLToPath(new URL('./.tmp', import.meta.url))
mkdirSync(tmpDir, { recursive: true })
process.env.TMP = tmpDir
process.env.TEMP = tmpDir

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    watch: {
      // .tmp 用于 esbuild 临时目录与本地调试产物，避免 watcher 扫描（Chrome profile 会锁文件导致 EBUSY）
      ignored: ['**/.tmp/**']
    },
    proxy: {
      // 后端接口统一走 /api 前缀，开发期代理到后端服务
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          tdesign: ['tdesign-vue-next'],
          'vue-vendor': ['vue', 'vue-router', 'pinia']
        }
      }
    }
  }
})
