import Message from '../utils/Message'
import ChatUIElement from './ChatUI'
import './UserDetailsModal'
import UserDetailsModalElement from './UserDetailsModal'

class AppElement extends HTMLElement {
  private declare _ws: WebSocket
  private declare _username: string
  private declare _registrationModalElement: UserDetailsModalElement
  private declare _chatUIElement: ChatUIElement

  constructor() {
    super()
  }

  connectedCallback() {
    this._ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URI)
    this._ws.addEventListener('open', () => {
      console.log('connected to server')
    })
    this._ws.addEventListener('message', ({ data }) => {
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
    })

    this._chatUIElement.addEventListener('send-message', (ev) => {
      this._ws.send(ev.detail.message)
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
