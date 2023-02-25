import './UserDetailsModal'

class AppElement extends HTMLElement {
  // declare private _ws: WebSocket
  private declare _username: string
  private declare _registrationModalElement: HTMLElement
  private declare _chatUIElement: HTMLElement

  constructor() {
    super()
    // this._ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URI)
  }

  connectedCallback() {
    this._registrationModalElement = document.createElement(
      'ws-user-details-modal'
    )
    this._chatUIElement = document.createElement('ws-chat-ui')

    this.appendChild(this._registrationModalElement)

    this.querySelector('ws-user-details-modal')?.addEventListener(
      'register',
      (e) => {
        this._username = e.detail.username
        this._hideRegistrationModal()
        this._showChatUI()
      }
    )
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
