type TProps = {
  username: string
  unreadMessgeCount?: number
}

class Recepient {
  declare username: string
  unreadMessageCount: number = 0

  constructor({ username, unreadMessgeCount = 0 }: TProps) {
    this.username = username
    this.unreadMessageCount = unreadMessgeCount
  }
}

export default Recepient
