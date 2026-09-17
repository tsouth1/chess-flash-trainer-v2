import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves project sites from /<repo-name>/, so the base path
// must match the repository name. Update this if the repo is renamed.
export default defineConfig({
  base: '/chess-flash-trainer-v2/',
  plugins: [react()],
})
