import { Namespace } from 'socket.io'
import { ILogObj, Logger } from 'tslog'
import { prisma } from '../database.service'
import { TUserDetails, WebSocketMessage } from '../../types'
import TokenService from '../token.service'

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

export default (io: Namespace, parentLogger: Logger<ILogObj>) => {
  const logger = parentLogger.getSubLogger({ name: 'ChatWebSocketLogger' })

  io.use((socket, next) => {
    logger.info(`Auth token of ${socket.id}: ${socket.handshake.auth.token}`)
    if (TokenService.verifyToken(socket.handshake.auth.token))
      return next()
    logger.info(`${socket.id} failed the authentication stage!`)
    socket.disconnect()
  })

  io.on('connection', (socket) => {
    let userDetails: TUserDetails

    logger.info(`New connection from ${socket.id}`)
    logger.info(`Socket handshake:`)
    logger.info(socket.handshake)

    logger.info(`${socket.id} passed the authentication stage!`)

    socket.on('register', ({ user }: { user: string }, cb) => {
      if (getUserByUsername(user)) return false

      users.forEach((user) => {
        io.to(user.sid).emit(WebSocketMessage.USER_JOIN, { user: user.username })
      })

      logger.info(`${socket.id} registered as ${user}`)
      userDetails = { username: user, sid: socket.id }
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
          unreadChatsCount: await getUnreadMessagesBetween({ sender: user.username, recipient: sender.username })
        })))
      })
    })

    socket.on(WebSocketMessage.FETCH_UNREAD_CHATS_COUNT, async ({ user }: { user: string }, cb) => {
      const sender = getUserBySid(socket.id)
      const recipient = getUserByUsername(user)

      if (!sender || !recipient) return false
      logger.info(`${sender.sid}:${sender.username} wishes to retrieve the number of unread messages with ${recipient.sid}:${recipient.username}`)

      const unreadChatsCount = await getUnreadMessagesBetween({ sender: recipient.username, recipient: sender.username })
      cb({ unreadChatsCount })
    })

    socket.on(WebSocketMessage.FETCH_CONVERSATION_WITH_USER, async ({ user }: { user: string }, cb) => {
      const sender = getUserBySid(socket.id)
      const conversationLength = 50 // TODO: implement logic for getting last ${conversationLength} conversations

      if (!sender) return false
      logger.info(`${sender.sid}:${sender.username} wishes to retrieve last ${conversationLength} conversation with ${user}`)

      const chats = await prisma.message.findMany({
        where: {
          OR: [
            { AND: [{ senderUsername: sender.username }, { recipientUsername: user }] },
            { AND: [{ senderUsername: user }, { recipientUsername: sender.username }] }
          ]
        },
        take: 50,
        orderBy: {
          created_at: 'desc'
        }
      })

      cb({ chats })
    })

    socket.on(
      WebSocketMessage.SEND_CHAT,
      async ({ user, message }: { user: string; message: string }, cb) => {
        const receiver = getUserByUsername(user)
        const sender = getUserBySid(socket.id)

        if (!receiver || !sender) return false

        logger.info(
          `received new messge from ${sender.sid}:${userDetails.username} -> ${receiver.sid}:${receiver.username}: '${message}'`
        )

        const chat = await prisma.message.create({
          data: {
            recipientUsername: user,
            senderUsername: sender.username,
            message,
            has_read: false
          }
        })

        io.to(receiver.sid).emit(WebSocketMessage.CHAT, { chat })
        io.to(receiver.sid).emit(WebSocketMessage.UNREAD_CHATS_COUNT, { user: receiver.username, unreadChatsCount: await getUnreadMessagesBetween({ sender: sender.username, recipient: receiver.username }) })
        cb({ chat })
      }
    )

    socket.on(
      WebSocketMessage.READ_CHAT,
      async ({ id: chatId }: { id: string }, cb) => {
        const id = parseInt(chatId)
        const sender = getUserBySid(socket.id)
        const chat = await prisma.message.findFirst({
          where: {
            id
          },
          include: {
            sender: true,
            recipient: true
          }
        })
        if (!sender || !chat) return
        if (chat.recipientUsername !== sender.username) return

        const receiver = getUserByUsername(chat.senderUsername)

        logger.info(
          `${sender.sid}:${userDetails.username} -> has read message '${chat.id}:${chat.message}'`
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
          io.to(receiver.sid).emit(WebSocketMessage.READ_CHAT, { id: chat.id, user: sender.username })
        cb()
      }
    )

    socket.on('disconnect', () => {
      const sender = getUserBySid(socket.id)
      if (!sender) return false

      logger.info(`${sender.sid}:${sender.username} has disconnected`)

      users.forEach((user, index) => {
        if (user.sid === socket.id) users.splice(index, 1)
        else io.to(user.sid).emit(WebSocketMessage.USER_LEAVE, { user: sender.username })
      })
    })
  })

  return io
}
