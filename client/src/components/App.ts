import Message from '../utils/Message'
import ChatUIElement, { IReadMessageEvent, ISendMessageEvent } from './ChatUI'
import './LobbyUI'
import './UserDetailsModal'
import './ChatUI'
import { io } from 'socket.io-client'
import './ErrorModal'
import { LitElement, html } from 'lit'
import { query, customElement, state } from 'lit/decorators.js'
import IEvent from '../utils/Event'
import Recepient from '../utils/Recepient'
import { IUserRegistrationEvent } from './UserDetailsModal'
import { IRegisterRecepientEvent } from './LobbyUI'

@customElement('ws-app')
class AppElement extends LitElement {
  declare private ws

  @query('ws-chat-ui')
  declare chatUIElement: ChatUIElement

  @state()
  username = window.sessionStorage.getItem('username')

  @state()
  declare recepient: Recepient

  @state()
  recepients: Recepient[] = []

  @state()
  errors: string[] = []

  @state()
  events: IEvent[] = []

  constructor() {
    super()
    this.ws = io('/', { path: '/chat' })
    this.setAttribute("class", "flex flex-col w-full px-4 mx-auto mt-8 md:mt-12 max-w-xl gap-y-4")
    this.ws.on('connect', () => {

      if (this.username) {
        this.registerUsername(this.username)
      }

      this.ws.on('message', (message: Message) => {
        this.events = [...this.events, { type: 'message', message }]
      })

      this.ws.on('read-message', ({ id }) => {
        this.events = this.events.map(event => {
          if (event.type === 'message' && event.message?.id === id)
            return Object.assign(event, { message: { ...event.message, has_read: true } })
          return event
        })
      })

      this.ws.on('user-leave', ({ user }: { user: string }) => {
        this.recepients = this.recepients.filter(recepient => recepient.username !== user)
        this.events = [...this.events, { type: 'user-leave', user }]
      })

      this.ws.on('user-join', ({ user }: { user: string }) => {
        this.recepients = [...this.recepients, new Recepient({ username: user })]
        this.events = [...this.events, { type: 'user-join', user }]
        this.ws.emit('unread-message-count', { user: user }, ({ unreadMessageCount }: { unreadMessageCount: number }) => {
          const recepient = this.recepients.find(recepient => recepient.username === user)
          if (!recepient) return
          recepient.unreadMessageCount = unreadMessageCount
        })
      })
    })

    this.ws.on('disconnect', () => {
      this.errors.push('Network connection lost. Reconnecting...')
    })
  }

  get registrationTemplate() {
    if (this.username) return ''

    return html`
      <ws-user-details-modal @register="${(ev: CustomEvent<IUserRegistrationEvent>) => {
        const { username } = ev.detail

        this.registerUsername(username)
      }}"></ws-user-details-modal>
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
      @message="${(ev: CustomEvent<ISendMessageEvent>) => this.sendMessage(ev.detail.message)}"
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
    this.ws.emit('message', { message, recepient: this.recepient }, ({ message }: { message: Message }) => {
      this.events = [...this.events, { type: 'message', message }]
    })
  }

  readMessage(message: Message) {
    this.ws.emit('read-message', { id: message.id })
  }

  createRenderRoot() { return this }

  private registerUsername(username: string) {
    this.username = username
    window.sessionStorage.setItem('username', username)

    this.ws.emit('register', { username }, () => {
      this.ws.emit('fetch-users', {}, ({ users }: { users: string[] }) => {
        this.recepients = users.filter(user => user !== this.username).map(user => new Recepient({ username: user }))
      })
    })
  }

  private registerRecepient(recepient: Recepient) {
    this.recepient = recepient
    this.ws.emit('fetch', { recepient: recepient.username }, ({ messages }: { messages: Message[] }) => {
      this.events = this.events.concat(messages.map(message => ({ type: 'message', message }))).reverse()
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ws-app": AppElement
  }
}

export default AppElement
