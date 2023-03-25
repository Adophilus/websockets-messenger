import _ from 'lodash'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import Recipient from '../utils/Recipient'


export interface IRegisterRecipientEvent {
  recipient: Recipient
}

declare global {
  interface ElementEventMap {
    'select-recipient': CustomEvent<IRegisterRecipientEvent>
  }
}

const sectionClassName = 'bg-gray-100 shadow-lg p-2 md:p-4 lg:px-8'

@customElement('ws-lobby-ui')
class LobbyUIElement extends LitElement {
  @property()
  recipients: Recipient[] = []

  constructor() {
    super()
    this.setAttribute("class", "space-y-4")
  }

  render() {
    return html`
    <section class="${sectionClassName}">
      <h3 class="text-xl">Lobby</h3>
    </section>
    <section class="${sectionClassName}">
      <div class="divide-y p-2">${this.recipients.length === 0 ? html`No one is online 🙁` : repeat(this.recipients, (recipient: Recipient) => recipient.username, (recipient: Recipient) => this.recipientElementTemplate(recipient))}</div>
    </section>
    `
  }

  createRenderRoot() { return this }

  recipientElementTemplate(recipient: Recipient) {
    return html`<div>
    <p>
      <a @click="${(ev: MouseEvent) => {
        ev.preventDefault()
        this.dispatchEvent(
          new CustomEvent<IRegisterRecipientEvent>('select-recipient', {
            detail: { recipient }
          })
        )

      }}" href="#" class="flex justify-between">
        <span>
          ${_.escape(recipient.username)}
        </span>
        ${recipient.unreadChatsCount > 0 ? html`
          <span class="inline-flex items-center justify-center px-2 py-1 mr-2 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            ${recipient.unreadChatsCount}
          </span>
          `: null}
        </a>
    </p>
    </div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ws-lobby-ui": LobbyUIElement
  }
}

export default LobbyUIElement
