import _ from 'lodash'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
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
      <div class="divide-y p-2">${this.recepients.length === 0 ? html`No one is online 🙁` : this.recepients.map(recepient => this.recepientElementTemplate(recepient))}</div>
    </section>
    `
  }

  createRenderRoot() { return this }

  recepientElementTemplate(recepient: Recepient) {
    console.log(recepient)
    return html`<div>
    <p>
      <a @click="${(ev: MouseEvent) => {
        ev.preventDefault()
        this.dispatchEvent(
          new CustomEvent('recepient', {
            detail: { recepient }
          })
        )

      }}" href="#" className="flex justify-between">
        <span>
          ${_.escape(recepient.username)}
        </span>
        ${recepient.unreadMessagesCount > 0 ? html`
          <span className="bg-red-700 text-white p-2 rounded-full">
            ${recepient.unreadMessagesCount}
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
