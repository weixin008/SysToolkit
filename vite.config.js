import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // 监听所有网络接口
    port: 10086,      // 指定端口为不常用的10086
    strictPort: true, // 如果端口被占用则报错
    open: false       // 不自动打开浏览器
  }
})