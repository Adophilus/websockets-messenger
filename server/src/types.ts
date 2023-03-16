export type TLog = {
  message: string
}

export type TUserDetails = {
  sid: string
  username: string
}

export enum WebSocketMessage {
  FETCH_USERS = "fetch-users",
  FETCH_CHATS_WITH_USER = "fetch-chats-with-user",
  FETCH_UNREAD_CHATS_COUNT = "fetch-unread-chats-count",
  UNREAD_CHATS_COUNT = "unread-chats-count",
  READ_CHAT = "read-chat",
  CHAT = "chat",
  SEND_CHAT = "send-chat",
  USER_JOIN = "user-join",
  USER_LEAVE = "user-leave"
}
