import { ILogObj, Logger } from "tslog";
import { TUserDetails } from "../../types";
import { prisma } from '../database.service'
import NotificationsService, { WaitingEvent } from "./notifications.service";

export class UserDetails implements TUserDetails {
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

export class UserRegistry {
  declare private logger: Logger<ILogObj>
  declare private notificationsService: NotificationsService

  constructor({ logger, notificationsService }: { logger: Logger<ILogObj>, notificationsService: NotificationsService }) {
    this.logger = logger.getSubLogger({ name: 'UserRegistryLogger' })
    this.notificationsService = notificationsService
  }

  async registerUser(unregisteredUser: TUserDetails) {
    const registeredUser = await this.getUser(unregisteredUser)
    if (!registeredUser) {
      await prisma.onlineUser.create({
        data: {
          username: unregisteredUser.username,
          sid: unregisteredUser.sid
        }
      })
      this.logger.info(`${unregisteredUser.sid} just got registered as ${unregisteredUser.username}`)
      this.notificationsService.notifyWaitingUsers(unregisteredUser.username, WaitingEvent.ONLINE)
    }
  }

  async unregisterUser(registeredUser: TUserDetails) {
    const _registeredUser = await this.getUser(registeredUser)
    if (!!_registeredUser) {
      await prisma.onlineUser.deleteMany({
        where: {
          username: registeredUser.username,
          sid: registeredUser.sid
        }
      })
      this.logger.info(`${_registeredUser.username} just got unregistered`)
      this.notificationsService.notifyWaitingUsers(_registeredUser.username, WaitingEvent.OFFLINE)
    }
  }

  async getUser(userDetails: TUserDetails) {
    return await prisma.onlineUser.findFirst({
      where: {
        username: userDetails.username,
        sid: userDetails.sid
      }
    })
  }

  async getUserByUsername(username: string) {
    return await prisma.onlineUser.findFirst({
      where: {
        username
      }
    })
  }
}

export default UserRegistry
