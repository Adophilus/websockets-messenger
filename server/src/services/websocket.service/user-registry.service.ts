import { ILogObj, Logger } from "tslog";
import { TUserDetails } from "../../types";
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
  users: TUserDetails[] = []
  declare private logger: Logger<ILogObj>
  declare private notificationsService: NotificationsService

  constructor({ logger, notificationsService }: { logger: Logger<ILogObj>, notificationsService: NotificationsService }) {
    this.logger = logger.getSubLogger({ name: 'UserRegistryLogger' })
    this.notificationsService = notificationsService
  }

  async registerUser(unregisteredUser: TUserDetails) {
    const [registeredUser,] = await this.getUser(unregisteredUser)
    if (!registeredUser) {
      this.users.push(unregisteredUser)
      this.logger.info(`${unregisteredUser.sid} just got registered as ${unregisteredUser.username}`)
      this.notificationsService.notifyWaitingUsers(unregisteredUser.username, WaitingEvent.ONLINE)
    }
  }

  async unregisterUser(registeredUser: TUserDetails) {
    const [_registeredUser, index] = await this.getUser(registeredUser)
    if (!!_registeredUser) {
      this.users.splice(index, 1)
      this.logger.info(`${_registeredUser.username} just got unregistered`)
      this.notificationsService.notifyWaitingUsers(_registeredUser.username, WaitingEvent.OFFLINE)
    }
  }

  async getUser(userDetails: TUserDetails): Promise<[TUserDetails | null, number]> {
    let index = -1
    const foundUserDetails = this.users.find((_userDetails, i) => {
      index = i
      return _userDetails.username === userDetails.username && _userDetails.sid === userDetails.sid
    })
    return !!foundUserDetails ? [foundUserDetails, index] : [null, -1]
  }

  async getUserByUsername(username: string) {
    return this.users.find((userDetails) => userDetails.username === username)
  }
}

export default UserRegistry
