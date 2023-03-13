import { IMessage } from "./Message"

export type TEvent = {
  type: TEventType
  user?: string
  message?: IMessage
}

export type TEventType = 'message' | 'user-leave' | 'user-join'

export default TEvent
