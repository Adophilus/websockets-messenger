import { Router } from "express";
import AssetsRouter from './assets.router'
import AuthRouter from './auth.router'

const router = Router()

router.use('/', AssetsRouter)
router.use('/auth', AuthRouter)

export default router
