import { Server } from 'socket.io'
import { Logger } from 'tslog'
import http from 'http'

interface IMessage {
  sender: string
  recepient: string
  message: string
  image: string
  has_read: boolean
}

const users: { [k: string]: string } = {}

const getUsernameBySid = (sid: string) => {
  for (const [k, v] of Object.entries(users)) {
    if (v === sid) return k
  }
}

export default (server: http.Server) => {
  const io = new Server(server, {
    path: '/chat',
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  })
  const logger = new Logger()

  io.on('connection', (socket) => {
    let userDetails = {
      username: ''
    }

    logger.info(`New connection from ${socket.id}`)

    socket.on('chat-register', ({ username }: { username: string }) => {
      if (users.username != null) return false

      const chain = io
      Object.values(users).forEach((sid) => chain.to(sid))
      chain.emit('user-joined', { username })

      logger.info(`${socket.id} registered as ${username}`)
      users[username] = socket.id
      userDetails.username = username
    })

    socket.on('chat-message', ({ recepient, message }: { recepient: string, message: string }) => {
      logger.info(
        `Received new messge from ${socket.id}:${userDetails.username} -> ${recepient}: '${message}'`
      )

      if (!users[recepient]) return false

      const chain = io
      Object.values(users).forEach((sid) => socket.id !== sid ? chain.to(sid) : null)
      chain.emit('user-joined', { recepient, message, sender: getUsernameBySid(socket.id), has_read: false, image: '' })
    })

    socket.on('disconnect', () => {
      logger.info(`${socket.id} has disconnected`)
      Object.entries(users).forEach(([k, v]) => {
        if (v === socket.id) delete users[k]
      })
    })
  })

  return io
}
