import dotenv from 'dotenv'
import ServerConfig from './server.config'
import JwtConfig from './jwt.config'

dotenv.config()

const config = {
  jwt: JwtConfig,
  server: ServerConfig
}

export default config
