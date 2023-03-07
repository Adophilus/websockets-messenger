export interface IMessage {
  sender: string
  recepient: string
  message: string
  image: string
  has_read: boolean
}

class Message implements IMessage {
  declare public sender: string
  declare public recepient: string
  declare public message: string
  declare public image: string
  declare public has_read: boolean

  constructor({ sender, recepient, message, image, has_read }: IMessage) {
    this.sender = sender
    this.recepient = recepient
    this.message = message
    this.image = image
    this.has_read = has_read
  }
}

export default Message
