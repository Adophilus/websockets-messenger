import dotenv from 'dotenv'
import DatabaseConfig from './database.config'
import ServerConfig from './server.config'

dotenv.config()

const config = {
  db: DatabaseConfig,
  server: ServerConfig
}

export default config
