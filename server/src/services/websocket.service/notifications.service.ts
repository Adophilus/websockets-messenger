import { Namespace } from "socket.io";
import { ILogObj, Logger } from "tslog";
import { TUserDetails, WebSocketMessage } from "../../types";

export enum WaitingEvent {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

type TAwaitedUsers = {
  [k: TUserDetails['username']]: {
    user: TUserDetails,
    users: TUserDetails[]
  }
}

export class NotificationsService {
  declare private io: Namespace
  declare private logger: Logger<ILogObj>
  private awaitedUsers: TAwaitedUsers = {}

  constructor({ io, logger }: { io: Namespace, logger: Logger<ILogObj> }) {
    this.io = io
    this.logger = logger
  }

  async registerWaitingUser(awaitedUser: TUserDetails, waitingUser: TUserDetails) {
    if (!this.awaitedUsers[awaitedUser.username])
      this.awaitedUsers[awaitedUser.username] = { user: awaitedUser, users: [] }
    const [_waitingUser,] = await this.getWaitingUser(awaitedUser, waitingUser)
    if (_waitingUser) return

    this.logger.trace(`${waitingUser} wants to be alerted when ${awaitedUser} comes online`)
    this.awaitedUsers[awaitedUser.username].users.push(waitingUser)
  }

  async unregisterWaitingUser(awaitedUser: TUserDetails, waitingUser: TUserDetails) {
    const [_waitingUser, index] = await this.getWaitingUser(awaitedUser, waitingUser)
    if (!_waitingUser) return

    this.logger.trace(`${waitingUser} no longer wants to be alerted when ${awaitedUser} comes online`)
    this.awaitedUsers[awaitedUser.username].users.splice(index, 1)
  }

  async unregisterWaitingUserFromAll(waitingUser: TUserDetails) {
    for (const awaitedUserUsername in this.awaitedUsers) {
      const awaitedUser = this.awaitedUsers[awaitedUserUsername].user
      this.unregisterWaitingUser(awaitedUser, waitingUser)
    }
  }

  async getWaitingUser(awaitedUser: TUserDetails, waitingUser: TUserDetails): Promise<[TUserDetails | null, number]> {
    let index = -1

    if (!this.awaitedUsers[awaitedUser.username])
      return [null, index]

    const foundWaitingUser = this.awaitedUsers[awaitedUser.username].users.find((_waitingUser, i) => {
      index = i
      return _waitingUser.username === waitingUser.username && _waitingUser.sid === waitingUser.sid
    })

    return !!foundWaitingUser ? [foundWaitingUser, index] : [null, -1]
  }

  async notifyWaitingUser(awaitedUser: TUserDetails, waitingUser: TUserDetails, event: WaitingEvent) {
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
    this.io.to(waitingUser.sid).emit(messagingEvent, { user: awaitedUser.username })
  }

  async notifyWaitingUsers(awaitedUser: TUserDetails, event: WaitingEvent) {
    const _awaitedUser = this.awaitedUsers[awaitedUser.username]
    if (!_awaitedUser) return

    const waitingUsers = _awaitedUser.users
    waitingUsers.forEach(waitingUser => this.notifyWaitingUser(awaitedUser, waitingUser, event))
  }
}

export default NotificationsService
