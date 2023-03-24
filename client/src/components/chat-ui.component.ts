import _ from 'lodash'
import { LitElement, html } from 'lit'
import { query, customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import Message from '../utils/Message'
import TEvent, { TEventType } from '../utils/Event'
import Recipient from '../utils/Recepient'

export interface ISendMessageEvent {
  message: string
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
  events: TEvent[] = []

  @property()
  username = ''

  @property()
  declare recepient: Recipient

  @state()
  isRecepientOnline = true

  constructor() {
    super()
    this.setAttribute("class", "space-y-4 h-[400px]")
  }

  readMessage(message: Message) {
    if (message.recipient !== this.username)
      return
    if (message.has_read)
      return
    this.dispatchEvent(new CustomEvent('read-message', { detail: { message } }))
  }

  messageTemplate(message: Message) {
    this.readMessage(message)

    return html`
    <div class="p-2">
      <p class="flex justify-end">
          ${message.sender === this.username ?
        html`<strong class="text-indigo-700">You</strong>` :
        html`<strong>${_.escape(message.sender)}</strong>`
      }
        </small>
      </p>
      <p>${_.escape(message.message)}</p>
      <div class="flex justify-end">
        <small class="text-xs">${message.has_read ? '✔️' : '❌'}</small>
      </div>
    </div>
    `
  }

  userTemplate(user: string, action: TEventType) {
    return html`<div class="p-2">
      <p class="font-bold">${_.escape(user)} ${action === "user-join" ? "has come online" : "has gone offline"}</p>
    </div>`
  }

  createRenderRoot() { return this }

  render() {
    return html`
      <section class="${sectionClassName}">
        <h3 class="text-xl">${this.isRecepientOnline ? '🟢' : '🔴'}${this.recepient.username}</h3>
      </section>
      <section class="${sectionClassName} h-full overflow-y-auto">
        <div class="divide-y">
        ${repeat(this.events, (event: TEvent) => event?.message?.id, (event: TEvent) => {
      switch (event.type) {
        case 'message':
          return this.messageTemplate(event.message!)
        default:
          return this.determineIfRecepientIsOnline(event)
      }
    })}
        </div>
      </section>
      <section class="${sectionClassName}">
        <form @submit="${(ev: SubmitEvent) => {
        ev.preventDefault()
        this.dispatchEvent(
          new CustomEvent('send-message', {
            detail: {
              message: this.messageInput.value
            }
          })
        )
        this.messageInput.value = ''
      }}">
        <div class="flex">
          <button type="button" @click="${this.selectFile}" class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"><i class="fa-solid fa-paperclip text-4xl"></i></button>
          <input type="text" id="message" name="message" class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
          <button type="submit" class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"><i class="fa-solid fa-paper-plane-top text-4xl"></i></button>
        </div>
        <input type="file" id="fileInput" class="appearance-none" />
      </form>
    </section>
    `
  }

  selectFile() {
    this.fileInput.click()
  }

  determineIfRecepientIsOnline(event: TEvent) {
    if (event.type === 'user-join' || event.type === 'user-leave') {
      if (event.type === 'user-join' && event.username === this.recepient.username) {
        this.isRecepientOnline = true
      }
      if (event.type === 'user-leave' && event.username === this.recepient.username) {
        this.isRecepientOnline = false
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ws-chat-ui": ChatUIElement
  }
}

export default ChatUIElement
