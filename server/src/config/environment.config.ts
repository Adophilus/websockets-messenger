const EnvironmentConfig = {
  PRODUCTION: process.env.NODE_ENV === 'production',
  DEVELOPMENT: process.env.NODE_ENV === 'development'
}

export default EnvironmentConfig
