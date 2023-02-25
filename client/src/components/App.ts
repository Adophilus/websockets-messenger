import Message from '../utils/Message'
import ChatUIElement from './ChatUI'
import './UserDetailsModal'
import UserDetailsModalElement from './UserDetailsModal'
import { io } from 'socket.io-client'
import { Socket } from 'socket.io'

class AppElement extends HTMLElement {
  private declare _ws: Socket
  private declare _username: string
  private declare _registrationModalElement: UserDetailsModalElement
  private declare _chatUIElement: ChatUIElement

  constructor() {
    super()
  }

  connectedCallback() {
    this._ws = io(import.meta.env.VITE_WEBSOCKET_URI, { path: '/chat' })
    this._ws.on('open', () => {
      console.log('connected to server')
    })
    this._ws.on('message', ({ data }) => {
      console.log(data)
      this._chatUIElement.addMessage(new Message(data))
    })

    this._registrationModalElement = new UserDetailsModalElement()
    this._chatUIElement = new ChatUIElement()

    this.appendChild(this._registrationModalElement)

    this._registrationModalElement.addEventListener('register', (ev) => {
      this._username = ev.detail.username
      this._hideRegistrationModal()
      this._showChatUI()
      this._ws.emit('chat-register', { username: this._username })
    })

    this._chatUIElement.addEventListener('send-message', (ev) => {
      const message = ev.detail.message
      this._ws.emit('chat-message', message)
    })

    this._ws.on('user-joined', ({ username }: { username: string }) => {
      console.log(username)
      this._chatUIElement.notifyUserJoined(username)
    })

    this._ws.on('disconnect', () => {
      console.log('disconnected')
    })
  }

  private _hideRegistrationModal() {
    this._registrationModalElement.remove()
  }

  private _showChatUI() {
    this.appendChild(this._chatUIElement)
  }
}

window.customElements.define('ws-app', AppElement)
export default AppElement
