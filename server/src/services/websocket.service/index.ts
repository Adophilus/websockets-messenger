import { Server } from 'socket.io'
import { ILogObj, Logger } from 'tslog'
import http from 'http'
import ChatWebsocket from './chat.websocket'
import TokenService from '../token.service'

export default (server: http.Server, parentLogger: Logger<ILogObj>) => {
  const io = new Server(server, {
    path: '/ws',
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  })

  const logger = parentLogger.getSubLogger({ name: 'WebSocketLogger' })

  io.use((socket, next) => {
    logger.info(`Auth token of ${socket.id}: ${socket.handshake.auth.token}`)
    if (TokenService.verifyToken(socket.handshake.auth.token))
      return next()
    logger.warn(`${socket.id} failed the authentication stage!`)
    socket.disconnect()
  })

  ChatWebsocket(io.of('/chat'), logger);

  return io
}
