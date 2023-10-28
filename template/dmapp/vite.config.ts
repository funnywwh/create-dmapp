import { defineConfig } from 'vite'
import packageJson from './package.json'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base:`/dmapp/${packageJson.dmappId}`,
  server:{
    host:"0.0.0.0",
  },
  plugins: [vue()],
})
