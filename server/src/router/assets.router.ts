import express, { Router } from 'express'
import routes from '../../../client/src/routes'
import path from 'path'
import config from '@/config'

const AssetsRouter = Router()

AssetsRouter.use(express.static(path.resolve(config.frontend.build)))
AssetsRouter.use(`/${config.upload.path}`, express.static(path.resolve(config.upload.path)))

AssetsRouter.get(routes, express.static(path.join(path.resolve(config.frontend.build), config.frontend.main)))

export default AssetsRouter
