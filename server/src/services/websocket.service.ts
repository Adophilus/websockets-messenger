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

interface IUserDetails {
  sid: string
  username: string
}

const users: IUserDetails[] = []

const getUserBySid = (sid: string) => {
  return users.find((user) => user.sid === sid)
}

const getUserByUsername = (username: string) => {
  return users.find((user) => user.username === username)
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
    let userDetails: IUserDetails

    logger.info(`New connection from ${socket.id}`)

    socket.on('chat-register', ({ username }: { username: string }) => {
      if (getUserByUsername(username)) return false

      users.forEach((user) => {
        io.to(user.sid).emit('user-joined', { username })
        io.to(socket.id).emit('existing-user', { username: user.username })
      })

      logger.info(`${socket.id} registered as ${username}`)
      userDetails = { username, sid: socket.id }
      users.push(userDetails)
    })

    socket.on(
      'chat-message',
      ({ recepient, message }: { recepient: string; message: string }) => {
        const receiver = getUserByUsername(recepient)
        const sender = getUserBySid(socket.id)

        if (!receiver || !sender) return false

        logger.info(
          `Received new messge from ${sender.sid}:${userDetails.username} -> ${receiver.sid}:${receiver.username}: '${message}'`
        )

        const messageObject = {
          recepient: receiver.username,
          message,
          sender: sender.username,
          has_read: false,
          image: ''
        }
        io.to(receiver.sid).to(sender.sid).emit('chat-message', messageObject)
      }
    )

    socket.on('disconnect', () => {
      const sender = getUserBySid(socket.id)
      if (!sender) return false

      logger.info(`${sender.sid}:${sender.username} has disconnected`)

      users.forEach((user, index) => {
        if (user.sid === socket.id) users.splice(index, 1)
        else io.to(user.sid).emit('user-left', { username: sender.username })
      })
    })
  })

  return io
}
