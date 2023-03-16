import { Router, Application } from "express";
import AuthRouter from './auth.router'

export default (app: Application) => {
  const router = Router()
  router.use('/auth', AuthRouter)

  app.use('/', Router)
}

