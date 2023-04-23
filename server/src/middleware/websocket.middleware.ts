import { NextFunction, Request, Response } from 'express'
import WebSocketService from '../services/websocket.service'

export default function WebSocketMiddleware(websocketService: ReturnType<typeof WebSocketService>) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.locals.websocket = websocketService
    next()
  }
}
