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
  <section class="w-full mx-auto md:mt-12 md:w-1/2 lg:w-4/6 p-2 md:p-4 lg:px-8 shadow-lg">
    <section>
      <div id="messagesWrapper"></div>
    </section>
    <section>
      <form id="messageForm">
        <div class="flex">
          <input type="text" id="message" name="message" class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
          <button type="submit" class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Send</button>
        </div>
      </form>
    </section>
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
