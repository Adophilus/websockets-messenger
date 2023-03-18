export type TUserDetails = {
  sid: string
  username: string
}

export type TChat = {
  sender: string,
  recipient: string,
  message: string,
  has_read: boolean,
  media: string | null,
  date_sent: Date
}

export enum WebSocketMessage {
  FETCH_USERS = "fetch-users",
  FETCH_CONVERSATION_WITH_USER = "fetch-chats-with-user",
  FETCH_UNREAD_CHATS_COUNT = "fetch-unread-chats-count",
  UNREAD_CHATS_COUNT = "unread-chats-count",
  READ_CHAT = "read-chat",
  CHAT = "chat",
  SEND_CHAT = "send-chat",
  USER_JOIN = "user-join",
  USER_LEAVE = "user-leave"
}
