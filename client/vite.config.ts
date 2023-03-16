import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const websocketURI = env.VITE_WEBSOCKET_URI
  const apiURI = env.VITE_API_URI

  return {
    build: {
      outDir: 'build'
    },
    server: {
      proxy: {
        '/chat': {
          target: websocketURI,
          ws: true
        },
        '/api': {
          target: apiURI
        }
      }
    }
  }
})
