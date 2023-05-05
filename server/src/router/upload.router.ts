import AuthMiddleware from "@/middleware/auth.middleware"
import { Router } from "express"
import UploadController from '../controllers/upload.controller'
import UploadMiddleware from '../middleware/upload.middleware'

const UploadRouter = Router()
UploadRouter.use(AuthMiddleware.isAuthenticated)

UploadRouter.post('/files', UploadMiddleware.uploadFiles, UploadController.uploadFiles)

export default UploadRouter
