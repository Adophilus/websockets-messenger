# Websocket Messenger API Documentation

## About

Version: `1.0.0`

URI: `ws://localhost:3000/ws`

Channel: `chat`

## Overview

This document outlines the procedure for sending and receiving messages from the websocket server.

## Events

### Publish Events (sent by client)

#### [Publish] `fetch-users`

- Request payload
```typescript
type Request = {}
```

- Response payload
```typescript
type Response = {
  users: User[] // a list of users
}
```

#### [Publish] `fetch-conversation-with-user`

- Request payload
```typescript
type Request = {
  user: string // username of user you wish to fetch conversion with
}
```

- Response payload
```typescript
type Response = {
  chats: Chat[] // a list of chats
}
```

#### [Publish] `fetch-unread-chats-count`

- Request payload
```typescript
type Request = {
  user: string // username of the sender 
}
```

- Response payload
```typescript
type Response = {
  unreadChatsCount: number // a number signifying the number of unread chats
}
```

#### [Publish] `read-chat`

- Request payload
```typescript
type Request = {
  id: ChatIdentifier // the id of the chat that has been read
}
```

- Response payload
```typescript
type Response = {} // empty, but getting this response means that the server has registered the `read` status of the chat 
```

#### [Publish] `send-message`

- Request payload
```typescript
type Request = {
  message: string, // the chat message
  user: string, // the username of the correspondent in the conversation
  media?: MediaIdentifier[] // the ids of the media you want to be associated with this chat
}
```

- Response payload
```typescript
type Response = {
  chat: Chat
}
```

#### [Publish] `wait-for-user`

- Request payload
```typescript
type Request = {
  user: string // the username of the user to be awaited
}
```

#### [Publish] `stop-waiting-for-user`

- Request payload
```typescript
type Request = {
  user: string // the username of the user who is no longer to be awaited
}
```

### Subscribe Events (sent by server)

#### [Subscribe] `unread-chats-count`

- Response payload
```typescript
type Response = {
  unreadChatsCount: number, // a number signifying the number of unread chats
  user: string // the username of the correspondent in the conversation
}
```

#### [Subscribe] `read-chat`

- Response payload
```typescript
type Response = {
  id: ChatIdentifier, // the id of the chat that has been read
  user: string // the username of the correspondent in the conversation
}
```

#### [Subscribe] `chat`

- Response payload
```typescript
type Response = {
  chat: Chat // chat sent by correspondent
}
```

#### [Subscribe] `user-join`

- Response payload
```typescript
type Response = {
  user: string // the username of the user that just joined
}
```

#### [Subscribe] `user-leave`

- Response payload
```typescript
type Response = {
  user: string // the username of the user that just left
}
```

#### [Subscribe] `user-online`

- Response payload
```typescript
type Response = {
  user: string // the username of the user that just came online 
}
```

#### [Subscribe] `user-offline`

- Response payload
```typescript
type Response = {
  user: string // the username of the user that just came offline 
}
```

#### [Subscribe] `auth-failed`
Indicates that authentication to the server failed


## Schema
```typescript
type ChatIdentifier = string | number // the unique id of a chat
type MediaIdentifier = string // the unique id of a media resoure (the media URL)
```

```typescript
type User = {
  username: string
  isOnline: boolean
}
```

```typescript
type Chat = {
  id: ChatIdentifier,
  sender: string, // username of the sender
  recipient: string, // username of the recipient
  message: string, // message sent
  has_read: boolean, // flag signifying whether the chat has been read by the recepient
  media?: MediaIdentifier[] // list of media ids
}
```
