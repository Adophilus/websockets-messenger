import Message from '../utils/Message'
import ChatUIElement from './ChatUI'
import LobbyUIElement from './LobbyUI'
import './UserDetailsModal'
import UserDetailsModalElement from './UserDetailsModal'
import { io, Socket } from 'socket.io-client'

class AppElement extends HTMLElement {
  private declare _ws: Socket
  private _username = window.sessionStorage.getItem('username')
  private declare _registrationModalElement: UserDetailsModalElement
  private declare _chatUIElement: ChatUIElement
  private declare _lobbyUIElement: LobbyUIElement
  private _chatRecepient = ''

  constructor() {
    super()
  }

  connectedCallback() {
    this._ws = io('/', { path: '/chat' })

    this._ws.on('open', () => {
      console.log('connected to server')
    })

    this._ws.on('chat-message', (message) => {
      this._chatUIElement.addMessage(new Message(message))
    })

    this._ws.on('user-joined', ({ username }: { username: string }) => {
      this._chatUIElement.notifyUserJoined(username)
      this._lobbyUIElement.addRecepient(username)
    })

    this._ws.on('existing-user', ({ username }: { username: string }) => {
      this._lobbyUIElement.addRecepient(username)
    })

    this._ws.on('user-left', ({ username }: { username: string }) => {
      this._chatUIElement.notifyUserLeft(username)
      this._lobbyUIElement.removeRecepient(username)
    })

    this._ws.on('disconnect', () => {
      console.log('disconnected')
    })

    this._registrationModalElement = new UserDetailsModalElement()
    this._chatUIElement = new ChatUIElement()
    this._lobbyUIElement = new LobbyUIElement()

    this._registrationModalElement.addEventListener('register', (ev) => {
      const { username } = ev.detail
      this._registerUsername(username)
      this._chatUIElement.setAttribute('username', username)

      this._hideRegistrationModal()
      this._showLobbyUI()
    })

    this._chatUIElement.addEventListener('send-message', (ev) => {
      const message = ev.detail.message
      this._ws.emit('chat-message', { message, recepient: this._chatRecepient })
    })

    this._lobbyUIElement.addEventListener('register-recepient', (ev) => {
      const { recepient } = ev.detail

      this._chatRecepient = recepient

      this._hideLobbyUI()
      this._showChatUI()
    })

    if (!this._username) {
      this._showRegistrationModal()
    } else {
      this._registerUsername(this._username)
      this._chatUIElement.setAttribute('username', this._username)

      if (!this._chatRecepient) {
        this._showLobbyUI()
      } else {
        this._showChatUI()
      }
    }
  }

  private _registerUsername(username: string) {
    this._username = username
    window.sessionStorage.setItem('username', username)

    this._ws.emit('chat-register', { username })
  }

  private _hideRegistrationModal() {
    this._registrationModalElement.remove()
  }

  private _showRegistrationModal() {
    this.appendChild(this._registrationModalElement)
  }

  private _showChatUI() {
    this.appendChild(this._chatUIElement)
  }

  private _hideLobbyUI() {
    this._lobbyUIElement.remove()
  }

  private _showLobbyUI() {
    this.appendChild(this._lobbyUIElement)
  }
}

window.customElements.define('ws-app', AppElement)
export default AppElement
