import { Server } from 'socket.io'
import { Logger } from 'tslog'
import http from 'http'
import { prisma } from './database.service'

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

export enum WebSocketMessage {
  FETCH_USERS = "fetch-users",
  FETCH_CHATS_WITH_USER = "fetch-chats-with-user",
  FETCH_UNREAD_CHATS_COUNT = "fetch-unread-chats-count",
  UNREAD_CHATS_COUNT = "unread-chats-count",
  READ_CHAT = "read-chat",
  CHAT = "chat",
  SEND_CHAT = "send-chat",
  USER_JOIN = "user-join",
  USER_LEAVE = "user-leave"
}

const users: IUserDetails[] = []

const getUserBySid = (sid: string) => {
  return users.find((user) => user.sid === sid)
}

const getUserByUsername = (username: string) => {
  return users.find((user) => user.username === username)
}

const getUnreadMessagesBetween = async ({ sender, recepient }: { sender: string, recepient: string }) => {
  const aggregation = await prisma.messages.aggregate({
    where: {
      recepient,
      sender,
      has_read: false
    },
    _count: true
  })
  return aggregation._count
}

export default (server: http.Server) => {
  const io = new Server(server, {
    path: '/ws',
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  })
  const logger = new Logger()

  io.on('connection', (socket) => {
    let userDetails: IUserDetails

    logger.info(`New connection from ${socket.id}`)

    socket.on('register', ({ username }: { username: string }, cb) => {
      if (getUserByUsername(username)) return false

      users.forEach((user) => {
        io.to(user.sid).emit(WebSocketMessage.USER_JOIN, { username })
      })

      logger.info(`${socket.id} registered as ${username}`)
      userDetails = { username, sid: socket.id }
      users.push(userDetails)

      cb()
    })

    socket.on(WebSocketMessage.FETCH_USERS, async (_, cb) => {
      const sender = getUserBySid(socket.id)

      if (!sender) return false
      logger.info(`${sender.sid}:${sender.username} wishes to retrieve all online users`)

      cb({
        users: await Promise.all(users.map(async (user) => ({
          username: user.username,
          unreadMessagesCount: await getUnreadMessagesBetween({ sender: user.username, recepient: sender.username })
        })))
      })
    })

    socket.on(WebSocketMessage.FETCH_UNREAD_CHATS_COUNT, async ({ username }: { username: string }, cb) => {
      const sender = getUserBySid(socket.id)
      const recepient = getUserByUsername(username)

      if (!sender || !recepient) return false
      logger.info(`${sender.sid}:${sender.username} wishes to retrieve the number of unread messages with ${recepient.sid}:${recepient.username}`)

      const unreadMessagesCount = await getUnreadMessagesBetween({ sender: recepient.username, recepient: sender.username })
      cb({ unreadMessagesCount })
    })

    socket.on(WebSocketMessage.FETCH_CHATS_WITH_USER, async ({ recepient }: { recepient: string }, cb) => {
      const sender = getUserBySid(socket.id)

      if (!sender) return false
      logger.info(`${sender.sid}:${sender.username} wishes to retrieve all messages with ${recepient}`)

      const messages = await prisma.messages.findMany({
        where: {
          OR: [
            { AND: [{ sender: sender.username }, { recepient }] },
            { AND: [{ sender: recepient }, { recepient: sender.username }] }
          ]
        },
        take: 50,
        orderBy: {
          created_at: 'desc'
        }
      })

      cb({ messages })
    })

    socket.on(
      WebSocketMessage.SEND_CHAT,
      async ({ recepient, message }: { recepient: string; message: string }, cb) => {
        const receiver = getUserByUsername(recepient)
        const sender = getUserBySid(socket.id)

        if (!receiver || !sender) return false

        logger.info(
          `Received new messge from ${sender.sid}:${userDetails.username} -> ${receiver.sid}:${receiver.username}: '${message}'`
        )

        const messageObject = await prisma.messages.create({
          data: {
            recepient,
            sender: sender.username,
            message,
            has_read: false,
            image: ''
          }
        })

        io.to(receiver.sid).emit(WebSocketMessage.CHAT, messageObject)
        io.to(receiver.sid).emit(WebSocketMessage.UNREAD_CHATS_COUNT, { username: receiver.username, unreadMessagesCount: await getUnreadMessagesBetween({ sender: sender.username, recepient: receiver.username }) })
        cb({ message: messageObject })
      }
    )

    socket.on(
      WebSocketMessage.READ_CHAT,
      async ({ id: messageId }: { id: string }, cb) => {
        const id = parseInt(messageId)
        const sender = getUserBySid(socket.id)
        const message = await prisma.messages.findFirst({
          where: {
            id
          }
        })
        if (!sender || !message) return
        if (message.recepient !== sender.username) return

        const receiver = getUserByUsername(message.sender)

        logger.info(
          `${sender.sid}:${userDetails.username} -> has read message '${message.id}:${message.message}'`
        )

        await prisma.messages.update({
          where: {
            id
          },
          data: {
            has_read: true
          }
        })

        if (receiver)
          io.to(receiver.sid).emit(WebSocketMessage.READ_CHAT, { id: message.id })
        cb()
      }
    )

    socket.on('disconnect', () => {
      const sender = getUserBySid(socket.id)
      if (!sender) return false

      logger.info(`${sender.sid}:${sender.username} has disconnected`)

      users.forEach((user, index) => {
        if (user.sid === socket.id) users.splice(index, 1)
        else io.to(user.sid).emit(WebSocketMessage.USER_LEAVE, { username: sender.username })
      })
    })
  })

  return io
}
