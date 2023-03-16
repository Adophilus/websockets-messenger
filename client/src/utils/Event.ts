import Message from "./Message"

export type TEvent = {
  type: TEventType
  username: string | null
  message?: Message
}

export type TEventType = 'message' | 'user-leave' | 'user-join'

export default TEvent
