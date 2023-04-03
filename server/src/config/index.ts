import ServerConfig from './server.config'
import JwtConfig from './jwt.config'
import UploadConfig from './upload.config'

const config = {
  jwt: JwtConfig,
  server: ServerConfig,
  upload: UploadConfig
}

export default config
