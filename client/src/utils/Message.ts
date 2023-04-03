class Message {
  declare public id: number
  declare public sender: string
  declare public recipient: string
  declare public message: string
  declare public image: string | null
  declare public has_read: boolean

  constructor({ id, sender, recipient, message, image, has_read }: Message) {
    this.id = id
    this.sender = sender
    this.recipient = recipient
    this.message = message
    this.image = image
    this.has_read = has_read
  }
}

export default Message
