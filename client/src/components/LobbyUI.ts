import _ from 'lodash'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'


interface IRegisterRecepientEvent {
  recepient: string
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
  recepients: string[] = []

  constructor() {
    super()
    this.setAttribute("class", "space-y-4")
  }

  render() {
    console.log(this.recepients)
    return html`
    <section class="${sectionClassName}">
      <h3 class="text-xl">Lobby</h3>
    </section>
    <section class="${sectionClassName}">
      <div class="divide-y">${this.recepients.map(recepient => this.recepientElement(recepient))}</div>
    </section>
    `
  }

  createRenderRoot() { return this }

  recepientElement(recepient: string) {
    return html`<div>
    <p>
      <a @click="${(ev) => {
        ev.preventDefault()
        this.dispatchEvent(
          new CustomEvent('recepient', {
            detail: { recepient }
          })
        )

      }}" href="#">${_.escape(recepient)}</a>
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
