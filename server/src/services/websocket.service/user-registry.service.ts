import { ILogObj, Logger } from "tslog";
import { TUserDetails } from "../../types";

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

  constructor(parentLogger: Logger<ILogObj>) {
    this.logger = parentLogger.getSubLogger({ name: 'UserRegistryLogger' })
  }

  async registerUser(userDetails: TUserDetails) {
    if (!this.users.find((_userDetails) => _userDetails.username === userDetails.username && _userDetails.sid === userDetails.sid)) {
      this.users.push(userDetails)
      this.logger.info(`${userDetails.sid} registered as ${userDetails.username}`)
    }
  }

  async unregisterUser(userDetails: TUserDetails) {
    const [_, index] = await this.getUser(userDetails)
    this.users.splice(index, 1)
  }

  async getUser(userDetails: TUserDetails): Promise<[TUserDetails | null, number]> {
    let index = -1
    const foundUserDetails = this.users.find((_userDetails, i) => {
      index = i
      return _userDetails.username === userDetails.username && _userDetails.sid === userDetails.sid
    })
    return [foundUserDetails ? foundUserDetails : null, index]
  }

  async getUserByUsername(username: string) {
    return this.users.find((userDetails) => userDetails.username === username)
  }
}

export default UserRegistry
