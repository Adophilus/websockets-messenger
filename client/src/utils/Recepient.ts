type TProps = {
  username: string
  unreadMessgeCount?: number
}

class Recepient {
  declare username: string
  unreadMessagesCount: number = 0

  constructor({ username, unreadMessgeCount = 0 }: TProps) {
    this.username = username
    this.unreadMessagesCount = unreadMessgeCount
  }
}

export default Recepient
