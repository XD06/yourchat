import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
    // 设置scss的api类型为modern-compiler
      css: {
        preprocessorOptions: {
          scss: {
            api: 'modern-compiler',
            additionalData: `@use "@/assets/styles/variables.scss" as *;`,
          }
        }
      },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  build: {
    // 构建优化
    minify: 'terser', // 使用terser进行更好的压缩
    terserOptions: {
      compress: {
        drop_console: true, // 移除console
        drop_debugger: true // 移除debugger
      }
    },
    rollupOptions: {
      output: {
        // 分包处理减小单个文件体积
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'], 
          'ui': ['element-plus'],
          'highlight': ['highlight.js', 'markdown-it']
        },
        // 静态资源分类打包
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // 启用gzip压缩
    brotliSize: false,
    chunkSizeWarningLimit: 2000, // 提高警告门槛
    // 生成静态资源的manifest文件
    manifest: true,
  },
  server: {
    port: 3000,
    open: true,
    cors: true
  }
})
