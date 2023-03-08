import { IMessage } from "./Message"

export interface IEvent {
  type: IEventType
  user?: string
  message?: IMessage
}

export type IEventType = 'message' | 'user-leave' | 'user-join'

export default IEvent
