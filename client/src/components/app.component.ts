import Message from '../utils/Message'
import ChatUIElement, { IReadMessageEvent, ISendMessageEvent } from './chat-ui.component'
import './lobby-ui.component'
import './user-details-modal.component'
import './chat-ui.component'
import { Manager, Socket } from 'socket.io-client'
import './error-modal.component'
import { LitElement, html } from 'lit'
import { query, customElement, state } from 'lit/decorators.js'
import Recipient from '../utils/Recipient'
import { TLoginEvent } from './user-details-modal.component'
import { IRegisterRecepientEvent } from './lobby-ui.component'
import { WebSocketMessage } from '../../../server/src/types'
import { Router } from '@lit-labs/router'
import JwtDecode from 'jwt-decode'
import { TToken } from '../../../server/src/types'

@customElement('ws-app')
class AppElement extends LitElement {
  private router: Router
  private wsManager = new Manager('', {
    path: '/ws'
  })

  declare private ws: Socket

  @query('ws-chat-ui')
  declare chatUIElement: ChatUIElement

  @state()
  declare username: string

  @state()
  token = window.localStorage.getItem("token")

  @state()
  declare recipient: Recipient

  @state()
  recipients: Recipient[] = []

  @state()
  messages: Message[] = []

  @state()
  errors: string[] = []

  constructor() {
    super()
    this.setAttribute("class", "flex flex-col w-full px-4 mx-auto mt-8 md:mt-12 max-w-xl gap-y-4")

    this.router = new Router(this, [
      { path: '/' },
      { path: '/register', render: () => this.registrationTemplate, enter: async () => { await import('./user-details-modal.component'); return true } },
      { path: '/chat', render: () => this.chatUITemplate, enter: async () => { await import('./chat-ui.component'); return true } },
      { path: '/lobby', render: () => this.lobbyUITemplate, enter: async () => { await import('./lobby-ui.component'); return true } },
    ])
  }

  get registrationTemplate() {
    return html`
      <ws-user-details-modal @login="${this.onLogin}"></ws-user-details-modal>
    `
  }

  get errorModalTemplate() {
    if (!this.errors.length) return ''

    return html`
        ${this.errors.map(error => html`<ws-error-modal @close="${() => this.errors = this.errors.filter(_error => error !== _error)}" message="${error}"></ws-error-modal>`)}
      `
  }

  get chatUITemplate() {
    return html`<ws-chat-ui username="${this.username}"
      .recepient="${this.recipient}"
      @send-message="${(ev: CustomEvent<ISendMessageEvent>) => this.sendMessage(ev.detail.message)}"
      @read-message="${(ev: CustomEvent<IReadMessageEvent>) => this.readMessage(ev.detail.message)}"></ws-chat-ui>`
  }

  get lobbyUITemplate() {
    return html`<ws-lobby-ui
      @select-recepient="${(ev: CustomEvent<IRegisterRecepientEvent>) => {
        this.registerRecepient(ev.detail.recepient)
        this.router.goto('/chat')
      }}"
      .recepients="${this.recipients}"></ws-lobby-ui>`
  }

  firstUpdated(changedProperties): void {
    super.firstUpdated(changedProperties)

    if (this.token) {
      this.username = JwtDecode<TToken>(this.token).username
      this.connectToWebsocket()
      this.router.goto('/lobby')
    }
    else
      this.router.goto('/register')
  }

  render() {
    return html`
    ${this.errorModalTemplate}
    ${this.router.outlet()}
    `

    // return html`
    // ${this.errorModalTemplate}
    // ${this.chatUITemplate}
    // ${this.lobbyUITemplate}
    // ${this.registrationTemplate}`
  }

  sendMessage(message: string) {
    this.ws.emit(WebSocketMessage.SEND_CHAT, { message, user: this.recipient.username }, ({ chat }: { chat: Message }) => {
      this.messages = this.messages.concat(new Message(chat))
    })
  }

  readMessage(chat: Message) {
    this.ws.emit(WebSocketMessage.READ_CHAT, { id: chat.id }, () => {
      this.messages = this.messages.map(message =>
        message.id === chat.id ?
          {
            ...message,
            has_read: true
          }
          : message)
    })
  }

  createRenderRoot() { return this }

  private registerUsername(username: string) {
    this.username = username
  }

  private registerRecepient(recepient: Recipient) {
    this.recipient = recepient
    this.recipients = []
    this.ws.emit(WebSocketMessage.FETCH_CONVERSATION_WITH_USER, { user: recepient.username }, ({ chats }: { chats: Message[] }) => {
      this.messages = chats.map(chat => new Message(chat)).reverse()
    })
  }

  private registerToken(token: string) {
    window.localStorage.setItem("token", token)
    this.token = token
  }

  private connectToWebsocket() {
    this.ws = this.wsManager.socket('/chat', { auth: { token: this.token } })

    this.ws.on('connect', () => {
      this.ws.emit(WebSocketMessage.FETCH_USERS, {}, ({ users }: { users: { username: string }[] }) => {
        console.log('all online users:', users)
        this.recipients = users.map(user => new Recipient({ username: user.username, unreadChatsCount: 0, isOnline: true }))
      })

      this.ws.on(WebSocketMessage.CHAT, ({ chat }: { chat: Message }) => {
        if (chat.sender === this.recipient.username) {
          this.messages = this.messages.concat(new Message(chat))
        }
      })

      this.ws.on(WebSocketMessage.READ_CHAT, ({ id }: { id: number }) => {
        this.messages = this.messages.map(message =>
          (message.id === id) ?
            { ...message, has_read: true }
            : message)
      })

      this.ws.on(WebSocketMessage.USER_LEAVE, ({ user }: { user: string }) => {
        console.log('user left', user)
        this.recipients = this.recipients.map(recipient => {
          if (recipient.username === user) {
            recipient.isOnline = false
          }
          return recipient
        })
      })

      this.ws.on(WebSocketMessage.USER_JOIN, ({ user }: { user: string }) => {
        console.log('new user joined', user)
        let hasRegisteredUser = false
        this.recipients = this.recipients.map(recipient => {
          if (recipient.username === user) {
            recipient.isOnline = true
            hasRegisteredUser = true
          }
          return recipient
        })
        if (!hasRegisteredUser)
          this.recipients = this.recipients.concat(new Recipient({ username: user, unreadChatsCount: 0, isOnline: true }))

        this.ws.emit(WebSocketMessage.FETCH_UNREAD_CHATS_COUNT, { user }, ({ unreadChatsCount }: { unreadChatsCount: number }) => {
          this.recipients = this.recipients.map(recepient => recepient.username === user ? new Recipient({ ...recepient, unreadChatsCount }) : recepient)
        })
      })

      this.ws.on(WebSocketMessage.UNREAD_CHATS_COUNT, ({ user, unreadChatsCount }: { user: string, unreadChatsCount: number }) => {
        this.recipients = this.recipients.map(recepient => recepient.username === user ? new Recipient({ ...recepient, unreadChatsCount }) : recepient)
      })
    })

    this.ws.on('disconnect', () => {
      this.errors.push('Network connection lost. Reconnecting...')
    })
  }

  private onLogin(ev: CustomEvent<TLoginEvent>) {
    const { username, token } = ev.detail

    this.registerUsername(username)
    this.registerToken(token)
    this.connectToWebsocket()
    this.router.goto('/lobby')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ws-app": AppElement
  }
}

export default AppElement
