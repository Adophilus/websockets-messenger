import './UserDetailsModal'

interface IUserRegistationEvent extends CustomEvent {
  details: {
    username: string
  }
}

class AppElement extends HTMLElement {
  // private declare _ws: WebSocket
  private _shadowRoot: ShadowRoot
  private _username: string
  private _template = `
    <ws-user-details-modal></ws-user-details-modal>
  `

  constructor() {
    super()
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this.innerHTML = this._template
    // this._ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URI)
  }

  connectedCallback() {
    this._shadowRoot
      .querySelector('ws-user-details-modal')
      ?.addEventListener('register', (e: IUserRegistationEvent) => {
        this._username = e.details.username
      })
  }
}

window.customElements.define('ws-app', AppElement)
export default AppElement
