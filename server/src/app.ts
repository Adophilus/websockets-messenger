import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { ILogObj, Logger } from 'tslog'
import http from 'http'
import config from './config'
import WebSocketService from './services/websocket.service'
import DatabaseService from './services/database.service'
import LoggerMiddleware from './middleware/logger.middleware'
import WebSocketMiddleware from './middleware/websocket.middleware'
import ErrorHandlerMiddleware from './middleware/error-handler.middleware'
import router from './router'

const app = express()
const server = http.createServer(app)
const logger = new Logger<ILogObj>()

const websocketService = WebSocketService(server, logger)

async function bootstrap() {
  // setup middleware (core)
  app.use(cors())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())

  // setup middleware
  app.use(LoggerMiddleware(logger))
  app.use(WebSocketMiddleware(websocketService))

  // setup routes
  app.use('/', router)

  // setup middleware (error handler)
  app.use(ErrorHandlerMiddleware)
}

async function start() {
  try {
    bootstrap()
    logger.info('Initializing database')

    DatabaseService.init()
    server.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port}`)
    })
  } catch (err) {
    logger.fatal(err)
  }
}

export { app, start }
