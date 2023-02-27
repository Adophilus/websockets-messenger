class ErrorModal extends HTMLElement {
  declare private _modalClose: HTMLButtonElement
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
        this.render()
        break
      default:
        break
    }
  }

  connectedCallback() {
    this.render()

    this._modalClose = this.querySelector("#modalClose") as HTMLButtonElement

    this._modalClose.addEventListener('click', this._closeModal)
  }

  disconnectedCallback() {
    this._modalClose.removeEventListener('click', this._closeModal.bind(this))
  }

  private get _template() {
    return `
    <span class="text-red-700 font-bold text-xs">${this._modalText}</span>
    <button id="modalClose" class="rounded-md border-2 border-red-700 p-1">❌</button>
    `
  }

  private _closeModal() {
    console.warn('..')
    this.dispatchEvent(new Event('modal-close'))
  }

  public render() {
    this.innerHTML = this._template
  }
}

window.customElements.define('ws-error-modal', ErrorModal)

export default ErrorModal
