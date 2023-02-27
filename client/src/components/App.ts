import Message from '../utils/Message'
import ChatUIElement from './ChatUI'
import LobbyUIElement from './LobbyUI'
import './UserDetailsModal'
import UserDetailsModalElement from './UserDetailsModal'
import { io } from 'socket.io-client'
import ErrorModal from './ErrorModal'

class AppElement extends HTMLElement {
  private _ws = io('/', { path: '/chat' })
  private _username = window.sessionStorage.getItem('username')
  private _registrationModalElement = new UserDetailsModalElement()
  private _chatUIElement = new ChatUIElement()
  private _lobbyUIElement = new LobbyUIElement()
  private _errorModal = new ErrorModal()
  private _chatRecepient = ''

  constructor() {
    super()
    this.setAttribute("class", "block w-full px-4 mx-auto mt-8 md:mt-12 max-w-xl space-y-4")
  }

  connectedCallback() {
    this._showErrorModal('Network connection lost. Reconnecting...')
    this._ws.on('connect', () => {
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
        this._showErrorModal('Network connection lost. Reconnecting...')
      })
    })

    this._registrationModalElement.addEventListener('register', (ev) => {
      const { username } = ev.detail
      this._registerUsername(username)
      this._chatUIElement.setAttribute('username', username)

      this._hideRegistrationModal()
      this._showLobbyUI()
    })

    this._errorModal.addEventListener('close', () => {
      this._hideErrorModal()
    })

    this._chatUIElement.addEventListener('send-message', (ev) => {
      const message = ev.detail.message
      this._ws.emit('chat-message', { message, recepient: this._chatRecepient })
    })

    this._lobbyUIElement.addEventListener('register-recepient', (ev) => {
      const { recepient } = ev.detail

      this._fetchPreviousChatWith(recepient)
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

  private _showErrorModal(message: string) {
    this._errorModal.setAttribute("message", message)
    this.prepend(this._errorModal)
  }

  private _hideErrorModal() {
    this._errorModal.remove()
  }

  private _registerUsername(username: string) {
    this._username = username
    window.sessionStorage.setItem('username', username)

    this._ws.emit('chat-register', { username })
  }

  private _fetchPreviousChatWith(username: string) {
    this._ws.emit('chat-fetch', { recepient: username }, ({ messages }: { messages: IMessage[] }) => {
      messages.forEach(message => this._chatUIElement.addMessage(message))
    })
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
