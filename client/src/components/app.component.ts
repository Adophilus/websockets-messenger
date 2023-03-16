import Message from '../utils/Message'
import ChatUIElement, { IReadMessageEvent, ISendMessageEvent } from './chat-ui.component'
import './lobby-ui.component'
import './user-details-modal.component'
import './chat-ui.component'
import { io } from 'socket.io-client'
import './error-modal.component'
import { LitElement, html } from 'lit'
import { query, customElement, state } from 'lit/decorators.js'
import TEvent from '../utils/Event'
import Recepient from '../utils/Recepient'
import { TLoginEvent } from './user-details-modal.component'
import { IRegisterRecepientEvent } from './lobby-ui.component'
import { WebSocketMessage } from '../../../server/src/types'
import { Router } from '@lit-labs/router'

@customElement('ws-app')
class AppElement extends LitElement {
  private router = new Router(this, [
    { path: '/' },
    { path: '/register', render: () => this.registrationTemplate, enter: async () => { await import('./user-details-modal.component'); return true } },
    { path: '/chat', render: () => this.chatUITemplate, enter: async () => { await import('./chat-ui.component'); return true } },
    { path: '/lobby', render: () => this.lobbyUITemplate, enter: async () => { await import('./lobby-ui.component'); return true } },
  ]);

  declare private ws


  @query('ws-chat-ui')
  declare chatUIElement: ChatUIElement

  @state()
  declare username: string

  @state()
  token = window.localStorage.getItem("token")

  @state()
  declare recepient: Recepient

  @state()
  recepients: Recepient[] = []

  @state()
  errors: string[] = []

  @state()
  events: TEvent[] = []

  constructor() {
    super()
    this.setAttribute("class", "flex flex-col w-full px-4 mx-auto mt-8 md:mt-12 max-w-xl gap-y-4")

    if (this.token)
      this.connectToWebsocket()
  }

  get registrationTemplate() {
    if (this.username) return ''

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
    if (!this.username || !this.recepient) return ''

    return html`<ws-chat-ui username="${this.username}"
      .recepient="${this.recepient}"
      .events="${this.events}"
      @send-message="${(ev: CustomEvent<ISendMessageEvent>) => this.sendMessage(ev.detail.message)}"
      @read-message="${(ev: CustomEvent<IReadMessageEvent>) => this.readMessage(ev.detail.message)}"></ws-chat-ui>`
  }

  get lobbyUITemplate() {
    if (!this.username || this.recepient) return ''

    return html`<ws-lobby-ui
      @recepient="${(ev: CustomEvent<IRegisterRecepientEvent>) => this.registerRecepient(ev.detail.recepient)}"
      .recepients="${this.recepients}"></ws-lobby-ui>`
  }

  render() {
    return html`
    ${this.errorModalTemplate}
    ${this.chatUITemplate}
    ${this.lobbyUITemplate}
    ${this.registrationTemplate}`
  }

  sendMessage(message: string) {
    this.ws.emit(WebSocketMessage.SEND_CHAT, { message, recepient: this.recepient.username }, ({ message }: { message: Message }) => {
      this.events = [...this.events, { type: 'message', message, username: null }]
    })
  }

  readMessage(message: Message) {
    this.ws.emit(WebSocketMessage.READ_CHAT, { id: message.id }, () => {
      this.events = this.events.map((event) => {
        if (!(event.type === 'message') || !event.message) return event
        if (!(event.message.id === message.id)) return event
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

  private registerRecepient(recepient: Recepient) {
    this.recepient = recepient
    this.events = []
    this.ws.emit(WebSocketMessage.FETCH_CHATS_WITH_USER, { recepient: recepient.username }, ({ messages }: { messages: Message[] }) => {
      this.events = this.events.concat(messages.map(message => ({ type: 'message', message, username: null }))).reverse()
    })
  }

  private registerToken(token: string) {
    window.localStorage.setItem("token", token)
    this.token = token
  }

  private connectToWebsocket() {
    this.ws = io('/', { path: '/ws' })

    this.ws.on('connect', () => {
      this.router.goto('/lobby')

      this.ws.emit(WebSocketMessage.FETCH_USERS, {}, ({ users }: { users: Recepient[] }) => {
        this.recepients = users.filter(user => user.username !== this.username).map(user => new Recepient(user))
      })

      this.ws.on(WebSocketMessage.CHAT, (message: Message) => {
        this.events = [...this.events, { type: 'message', message, username: null }]
      })

      this.ws.on(WebSocketMessage.READ_CHAT, ({ id }) => {
        this.events = this.events.map(event => {
          if (event.type === 'message' && event.message?.id === id)
            return Object.assign(event, { message: { ...event.message, has_read: true } })
          return event
        })
      })

      this.ws.on(WebSocketMessage.USER_LEAVE, ({ username }: { username: string }) => {
        this.recepients = this.recepients.filter(recepient => recepient.username !== username)
        this.events = [...this.events, { type: 'user-leave', username }]
      })

      this.ws.on(WebSocketMessage.USER_JOIN, ({ username }: { username: string }) => {
        this.recepients = [...this.recepients, new Recepient({ username, unreadMessagesCount: -1 })]
        this.events = [...this.events, { type: 'user-join', username }]
        this.ws.emit(WebSocketMessage.FETCH_UNREAD_CHATS_COUNT, { username }, ({ unreadMessagesCount }: { unreadMessagesCount: number }) => {
          this.recepients = this.recepients.map(recepient => recepient.username === username ? new Recepient({ ...recepient, unreadMessagesCount }) : recepient)
        })
      })

      this.ws.on(WebSocketMessage.UNREAD_CHATS_COUNT, ({ username, unreadMessagesCount }: { username: string, unreadMessagesCount: number }) => {
        this.recepients = this.recepients.map(recepient => recepient.username === username ? new Recepient({ ...recepient, unreadMessagesCount }) : recepient)
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
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ws-app": AppElement
  }
}

export default AppElement
