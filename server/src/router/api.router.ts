import morgan from 'morgan'
import { Router } from "express";
import AuthRouter from './auth.router'
import UploadRouter from './upload.router'

const ApiRouter = Router()

ApiRouter.use(morgan('combined'))

ApiRouter.use('/auth', AuthRouter)
ApiRouter.use('/upload', UploadRouter)

export default ApiRouter
