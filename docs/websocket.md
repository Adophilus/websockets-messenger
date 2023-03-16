# Websocket Messenger API Documentation

## About

Version: `1.0.0`

URI: `ws://localhost:3000/ws`

Channel: `chat`

## Overview

This document outlines the procedure for sending and receiving messages from the websocket server

## Messages

### [PUB] `fetch-users`

- Request payload
```typescript
type TRequest = {}
```

- Response payload
```typescript
type TResponse = {
  users: string[] // a list of usernames 
}
```

### [PUB] `fetch-conversation-with-user`

- Request payload
```typescript
type TRequest = {
  user: string // username of user you wish to fetch conversion with
}
```

- Response payload
```typescript
type TResponse = {
  chats: TChat[] // a list of messages
}
```

### [PUB] `fetch-unread-chats-count`

- Request payload
```typescript
type TRequest = {
  user: string // username of the recipient
}
```

- Response payload
```typescript
type TResponse = {
  unreadChatsCount: number // a number signifying the number of unread chats
}
```

### [PUB] `read-chat`

- Request payload
```typescript
type TRequest = {
  id: TIdentifier // the id of the chat that has been read
}
```

- Response payload
```typescript
type TResponse = {} // empty, but getting this response means that the server has registered the `read` status of the chat 
```

### [PUB] `send-chat`

- Request payload
```typescript
type TRequest = {
  message: string // the chat message
}
```

- Response payload
```typescript
type TResponse = {
  chat: TChat
}
```

### [SUB] `unread-chats-count`

- Response payload
```typescript
type TResponse = {
  unreadChatsCount: number, // a number signifying the number of unread chats
  user: string // the username of the correspondent in the conversation
}
```

### [SUB] `read-chat`

- Response payload
```typescript
type TResponse = {
  id: TIdentifier, // the id of the chat that has been read
  user: string // the username of the correspondent in the conversation
}
```

### [SUB] `chat`

- Response payload
```typescript
type TResponse = {
  chat: TChat // chat sent by correspondent
}
```

### [SUB] `user-join`

- Response payload
```typescript
type TResponse = {
  user: string // the username of the user that just joined
}
```

### [SUB] `user-leave`

- Response payload
```typescript
type TResponse = {
  user: string // the username of the user that just left
}
```

## Schema
```typescript
type TIdentifier = string | number // the unique id of an entity
```

```typescript
type TUser = {
  username: string
}
```

```typescript
type TChat = {
  id: TIdentifier,
  sender: string, // username of the sender
  recipient: string, // username of the recipient
  message: string, // message sent
  has_read: boolean, // flag signifying whether the chat has been read by the recepient
  media: string | null, // url of the media
  date_sent: Date
}
```
