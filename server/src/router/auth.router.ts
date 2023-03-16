import { Router } from 'express'
import * as AuthController from '../controllers/auth.controller'
import * as AuthMiddleware from '../middleware/auth.middleware'

const router = Router()

router.post('/register', ...AuthMiddleware.register, AuthController.register)
router.post('/login', ...AuthMiddleware.login, AuthController.login)

export default router
