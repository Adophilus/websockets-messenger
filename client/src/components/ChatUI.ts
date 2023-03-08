import _ from 'lodash'
import { LitElement, html } from 'lit'
import { query, customElement, property, state } from 'lit/decorators.js'
import Message from '../utils/Message'
import IEvent, { IEventType } from '../utils/Event'

interface ISendMessageEvent {
  message: string
}

declare global {
  interface ElementEventMap {
    'message': CustomEvent<ISendMessageEvent>
  }
}

const sectionClassName = 'bg-gray-100 shadow-lg p-2 md:p-4 lg:px-8'

@customElement('ws-chat-ui')
class ChatUIElement extends LitElement {
  @query('#message')
  declare messageInput: HTMLInputElement

  @property()
  events: IEvent[] = []

  @property()
  username = ''

  @property()
  recepient = ''

  @state()
  isRecepientOnline = true

  constructor() {
    super()
    this.setAttribute("class", "space-y-4")
  }

  messageTemplate(message: Message) {
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

  userTemplate(user: string, action: IEventType) {
    return html`<div class="p-2">
      <p class="font-bold">${_.escape(user)} ${action === "user-join" ? "has come online" : "has gone offline"}</p>
    </div>`
  }

  createRenderRoot() { return this }

  render() {
    return html`
      <section class="${sectionClassName}">
        <h3 class="text-xl">${this.isRecepientOnline ? '🟢' : '🔴'}${this.recepient}</h3>
      </section>
      <section class="${sectionClassName}">
        <div class="divide-y">
        ${this.events.map(event => {
      switch (event.type) {
        case 'message':
          return this.messageTemplate(event.message!)
        default:
          return this.determineIfRecepientIsOnline(event)
      }
    })}
        </div>
        <form @submit="${(ev) => {
        ev.preventDefault()
        this.dispatchEvent(
          new CustomEvent('message', {
            detail: {
              message: this.messageInput.value
            }
          })
        )
      }}">
        <div class="flex">
          <input type="text" id="message" name="message" class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
          <button type="submit" class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Send</button>
        </div>
      </form>
    </section>
    `
  }

  determineIfRecepientIsOnline(event: IEvent) {
    if (event.type === 'user-join' || event.type === 'user-leave') {
      console.log(event)
      if (event.type === 'user-join' && event.user === this.recepient) {
        this.isRecepientOnline = true
        console.log(this.isRecepientOnline)
      }
      if (event.type === 'user-leave' && event.user === this.recepient) {
        this.isRecepientOnline = false
        console.log(this.isRecepientOnline)
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
