import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'
import { mkdirSync } from 'node:fs'

// 复用 esbuild 临时目录重定向（避免 Windows Access is denied）
const tmpDir = fileURLToPath(new URL('./.tmp', import.meta.url))
mkdirSync(tmpDir, { recursive: true })
process.env.TMP = tmpDir
process.env.TEMP = tmpDir

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts']
  }
})
