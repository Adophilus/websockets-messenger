type TProps = {
  username: string
  unreadChatsCount: number
  isOnline: boolean
}

class Recipient {
  declare username: string
  unreadChatsCount: number = 0
  isOnline = true

  constructor({ username, unreadChatsCount, isOnline }: TProps) {
    this.username = username
    this.unreadChatsCount = unreadChatsCount
    this.isOnline = isOnline
  }
}

export default Recipient
