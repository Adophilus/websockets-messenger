import _ from 'lodash'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import Recepient from '../utils/Recepient'


export interface IRegisterRecepientEvent {
  recepient: Recepient
}

declare global {
  interface ElementEventMap {
    'recepient': CustomEvent<IRegisterRecepientEvent>
  }
}

const sectionClassName = 'bg-gray-100 shadow-lg p-2 md:p-4 lg:px-8'

@customElement('ws-lobby-ui')
class LobbyUIElement extends LitElement {
  @property()
  recepients: Recepient[] = []

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
      <div class="divide-y p-2">${this.recepients.length === 0 ? html`No one is online 🙁` : repeat(this.recepients, (recepient: Recepient) => recepient.username, (recepient: Recepient) => this.recepientElementTemplate(recepient))}</div>
    </section>
    `
  }

  createRenderRoot() { return this }

  recepientElementTemplate(recepient: Recepient) {
    return html`<div>
    <p>
      <a @click="${(ev: MouseEvent) => {
        ev.preventDefault()
        this.dispatchEvent(
          new CustomEvent('recepient', {
            detail: { recepient }
          })
        )

      }}" href="#" class="flex justify-between">
        <span>
          ${_.escape(recepient.username)}
        </span>
        ${recepient.unreadChatsCount > 0 ? html`
          <span class="inline-flex items-center justify-center px-2 py-1 mr-2 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            ${recepient.unreadChatsCount}
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
