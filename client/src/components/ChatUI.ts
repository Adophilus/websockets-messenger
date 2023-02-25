import _ from 'lodash'
import Message from '../utils/Message'

interface ISendMessageEvent {
  message: string
}

declare global {
  interface ElementEventMap {
    'send-message': CustomEvent<ISendMessageEvent>
  }
}

const sectionClassName = 'bg-gray-100 shadow-lg p-2 md:p-4 lg:px-8'

class ChatUIElement extends HTMLElement {
  private declare _username: string
  private declare _messageInput: HTMLInputElement
  private declare _messageForm: HTMLFormElement
  private declare _messagesWrapper: HTMLElement
  private _isMounted = false
  _template = `
  <div class="w-full mx-auto md:mt-12 md:w-1/2 lg:w-4/6 space-y-4">
    <section class="${sectionClassName}">
      <small class="text-xs">You're chatting as</small>
      <h3 class="text-xl" id="usernamePlaceholder"></h3>
    </section>
    <section class="${sectionClassName}">
      <div id="messagesWrapper" class="divide-y"></div>
      <form id="messageForm">
        <div class="flex">
          <input type="text" id="message" name="message" class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
          <button type="submit" class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Send</button>
        </div>
      </form>
    </section>
  </div>
  `

  constructor() {
    super()
  }

  static get observedAttributes() {
    return ['username']
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    switch (name) {
      case 'username':
        this._username = newValue
        break
      default:
        break
    }
  }

  connectedCallback() {
    this.innerHTML = this._template
    this._isMounted = true

    this._messageForm = this.querySelector('#messageForm') as HTMLFormElement
    this._messageInput = this.querySelector('#message') as HTMLInputElement
    const usernamePlaceholer = this.querySelector(
      '#usernamePlaceholder'
    ) as HTMLElement
    this._messagesWrapper = this.querySelector(
      '#messagesWrapper'
    ) as HTMLElement

    usernamePlaceholer.innerHTML = this._username
    this._messageForm.addEventListener(
      'submit',
      this._messageFormSubmitCallback
    )
  }

  disconnectedCallback() {
    this._isMounted = false

    this._messageForm.removeEventListener(
      'submit',
      this._messageFormSubmitCallback
    )
  }

  public addMessage(message: Message) {
    if (!this._isMounted) return

    const messageElement = document.createElement('div')
    messageElement.classList.add('chat-message')
    messageElement.innerHTML = `
    <p>${_.escape(message.message)}</p>
    <div>
      <small class="text-xs">${message.has_read}</small>
    </div>
    `
    this._messagesWrapper.appendChild(messageElement)
  }

  private _displayNotificationMessage(message: string) {
    if (!this._isMounted) return false

    const notificationElement = document.createElement('div')
    notificationElement.classList.add('chat-message')
    notificationElement.innerHTML = `
    <p>
      ${message}
    </p>
    `
    this._messagesWrapper.appendChild(notificationElement)
  }

  public notifyUserJoined(username: string) {
    this._displayNotificationMessage(
      `<strong>${_.escape(username)}</strong> has joined the room`
    )
  }

  public notifyUserLeft(username: string) {
    this._displayNotificationMessage(
      `<strong>${_.escape(username)}</strong> has left the room`
    )
  }

  private _messageFormSubmitCallback(ev: Event) {
    ev.preventDefault()

    const message = this._messageInput.value
    this._sendMessage(message)
    this._messageInput.value = ''
  }

  private _sendMessage(message: string) {
    this.dispatchEvent(
      new CustomEvent('send-message', {
        detail: {
          message
        }
      })
    )
  }
}

window.customElements.define('ws-chat-ui', ChatUIElement)
export default ChatUIElement
