import Message from "../utils/Message"

interface ISendMessageEvent {
  message: string
}

declare global {
  interface ElementEventMap {
    'send-message': CustomEvent<ISendMessageEvent>
  }
}

class ChatUIElement extends HTMLElement {
  private declare _messagesWrapper: HTMLElement
  _template = `
  <section>
    <div id="messagesWrapper"></div>
  </section>
  <section>
    <form id="messageForm">
      <input type="text" id="message" />
      <input type="submit" value="Send" />
    </form>
  </section>
  `

  constructor() {
    super()
  }

  connectedCallback() {
    this.innerHTML = this._template
    const messageForm = this.querySelector('#messageForm') as HTMLFormElement
    const messageInput = this.querySelector('#message') as HTMLInputElement
    this._messagesWrapper = this.querySelector(
      '#messagesWrapper'
    ) as HTMLElement

    messageForm.addEventListener('submit', (ev) => {
      ev.preventDefault()

      const message = messageInput.value
      this._sendMessage(message)
    })
  }

  public addMessage(message: Message) {
    const messageElement = document.createElement('div')
    messageElement.innerHTML = `
    <p>${message.message}</p>
    <div>
      <small>${message.has_read}</small>
    </div>
    `
    this._messagesWrapper.appendChild(messageElement)
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
