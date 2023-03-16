import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('ws-error-modal')
class ErrorModalElement extends LitElement {
  declare private modalClose: HTMLButtonElement
  declare private modalTextElement: HTMLSpanElement

  @property()
  message = 'An error occurred!'

  constructor() {
    super()
    this.setAttribute('class', 'flex justify-between items-center rounded-md p-3 bg-red-300')
  }

  createRenderRoot() { return this }

  render() {
    return html`
    <span id="modalText" class="text-red-700 font-bold text-xs">${this.message}</span>
    <button @click="${() => this.dispatchEvent(new Event('close'))}" class="rounded-md border-2 border-red-700 p-1">❌</button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ws-error-modal": ErrorModalElement
  }
}

export default ErrorModalElement 
