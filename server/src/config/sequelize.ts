import { Sequelize } from 'sequelize-typescript'
import config from '.'
import { Message } from '../models'
import { Logger } from 'tslog'

export default {
  init() {
    const logger = new Logger()
    logger.info(config)

    return new Sequelize(
      config.db.uri,
      config.db.username,
      config.db.password,
      {
        storage: config.db.path,
        dialect: config.db.dialect,
        models: [Message],
        logging: (msg) => logger.debug(msg)
      }
    )
  }
}
