import { Router } from "express";
import AssetsRouter from './assets.router'
import ApiRouter from './api.router'

const router = Router()

router.use('/', AssetsRouter)
router.use('/api', ApiRouter)

export default router
