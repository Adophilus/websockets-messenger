import { Namespace } from "socket.io";
import { ILogObj, Logger } from "tslog";
import { TUserDetails, WebSocketMessage } from "../../types";

export enum WaitingEvent {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

type TAwaitedUsers = {
  [k: TUserDetails['username']]: TUserDetails[]
}

export class NotificationsService {
  declare private io: Namespace
  declare private logger: Logger<ILogObj>
  private awaitedUsers: TAwaitedUsers = {}

  constructor({ io, logger }: { io: Namespace, logger: Logger<ILogObj> }) {
    this.io = io
    this.logger = logger
  }

  async registerWaitingUser(awaitedUser: string, waitingUser: TUserDetails) {
    if (!this.awaitedUsers[awaitedUser])
      this.awaitedUsers[awaitedUser] = []
    const [_waitingUser,] = await this.getWaitingUser(awaitedUser, waitingUser)
    if (_waitingUser) return

    this.logger.trace(`${waitingUser} wants to be alerted when ${awaitedUser} comes online`)
    this.awaitedUsers[awaitedUser].push(waitingUser)
  }

  async unregisterWaitingUser(awaitedUser: string, waitingUser: TUserDetails) {
    const [_waitingUser, index] = await this.getWaitingUser(awaitedUser, waitingUser)
    if (!_waitingUser) return

    this.logger.trace(`${waitingUser} no longer wants to be alerted when ${awaitedUser} comes online`)
    this.awaitedUsers[awaitedUser].splice(index, 1)
  }

  async unregisterWaitingUserFromAll(waitingUser: TUserDetails) {
    for (const awaitedUser in this.awaitedUsers) {
      this.unregisterWaitingUser(awaitedUser, waitingUser)
    }
  }

  async getWaitingUser(awaitedUser: string, waitingUser: TUserDetails): Promise<[TUserDetails | null, number]> {
    let index = -1

    if (!this.awaitedUsers[awaitedUser])
      return [null, index]

    const foundWaitingUser = this.awaitedUsers[awaitedUser].find((_waitingUser, i) => {
      index = i
      return _waitingUser.username === waitingUser.username && _waitingUser.sid === waitingUser.sid
    })

    return !!foundWaitingUser ? [foundWaitingUser, index] : [null, -1]
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
    const _awaitedUser = this.awaitedUsers[awaitedUser]
    if (!_awaitedUser) return

    const waitingUsers = _awaitedUser
    waitingUsers.forEach(waitingUser => this.notifyWaitingUser(awaitedUser, waitingUser, event))
  }
}

export default NotificationsService
