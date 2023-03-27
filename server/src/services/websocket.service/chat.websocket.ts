import { Namespace } from 'socket.io'
import { ILogObj, Logger } from 'tslog'
import { prisma } from '../database.service'
import { UserPolicy, TUserDetails, WebSocketMessage } from '../../types'
import TokenService from '../token.service'

let users: TUserDetails[] = []

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

class UserDetails {
  declare public username: string
  declare public sid: string

  constructor({ username, sid }: { username: string, sid: string }) {
    this.username = username
    this.sid = sid
  }

  toString() {
    return `{${this.username}}`
  }
}

export default (io: Namespace, parentLogger: Logger<ILogObj>) => {
  const logger = parentLogger.getSubLogger({ name: 'ChatWebSocketLogger' })

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

    logger.info(`${socket.id} registered as ${userDetails.username}`)

    const userAlreadyJoined = users.find(user => user.username === userDetails.username)
    if (userAlreadyJoined)
      return socket.disconnect(true)

    users.forEach((user) => io.to(user.sid).emit(WebSocketMessage.USER_JOIN, { user: userDetails.username }))
    users.push(userDetails)

    socket.on(WebSocketMessage.FETCH_USERS, async (_, cb) => {
      logger.trace(`${userDetails} wishes to retrieve all online users`)

      cb({
        users: users.filter(user => user.username !== userDetails.username)
          .map((user) => ({
            username: user.username,
          }))
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

    socket.on(
      WebSocketMessage.SEND_MESSAGE,
      async ({ user, message }: { user: string; message: string }, cb) => {
        const effectiveMessage = message.trimEnd()
        if (!effectiveMessage) return

        logger.trace(
          `{${userDetails}} sent ✉  '${effectiveMessage}' -> ${user}`
        )

        const chat = await prisma.message.create({
          data: {
            recipientUsername: user,
            senderUsername: userDetails.username,
            message: effectiveMessage,
            has_read: false
          }
        })

        cb({ chat })

        const receiver = getUserByUsername(user)
        if (!receiver) return

        io.to(receiver.sid).emit(WebSocketMessage.CHAT, { chat })
        io.to(receiver.sid).emit(WebSocketMessage.UNREAD_CHATS_COUNT, { user: receiver.username, unreadChatsCount: await getUnreadMessagesBetween({ sender: userDetails.username, recipient: receiver.username }) })
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

        logger.trace(
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
      logger.info(`${userDetails} has disconnected`)

      users = users.filter(user => user.username !== userDetails.username)

      users.forEach((user) => {
        io.to(user.sid).emit(WebSocketMessage.USER_LEAVE, { user: userDetails.username })
      })
    })
  })

  return io
}
