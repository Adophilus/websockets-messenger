type TProps = {
  username: string
  unreadChatsCount: number
}

class Recipient {
  declare username: string
  unreadChatsCount: number = 0

  constructor({ username, unreadChatsCount }: TProps) {
    this.username = username
    this.unreadChatsCount = unreadChatsCount
  }
}

export default Recipient
