import './UserDetailsModal'
import { IUserRegistrationEvent } from './UserDetailsModal'

class AppElement extends HTMLElement {
  // private declare _ws: WebSocket
  private _username: string
  private _template = `
    <ws-user-details-modal></ws-user-details-modal>
  `

  constructor() {
    super()
    this.innerHTML = this._template
    // this._ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URI)
  }

  connectedCallback() {
    this.querySelector('ws-user-details-modal')?.addEventListener(
      'register',
      (e) => {
        this._username = e.detail.username
        console.log(this._username)
      }
    )
  }
}

window.customElements.define('ws-app', AppElement)
export default AppElement
