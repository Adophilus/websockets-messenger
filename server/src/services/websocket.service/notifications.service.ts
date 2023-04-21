import { Namespace } from "socket.io";
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
  private awaitedUsers: TAwaitedUsers = {}

  constructor(io: Namespace) {
    this.io = io
  }

  registerWaitingUser(awaitedUser: TUserDetails, waitingUser: TUserDetails) {
    const [_waitingUser, index] = this.getWaitingUser(awaitedUser, waitingUser)
    if (!_waitingUser)
      this.awaitedUsers[awaitedUser.username].push(waitingUser)
  }

  unregisterWaitingUser(awaitedUser: TUserDetails, waitingUser: TUserDetails) {
    const [_waitingUser, index] = this.getWaitingUser(awaitedUser, waitingUser)
    if (!!_waitingUser)
      this.awaitedUsers[awaitedUser.username].splice(index, 1)
  }

  getWaitingUser(awaitedUser: TUserDetails, waitingUser: TUserDetails): [TUserDetails | null, number] {
    let index = -1

    if (!this.awaitedUsers[awaitedUser.username])
      return [null, index]

    const foundWaitingUser = this.awaitedUsers[awaitedUser.username].find((_waitingUser, i) => {
      index = i
      return _waitingUser.username === waitingUser.username && _waitingUser.sid === waitingUser.sid
    })

    return !!foundWaitingUser ? [foundWaitingUser, index] : [null, -1]
  }

  async notifyWaitingUsers(awaitedUser: TUserDetails, event: WaitingEvent) {
    const waitingUsers = this.awaitedUsers[awaitedUser.username]
    if (!!waitingUsers) {
      let messagingEvent = WebSocketMessage.USER_ONLINE
      switch (event) {
        case WaitingEvent.ONLINE:
          messagingEvent = WebSocketMessage.USER_ONLINE
          break
        case WaitingEvent.OFFLINE:
          messagingEvent = WebSocketMessage.USER_OFFLINE
          break
      }
      this.io.to(waitingUsers.map(waitingUser => waitingUser.sid)).emit(messagingEvent, { user: awaitedUser.username })
    }
  }
}

export default NotificationsService
