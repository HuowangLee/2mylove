import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // GitHub Pages 常见部署在子路径（/repo/）。默认用相对路径 `./` 更省心；
    // 也可以通过 .env.production 里设置 VITE_BASE=/你的仓库名/ 来精确控制。
    base: env.VITE_BASE ?? './',
    plugins: [react()],
  }
})
