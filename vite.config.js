import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' → 所有资源用相对路径，可直接部署到任意子路径（GitHub Pages 项目站 / Netlify / Vercel）
export default defineConfig({
  plugins: [react()],
  base: './'
});
