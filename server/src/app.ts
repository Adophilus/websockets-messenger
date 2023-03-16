import path from 'path'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import { Logger } from 'tslog'
import http from 'http'
import config from './config'
import WebSocketService from './services/websocket.service'
import DatabaseService from './services/database.service'
import LoggerMiddleware from './middleware/logger.middleware'
import Router from './router'
import { TLog } from './types'

const app = express()
const server = http.createServer(app)
const logger = new Logger<TLog>()

app.use(express.static(path.resolve('../client/build')))
app.use(cors())
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(LoggerMiddleware(logger))

const io = WebSocketService(server)
Router(app)

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
