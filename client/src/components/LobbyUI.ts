import _ from 'lodash'

interface IRegisterRecepientEvent {
  recepient: string
}

declare global {
  interface ElementEventMap {
    'register-recepient': CustomEvent<IRegisterRecepientEvent>
  }
}

const sectionClassName = 'bg-gray-100 shadow-lg p-2 md:p-4 lg:px-8'

class LobbyUIElement extends HTMLElement {
  private declare _recepientsWrapper: HTMLElement
  private _isMounted = false
  _template = `
  <section class="${sectionClassName}">
    <h3 class="text-xl">Lobby</h3>
  </section>
  <section class="${sectionClassName}">
    <div id="recepientsWrapper" class="divide-y"></div>
  </section>
  `

  constructor() {
    super()
    this.setAttribute("class", "space-y-4")
  }

  connectedCallback() {
    this.innerHTML = this._template
    this._isMounted = true

    this._recepientsWrapper = this.querySelector(
      '#recepientsWrapper'
    ) as HTMLElement
  }

  disconnectedCallback() {
    this._isMounted = false
  }

  public addRecepient(username: string) {
    if (!this._isMounted) return

    const recepientElement = document.createElement('div')
    recepientElement.setAttribute('id', `recepient-${username}`)
    recepientElement.classList.add('recepient')
    recepientElement.innerHTML = `
    <p>
      <a href="#">${_.escape(username)}</a>
    </p>
    `
    recepientElement.querySelector('a')?.addEventListener('click', (ev) => {
      ev.preventDefault()
      this._registerRecepient(username)
    })

    this._recepientsWrapper.appendChild(recepientElement)
  }

  public removeRecepient(username: string) {
    this.querySelector(`#recepient-${username}`)?.remove()
  }

  private _registerRecepient(username: string) {
    this.dispatchEvent(
      new CustomEvent('register-recepient', {
        detail: { recepient: username }
      })
    )
  }
}

window.customElements.define('ws-lobby-ui', LobbyUIElement)
export default LobbyUIElement
