import ServerConfig from './server.config'
import JwtConfig from './jwt.config'
import UploadConfig from './upload.config'
import FrontendConfig from './frontend.config'
import EnvironmentConfig from './environment.config'

const config = {
  environment: EnvironmentConfig,
  frontend: FrontendConfig,
  jwt: JwtConfig,
  server: ServerConfig,
  upload: UploadConfig
}

export default config
