import { Router } from 'express'
import * as AuthController from '../controllers/auth.controller'
import * as AuthMiddleware from '../middleware/auth.middleware'

const AuthRouter = Router()

AuthRouter.post('/register', ...AuthMiddleware.register, AuthController.register)
AuthRouter.post('/login', ...AuthMiddleware.login, AuthController.login)

export default AuthRouter
