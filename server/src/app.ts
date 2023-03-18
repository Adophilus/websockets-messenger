import * as dotenv from 'dotenv'
dotenv.config()

import path from 'path'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import { ILogObj, Logger } from 'tslog'
import http from 'http'
import config from './config'
import WebSocketService from './services/websocket.service'
import DatabaseService from './services/database.service'
import LoggerMiddleware from './middleware/logger.middleware'
import router from './router'

const app = express()
const server = http.createServer(app)
const logger = new Logger<ILogObj>()

app.use(express.static(path.resolve('../client/build')))
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use(LoggerMiddleware(logger))
app.use('/api', morgan('combined'))
app.use('/api', router)

const io = WebSocketService(server, logger)

const start = async () => {
  try {
    logger.info('Initializing database')

    DatabaseService.init()
    server.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port}`)
    })
  } catch (err) {
    logger.fatal(err)
  }
}

export { app, io, start }
