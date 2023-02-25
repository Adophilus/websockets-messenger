import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import { Logger } from 'tslog'
import config from './config'

const app = express()
const logger = new Logger()

app.use(cors())
app.use(morgan('full'))
app.use(bodyParser.urlencoded({ extended: true }))

const start = () => {
  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`)
  })
}

export { app, start }
