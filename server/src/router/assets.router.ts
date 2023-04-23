import express, { Router } from 'express'
import routes from '../../../client/src/routes'

const router = Router()

router.get(routes, express.static('./frontend/index.html'))

export default router
