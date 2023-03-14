import { IMessage } from "./Message"

export type TEvent = {
  type: TEventType
  username: string | null
  message?: IMessage
}

export type TEventType = 'message' | 'user-leave' | 'user-join'

export default TEvent
