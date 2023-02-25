import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { Logger } from 'tslog'

dotenv.config()

const app = express()
const logger = new Logger()
const config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 5000
}

app.use(cors())
app.use(morgan('full'))
app.use(bodyParser.urlencoded({ extended: true }))

const start = () => {
  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`)
  })
}

export { app, start }
