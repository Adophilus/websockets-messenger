type TProps = {
  username: string
  unreadMessagesCount: number
}

class Recepient {
  declare username: string
  unreadMessagesCount: number = 0

  constructor({ username, unreadMessagesCount }: TProps) {
    this.username = username
    this.unreadMessagesCount = unreadMessagesCount
  }
}

export default Recepient
