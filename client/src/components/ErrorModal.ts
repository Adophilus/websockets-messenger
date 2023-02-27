class ErrorModal extends HTMLElement {
  declare private _modalClose: HTMLButtonElement
  declare private _modalTextElement: HTMLSpanElement
  private _modalText = 'An error occurred!'

  constructor() {
    super()
    this.setAttribute('class', 'flex justify-between items-center rounded-md p-3 bg-red-300')
  }

  static get observedAttributes() {
    return ['message']
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    console.log(`Changing prop ${name} from ${oldValue} -> ${newValue}`)

    switch (name) {
      case 'message':
        this._modalText = `🔴 ${newValue}`
        if (this._modalTextElement)
          this._modalTextElement.innerHTML = this._modalText
        break
      default:
        break
    }
  }

  connectedCallback() {
    this.innerHTML = this._template

    this._modalClose = this.querySelector("#modalClose") as HTMLButtonElement
    this._modalTextElement = this.querySelector("#_modalText") as HTMLSpanElement

    this._modalClose.addEventListener('click', this._closeModal.bind(this))
  }

  disconnectedCallback() {
    this._modalClose.removeEventListener('click', this._closeModal.bind(this))
  }

  private get _template() {
    return `
    <span id="modalText" class="text-red-700 font-bold text-xs">${this._modalText}</span>
    <button id="modalClose" class="rounded-md border-2 border-red-700 p-1">❌</button>
    `
  }

  private _closeModal() {
    this.dispatchEvent(new Event('close'))
  }
}

window.customElements.define('ws-error-modal', ErrorModal)

export default ErrorModal
