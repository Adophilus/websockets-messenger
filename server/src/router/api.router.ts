import morgan from 'morgan'
import { Router } from "express";
import AuthRouter from './auth.router'

const ApiRouter = Router()

ApiRouter.use(morgan('combined'))

ApiRouter.use('/auth', AuthRouter)

export default ApiRouter
