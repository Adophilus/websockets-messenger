import Message from '../utils/Message'
import ChatUIElement from './ChatUI'
import './LobbyUI'
import './UserDetailsModal'
import './UserDetailsModal'
import { io } from 'socket.io-client'
import './ErrorModal'
import { LitElement, html } from 'lit'
import { query, customElement, property } from 'lit/decorators.js'

@customElement('ws-app')
class AppElement extends LitElement {
  declare private ws

  @query('ws-chat-ui')
  declare chatUIElement: ChatUIElement

  @property({ attribute: false })
  username = window.sessionStorage.getItem('username')

  @property({ attribute: false })
  recepient = ''

  @property({ attribute: false })
  recepients: string[] = []

  @property({ attribute: false })
  errors: string[] = []

  @property({ attribute: false })
  messages: Message[] = []

  constructor() {
    super()
    this.ws = io('/', { path: '/chat' })
    this.setAttribute("class", "flex flex-col w-full px-4 mx-auto mt-8 md:mt-12 max-w-xl gap-y-4")
    this.ws.on('connect', () => {
      this.ws.emit('fetch-users', {}, ({ users }: { users: string[] }) => this.recepients = users)
      this.ws.on('message', (message: Message) => {
        this.messages.push(message)
      })

      this.ws.on('user-leave', ({ user }: { user: string }) => this.chatUIElement?.notifyUserLeft(user))
      this.ws.on('user-join', ({ user }: { user: string }) => {
        this.recepients.push(user)
        this.chatUIElement?.notifyUserJoined(user)
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
      recepient="${this.recepient}" .messages="${this.messages}"
      @message="${(ev) => this.sendMessage(ev.detail.message)}"></ws-chat-ui>`
  }

  get lobbyUITemplate() {
    if (!this.username) return ''

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

    this.ws.emit('register', { username })
  }

  private registerRecepient(recepient: string) {
    this.recepient = recepient
    this.ws.emit('fetch', { recepient }, ({ messages }: { messages: Message[] }) => {
      this.messages = messages
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ws-app": AppElement
  }
}

export default AppElement
