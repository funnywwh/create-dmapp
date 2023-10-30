import { ConfigEnv, defineConfig } from 'vite'
import packageJson from './package.json'
import vue from '@vitejs/plugin-vue'


// https://vitejs.dev/config/
export default defineConfig(async (env: ConfigEnv) => {
  let base = `/dmapp/${packageJson.dmappId}`
  let port = 9090
  if (env.mode == 'development') {
    base += `?debug=true&port=${port}`
  }
  console.log(env,base)
  return {
    base: base,
    clearScreen:false,
    server: {
      host: "0.0.0.0",
      port: port
    },
    plugins: [vue()],
  }
})
