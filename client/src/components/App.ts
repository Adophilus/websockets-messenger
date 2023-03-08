import Message from '../utils/Message'
import ChatUIElement from './ChatUI'
import './LobbyUI'
import './UserDetailsModal'
import './ChatUI'
import { io } from 'socket.io-client'
import './ErrorModal'
import { LitElement, html } from 'lit'
import { query, customElement, property, state } from 'lit/decorators.js'
import IEvent from '../utils/Event'

@customElement('ws-app')
class AppElement extends LitElement {
  declare private ws

  @query('ws-chat-ui')
  declare chatUIElement: ChatUIElement

  @state()
  username = window.sessionStorage.getItem('username')

  @state()
  recepient = ''

  @state()
  recepients: string[] = []

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
        this.events.push({ type: 'message', message })
      })

      this.ws.on('user-leave', ({ user }: { user: string }) => {
        this.recepients = this.recepients.filter(recepient => recepient !== user)
        this.events = [...this.events, { type: 'user-leave', user }]
      })

      this.ws.on('user-join', ({ user }: { user: string }) => {
        this.recepients = [...this.recepients, user]
        this.events = [...this.events, { type: 'user-join', user }]
      })
    })

    this.ws.on('disconnect', () => {
      this.errors.push('Network connection lost. Reconnecting...')
    })
  }

  get registrationTemplate() {
    if (this.username) return ''

    return html`
      <ws-user-details-modal @register="${(ev) => {
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
      recepient="${this.recepient}"
      .events="${this.events}"
      @message="${(ev) => this.sendMessage(ev.detail.message)}"></ws-chat-ui>`
  }

  get lobbyUITemplate() {
    if (!this.username || this.recepient) return ''

    return html`<ws-lobby-ui
      @recepient="${(ev) => this.registerRecepient(ev.detail.recepient)}"
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
    this.ws.emit('message', { message, recepient: this.recepient })
  }

  createRenderRoot() { return this }

  private registerUsername(username: string) {
    this.username = username
    window.sessionStorage.setItem('username', username)

    this.ws.emit('register', { username }, () => {
      this.ws.emit('fetch-users', {}, ({ users }: { users: string[] }) => {
        this.recepients = users.filter(user => user !== this.username)
      })
    })
  }

  private registerRecepient(recepient: string) {
    this.recepient = recepient
    this.ws.emit('fetch', { recepient }, ({ messages }: { messages: Message[] }) => {
      this.events = this.events.concat(messages.map(message => ({ type: 'message', message })))
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ws-app": AppElement
  }
}

export default AppElement
