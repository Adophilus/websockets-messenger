import { Namespace } from "socket.io";
import { prisma } from '../database.service'
import { ILogObj, Logger } from "tslog";
import { TUserDetails, WebSocketMessage } from "../../types";
import { UserDetails } from "./user-registry.service";

export enum WaitingEvent {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

export class NotificationsService {
  declare private io: Namespace
  declare private logger: Logger<ILogObj>

  constructor({ io, logger }: { io: Namespace, logger: Logger<ILogObj> }) {
    this.io = io
    this.logger = logger.getSubLogger({ name: 'NotificationsServiceLogger' })
    prisma.awaitingUser.deleteMany().then(() => this.logger.info('Deleted all awaiting users')).catch(this.logger.warn)
  }

  async registerWaitingUser(awaitedUser: string, waitingUser: TUserDetails) {
    const awaitingUser = await this.getWaitingUser(awaitedUser, waitingUser)
    if (awaitingUser) return

    await prisma.awaitingUser.create({
      data: {
        awaitedUserUsername: awaitedUser,
        waitingUserUsername: waitingUser.username,
        sid: waitingUser.sid
      }
    })

    this.logger.trace(`${waitingUser} wants to be alerted when ${awaitedUser} comes online`)
  }

  async unregisterWaitingUser(awaitedUser: string, waitingUser: TUserDetails) {
    const awaitingUser = await this.getWaitingUser(awaitedUser, waitingUser)
    if (!awaitingUser) return

    await prisma.awaitingUser.deleteMany({
      where: {
        awaitedUserUsername: awaitedUser,
        waitingUserUsername: waitingUser.username,
        sid: waitingUser.sid
      }
    })

    this.logger.trace(`${waitingUser} no longer wants to be alerted when ${awaitedUser} comes online`)
  }

  async unregisterWaitingUserFromAll(waitingUser: TUserDetails) {
    await prisma.awaitingUser.deleteMany({
      where: {
        waitingUserUsername: waitingUser.username
      }
    })
  }

  async getWaitingUser(awaitedUser: string, waitingUser: TUserDetails) {
    return await prisma.awaitingUser.findFirst({
      where: {
        awaitedUserUsername: awaitedUser,
        waitingUserUsername: waitingUser.username
      }
    })
  }

  async notifyWaitingUser(awaitedUser: string, waitingUser: TUserDetails, event: WaitingEvent) {
    let messagingEvent = WebSocketMessage.USER_ONLINE
    switch (event) {
      case WaitingEvent.ONLINE:
        messagingEvent = WebSocketMessage.USER_ONLINE
        break
      case WaitingEvent.OFFLINE:
        messagingEvent = WebSocketMessage.USER_OFFLINE
        break
    }
    this.logger.trace(`${waitingUser} is going to be alerted because ${awaitedUser} has come online`)
    this.io.to(waitingUser.sid).emit(messagingEvent, { user: awaitedUser })
  }

  async notifyWaitingUsers(awaitedUser: string, event: WaitingEvent) {
    const waitingUsers = await prisma.awaitingUser.findMany({
      where: {
        awaitedUserUsername: awaitedUser
      }
    })
    if (!waitingUsers) return

    this.logger.trace(`All waiting users are going to be alerted because ${awaitedUser} has come online`)
    for (const waitingUser of waitingUsers) {
      this.notifyWaitingUser(awaitedUser, new UserDetails({ username: waitingUser.waitingUserUsername, sid: waitingUser.sid }), event)
    }
  }
}

export default NotificationsService
