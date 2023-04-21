import { Namespace } from 'socket.io'
import { ILogObj, Logger } from 'tslog'
import { prisma } from '../database.service'
import { Media, UserPolicy, WebSocketMessage } from '../../types'
import TokenService from '../token.service'
import StorageService from '../storage.service'
import UserRegistry, { UserDetails } from './user-registry.service'
import NotificationsService, { WaitingEvent } from './notifications.service'

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
  const notificationsService = new NotificationsService({ io, logger })
  const userRegistry = new UserRegistry({ notificationsService, logger })

  io.use((socket, next) => {
    const tokenData = TokenService.verifyToken(socket.handshake.auth.token)
    if (tokenData != null) {
      socket.handshake.auth.tokenData = {
        ...tokenData,
        policies: []
      }
      next()
      return
    }

    socket.handshake.auth.tokenData = {
      policies: [UserPolicy.INVALID_AUTH]
    }
    next()
  })

  io.on('connection', (socket) => {
    if (socket.handshake.auth.tokenData.policies.includes(UserPolicy.INVALID_AUTH)) {
      socket.emit(WebSocketMessage.AUTH_FAILED)
      socket.disconnect(true)
      return
    }

    let userDetails = new UserDetails({
      username: socket.handshake.auth.tokenData.username,
      sid: socket.id
    })
    userRegistry.registerUser(userDetails)

    socket.on(WebSocketMessage.FETCH_USERS, async (_, cb) => {
      logger.trace(`${userDetails} wishes to retrieve all users`)

      const dbUsers = await prisma.user.findMany()
      cb({
        users: dbUsers.filter(user => user.username !== userDetails.username)
      })
    })

    socket.on(WebSocketMessage.FETCH_UNREAD_CHATS_COUNT, async ({ user }: { user: string }, cb) => {
      logger.trace(`${userDetails} wishes to retrieve the number of unread messages with ${user}`)

      const unreadChatsCount = await getUnreadMessagesBetween({ sender: user, recipient: userDetails.username })
      cb({ unreadChatsCount })
    })

    socket.on(WebSocketMessage.FETCH_CONVERSATION_WITH_USER, async ({ user }: { user: string }, cb) => {
      const conversationLength = 50 // TODO: implement logic for getting last ${conversationLength} conversations

      logger.trace(`${userDetails} wishes to retrieve last ${conversationLength} conversation with ${user}`)

      const chats = await prisma.message.findMany({
        where: {
          OR: [
            { AND: [{ senderUsername: userDetails.username }, { recipientUsername: user }] },
            { AND: [{ senderUsername: user }, { recipientUsername: userDetails.username }] }
          ]
        },
        take: 50,
        orderBy: {
          created_at: 'desc'
        }
      })

      cb({ chats })
    })

    socket.on(WebSocketMessage.WAIT_FOR_USER, async ({ user }: { user: string }) => {
      const dbUser = await prisma.user.findFirst({ where: { username: user } })
      if (!dbUser) return

      notificationsService.registerWaitingUser(user, userDetails)
      notificationsService.notifyWaitingUser(user, userDetails, WaitingEvent.ONLINE)
    })

    socket.on(WebSocketMessage.STOP_WAITING_FOR_USER, async ({ user }: { user: string }) => {
      const awaitedUser = await userRegistry.getUserByUsername(user)
      if (!awaitedUser) return
      notificationsService.unregisterWaitingUser(awaitedUser, userDetails)
    })

    socket.on(
      WebSocketMessage.SEND_MESSAGE,
      async ({ user, message, media }: { user: string; message: string, media: Media | null }, cb) => {
        const effectiveMessage = message.trimEnd()
        if (!effectiveMessage) return

        logger.trace(
          `{${userDetails}} sent ✉  '${effectiveMessage}' -> ${user}`
        )

        let mediaPath = !!media ? await StorageService.upload(media) : null

        const chat = await prisma.message.create({
          data: {
            recipientUsername: user,
            senderUsername: userDetails.username,
            message: effectiveMessage,
            has_read: false,
            media: mediaPath
          }
        })

        cb({ chat })

        const receiver = await userRegistry.getUserByUsername(user)
        if (!receiver) return

        io.to(receiver.sid).emit(WebSocketMessage.CHAT, { chat })
        io.to(receiver.sid).emit(WebSocketMessage.UNREAD_CHATS_COUNT, { user: receiver.username, unreadChatsCount: await getUnreadMessagesBetween({ sender: userDetails.username, recipient: receiver.username }) })
      }
    )

    socket.on(
      WebSocketMessage.READ_CHAT,
      async ({ id: chatId }: { id: string }, cb) => {
        const id = parseInt(chatId)
        const chat = await prisma.message.findFirst({
          where: {
            id
          },
          include: {
            sender: true,
            recipient: true
          }
        })
        if (!chat) return
        if (chat.recipientUsername !== userDetails.username) return

        const receiver = await userRegistry.getUserByUsername(chat.senderUsername)

        logger.trace(
          `${userDetails.sid}:${userDetails.username} -> has read message '${chat.id}:${chat.message}'`
        )

        await prisma.message.update({
          where: {
            id
          },
          data: {
            has_read: true
          }
        })

        if (receiver) {
          io.to(receiver.sid).emit(WebSocketMessage.READ_CHAT, { id: chat.id, user: userDetails.username })
          io.to(receiver.sid).emit(WebSocketMessage.UNREAD_CHATS_COUNT, { user: receiver.username, unreadChatsCount: await getUnreadMessagesBetween({ sender: userDetails.username, recipient: receiver.username }) })
        }
        cb()
      })

    socket.on(WebSocketMessage.DELETE_CHAT, async ({ id }: { id: number }, cb) => {
      logger.trace(`${userDetails} wishes to delete chat with id ${id}`)

      const chat = await prisma.message.findFirst({ where: { id, senderUsername: userDetails.username } })

      if (!chat) return cb()

      const receiver = await userRegistry.getUserByUsername(chat.recipientUsername)

      await prisma.message.delete({ where: { id } })

      if (receiver)
        io.to(receiver.sid).emit(WebSocketMessage.DELETE_CHAT, { id })
      cb()
    })

    socket.on('disconnect', () => {
      logger.info(`${userDetails} has disconnected`)

      notificationsService.unregisterWaitingUserFromAll(userDetails)
      userRegistry.unregisterUser(userDetails)
    })
  })

  return io
}
