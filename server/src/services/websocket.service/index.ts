import { Server } from 'socket.io'
import { ILogObj, Logger } from 'tslog'
import http from 'http'
import ChatWebsocket from './chat.websocket'

export default (server: http.Server, parentLogger: Logger<ILogObj>) => {
  const io = new Server(server, {
    path: '/ws',
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    },
    maxHttpBufferSize: 10 * 1024 * 1024
  })

  const logger = parentLogger.getSubLogger({ name: 'WebSocketLogger' })


  return {
    chat: ChatWebsocket(io.of('/chat'), logger)
  }
}
