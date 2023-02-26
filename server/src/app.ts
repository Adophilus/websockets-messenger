import path from 'path'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import { Logger } from 'tslog'
import http from 'http'
import config from './config'
import WebSocketService from './services/websocket.service'

const app = express()
const server = http.createServer(app)
const logger = new Logger()

app.use('/', express.static(path.join('./frontend')))
app.use(cors())
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({ extended: true }))

const io = WebSocketService(server)

const start = () => {
  server.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`)
  })
}

export { app, io, start }
