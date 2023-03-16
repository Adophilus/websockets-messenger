import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('ws-success-modal')
class SuccessModalElement extends LitElement {
  declare private modalClose: HTMLButtonElement
  declare private modalTextElement: HTMLSpanElement

  @property()
  message = 'An success occurgreen!'

  constructor() {
    super()
    this.setAttribute('class', 'flex justify-between items-center rounded-md p-3 bg-green-300')
  }

  createRenderRoot() { return this }

  render() {
    return html`
    <span id="modalText" class="text-green-700 font-bold text-xs">${this.message}</span>
    <button @click="${() => this.dispatchEvent(new Event('close'))}" class="rounded-md border-2 border-green-700 p-1">❌</button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ws-success-modal": SuccessModalElement
  }
}

export default SuccessModalElement 
