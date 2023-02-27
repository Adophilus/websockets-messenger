import dotenv from 'dotenv'
import ServerConfig from './server.config'

dotenv.config()

const config = {
  server: ServerConfig
}

export default config
