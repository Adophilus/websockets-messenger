import Message from '../utils/Message'
import ChatUIElement, { IReadMessageEvent, ISendMessageEvent } from './chat-ui.component'
import './lobby-ui.component'
import './user-details-modal.component'
import './chat-ui.component'
import { Manager, Socket } from 'socket.io-client'
import './error-modal.component'
import { LitElement, html } from 'lit'
import { query, customElement, state } from 'lit/decorators.js'
import TEvent from '../utils/Event'
import Recipient from '../utils/Recepient'
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
  declare recepient: Recipient

  @state()
  recepients: Recipient[] = []

  @state()
  errors: string[] = []

  @state()
  events: TEvent[] = []

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
      .recepient="${this.recepient}"
      .events="${this.events}"
      @send-message="${(ev: CustomEvent<ISendMessageEvent>) => this.sendMessage(ev.detail.message)}"
      @read-message="${(ev: CustomEvent<IReadMessageEvent>) => this.readMessage(ev.detail.message)}"></ws-chat-ui>`
  }

  get lobbyUITemplate() {
    return html`<ws-lobby-ui
      @select-recepient="${(ev: CustomEvent<IRegisterRecepientEvent>) => {
        this.registerRecepient(ev.detail.recepient)
        this.router.goto('/chat')
      }}"
      .recepients="${this.recepients}"></ws-lobby-ui>`
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
    console.log('rendered!')
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
    this.ws.emit(WebSocketMessage.SEND_CHAT, { message, user: this.recepient.username }, ({ chat }: { chat: Message }) => {
      this.events = [...this.events, { type: 'message', message: chat, username: null }]
    })
  }

  readMessage(chat: Message) {
    this.ws.emit(WebSocketMessage.READ_CHAT, { id: chat.id }, () => {
      this.events = this.events.map((event) => {
        if (!(event.type === 'message') || !event.message) return event
        if (!(event.message.id === chat.id)) return event
        return {
          ...event,
          message: {
            ...event.message,
            has_read: true
          }
        }
      })
    })
  }

  createRenderRoot() { return this }

  private registerUsername(username: string) {
    this.username = username
  }

  private registerRecepient(recepient: Recipient) {
    this.recepient = recepient
    this.events = []
    this.ws.emit(WebSocketMessage.FETCH_CONVERSATION_WITH_USER, { user: recepient.username }, ({ chats }: { chats: Message[] }) => {
      this.events = this.events.concat(chats.map(message => ({ type: 'message', message, username: null }))).reverse()
    })
  }

  private registerToken(token: string) {
    window.localStorage.setItem("token", token)
    this.token = token
  }

  private connectToWebsocket() {
    this.ws = this.wsManager.socket('/chat', { auth: { token: this.token } })

    this.ws.on('connect', () => {
      this.ws.emit(WebSocketMessage.FETCH_USERS, {}, ({ users }: { users: Recipient[] }) => {
        console.log(users)
        this.recepients = users.map(user => new Recipient(user))
      })

      this.ws.on(WebSocketMessage.CHAT, ({ chat }: { chat: Message }) => {
        this.events = [...this.events, { type: 'message', message: chat, username: null }]
      })

      this.ws.on(WebSocketMessage.READ_CHAT, ({ id }: { id: number }) => {
        this.events = this.events.map(event => {
          if (event.type === 'message' && event.message?.id === id)
            return Object.assign(event, { message: { ...event.message, has_read: true } })
          return event
        })
      })

      this.ws.on(WebSocketMessage.USER_LEAVE, ({ user }: { user: string }) => {
        this.recepients = this.recepients.filter(recepient => recepient.username !== user)
        this.events = [...this.events, { type: 'user-leave', username: user }]
      })

      this.ws.on(WebSocketMessage.USER_JOIN, ({ user }: { user: string }) => {
        console.log(`New user ${user} has joined!`)
        this.recepients = this.recepients.filter(recepient => recepient.username !== user).concat(new Recipient({ username: user, unreadChatsCount: -1 }))
        this.events = [...this.events, { type: 'user-join', username: user }]

        this.ws.emit(WebSocketMessage.FETCH_UNREAD_CHATS_COUNT, { user }, ({ unreadChatsCount }: { unreadChatsCount: number }) => {
          this.recepients = this.recepients.map(recepient => recepient.username === user ? new Recipient({ ...recepient, unreadChatsCount }) : recepient)
        })
      })

      this.ws.on(WebSocketMessage.UNREAD_CHATS_COUNT, ({ user, unreadChatsCount }: { user: string, unreadChatsCount: number }) => {
        this.recepients = this.recepients.map(recepient => recepient.username === user ? new Recipient({ ...recepient, unreadChatsCount }) : recepient)
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
