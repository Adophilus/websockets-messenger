import { LitElement, html } from 'lit'
import { query, customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import Message from '../utils/Message'
import Recipient from '../utils/Recipient'

export interface ISendMessageEvent {
  message: string,
  file: File | null
}

export interface IReadMessageEvent {
  message: Message
}


declare global {
  interface ElementEventMap {
    'send-message': CustomEvent<ISendMessageEvent>
  }
}

const sectionClassName = 'bg-gray-100 shadow-lg p-2 md:p-4 lg:px-8'

@customElement('ws-chat-ui')
class ChatUIElement extends LitElement {
  @query('#message')
  declare messageInput: HTMLInputElement

  @query('#fileInput')
  declare fileInput: HTMLInputElement

  @property()
  messages: Message[] = []

  @property()
  username = ''

  @property()
  declare recipient: Recipient

  @state()
  isRecepientOnline = true

  constructor() {
    super()
    this.setAttribute("class", "space-y-4 h-[400px]")
  }

  readMessage(message: Message) {
    if (message.sender !== this.username && !message.has_read) {
      this.dispatchEvent(new CustomEvent<IReadMessageEvent>('read-message', { detail: { message } }))
    }
  }

  messageTemplate(message: Message) {
    const messageMediaURL = message.media ? new URL(message.media, import.meta.env.VITE_API_URI).toString() : null
    return html`
    <div class="p-2">
      <p class="flex justify-end">
          ${message.sender === this.username ?
        html`<strong class="text-indigo-700">You</strong>` :
        html`<strong>${message.sender}</strong>`
      }
        </small>
      </p>
      <p>
        ${messageMediaURL ? html`<img class="aspect-square w-3/4 object-cover" src="${messageMediaURL}" alt="${messageMediaURL}" />` : null}
      </p>
      <p>${message.message}</p>
      <div class="flex justify-end">
        <small class="text-xs">${message.has_read ? '✔️' : ''}</small>
      </div>
    </div>
    `
  }

  createRenderRoot() { return this }

  render() {
    return html`
      <section class="${sectionClassName} flex gap-x-4">
        <a href="#" @click="${this.goBack}">◀</a>
        <h3 class="text-xl space-x-2">
          <span>
            ${this.recipient.isOnline ? '🟢' : '🔴'}
          </span>
          <span>
            ${this.recipient.username}
          </span>
        </h3>
      </section>
      <section class="${sectionClassName} h-full overflow-y-auto">
        <div class="divide-y">
        ${repeat(this.messages, (message: Message) => message.id, (message: Message) => {
      this.readMessage(message)
      return this.messageTemplate(message)
    })}
        </div>
      </section>
      <section class="${sectionClassName}">
        <form @submit="${this.sendMessage}">
        <div class="flex">
          <button type="button" @click="${this.selectFile}" class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">File</button>
          <input type="text" id="message" required name="message" class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
          <button type="submit" class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Send</button>
        </div>
        <input type="file" id="fileInput" class="hidden" />
      </form>
    </section>
    `
  }

  sendMessage(ev: SubmitEvent) {
    ev.preventDefault()
    const message = this.messageInput.value.trim()
    const file = this.fileInput.files?.[0] ?? null

    if (message) {
      this.dispatchEvent(
        new CustomEvent('send-message', {
          detail: {
            message,
            file
          }
        })
      )
      this.messageInput.value = ''
      this.fileInput.value = ''
    }
  }

  goBack(ev: MouseEvent) {
    ev.preventDefault()
    this.dispatchEvent(new CustomEvent('go-back', { detail: {} }))
  }

  selectFile() {
    this.fileInput.click()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ws-chat-ui": ChatUIElement
  }
}

export default ChatUIElement
