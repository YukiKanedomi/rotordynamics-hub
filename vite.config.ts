import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages のプロジェクトページはサブパス配信のため base を固定する。
// https://yukikanedomi.github.io/rotordynamics-hub/
export default defineConfig({
  base: '/rotordynamics-hub/',
  plugins: [react()],
})
