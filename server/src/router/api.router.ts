import morgan from 'morgan'
import { Router } from "express";
import AuthRouter from './auth.router'

const router = Router()

router.use(morgan('combined'))
router.use('/auth', AuthRouter)

export default router
