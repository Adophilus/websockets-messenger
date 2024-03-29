class Message {
  declare public id: number
  declare public sender: string
  declare public recipient: string
  declare public message: string
  declare public media: string[]
  declare public has_read: boolean

  constructor({ id, sender, recipient, message, media, has_read }: Message) {
    this.id = id
    this.sender = sender
    this.recipient = recipient
    this.message = message
    this.media = media
    this.has_read = has_read
  }
}

export default Message
