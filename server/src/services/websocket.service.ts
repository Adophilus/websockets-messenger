import { Server } from 'socket.io'
import { Logger } from 'tslog'
import http from 'http'
import { prisma } from './database.service'
import { TUserDetails, WebSocketMessage } from '../types'


const users: TUserDetails[] = []

const getUserBySid = (sid: string) => {
  return users.find((user) => user.sid === sid)
}

const getUserByUsername = (username: string) => {
  return users.find((user) => user.username === username)
}

const getUnreadMessagesBetween = async ({ sender, recipient }: { sender: string, recipient: string }) => {
  const aggregation = await prisma.message.aggregate({
    where: {
      recipientUsername: recipient,
      senderUsername: sender,
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
    let userDetails: TUserDetails

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
          unreadMessagesCount: await getUnreadMessagesBetween({ sender: user.username, recipient: sender.username })
        })))
      })
    })

    socket.on(WebSocketMessage.FETCH_UNREAD_CHATS_COUNT, async ({ username }: { username: string }, cb) => {
      const sender = getUserBySid(socket.id)
      const recipient = getUserByUsername(username)

      if (!sender || !recipient) return false
      logger.info(`${sender.sid}:${sender.username} wishes to retrieve the number of unread messages with ${recipient.sid}:${recipient.username}`)

      const unreadMessagesCount = await getUnreadMessagesBetween({ sender: recipient.username, recipient: sender.username })
      cb({ unreadMessagesCount })
    })

    socket.on(WebSocketMessage.FETCH_CHATS_WITH_USER, async ({ recipient }: { recipient: string }, cb) => {
      const sender = getUserBySid(socket.id)

      if (!sender) return false
      logger.info(`${sender.sid}:${sender.username} wishes to retrieve all messages with ${recipient}`)

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { AND: [{ senderUsername: sender.username }, { recipientUsername: recipient }] },
            { AND: [{ senderUsername: recipient }, { recipientUsername: sender.username }] }
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
      async ({ recipient, message }: { recipient: string; message: string }, cb) => {
        const receiver = getUserByUsername(recipient)
        const sender = getUserBySid(socket.id)

        if (!receiver || !sender) return false

        logger.info(
          `received new messge from ${sender.sid}:${userDetails.username} -> ${receiver.sid}:${receiver.username}: '${message}'`
        )

        const messageObject = await prisma.message.create({
          data: {
            recipientUsername: recipient,
            senderUsername: sender.username,
            message,
            has_read: false
          }
        })

        io.to(receiver.sid).emit(WebSocketMessage.CHAT, messageObject)
        io.to(receiver.sid).emit(WebSocketMessage.UNREAD_CHATS_COUNT, { username: receiver.username, unreadMessagesCount: await getUnreadMessagesBetween({ sender: sender.username, recipient: receiver.username }) })
        cb({ message: messageObject })
      }
    )

    socket.on(
      WebSocketMessage.READ_CHAT,
      async ({ id: messageId }: { id: string }, cb) => {
        const id = parseInt(messageId)
        const sender = getUserBySid(socket.id)
        const message = await prisma.message.findFirst({
          where: {
            id
          },
          include: {
            sender: true,
            recipient: true
          }
        })
        if (!sender || !message) return
        if (message.recipientUsername !== sender.username) return

        const receiver = getUserByUsername(message.senderUsername)

        logger.info(
          `${sender.sid}:${userDetails.username} -> has read message '${message.id}:${message.message}'`
        )

        await prisma.message.update({
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
