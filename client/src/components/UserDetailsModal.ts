class UserDetailsModalElement extends HTMLElement {
  private _shadowRoot: ShadowRoot
  private declare _form: HTMLFormElement
  private declare _fields: {
    username: HTMLInputElement
  }

  private _template = `
    <div className="w-screen h-screen absolute">
      <form id="registrationForm" class="lg:w-2/6 md:w-1/2 mx-auto bg-gray-100 rounded-lg p-8 flex flex-col">
        <h2 class="text-gray-900 text-lg font-medium title-font mb-5">Register</h2>
        <div class="relative mb-4">
          <label for="full-name" class="leading-7 text-sm text-gray-600">Username</label>
          <input type="text" id="usernameField" name="username-field" class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
        </div>
        <button class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Register</button>
      </div>
    </div>
  `
  constructor() {
    super()
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this.innerHTML = this._template
  }

  connectedCallback() {
    this._form = this._shadowRoot.querySelector(
      '#registrationForm'
    ) as HTMLFormElement
    this._fields = {
      username: this._shadowRoot.querySelector(
        '#usernameField'
      ) as HTMLInputElement
    }

    this._form.addEventListener('submit', () => {
      const username = this._fields.username.value

      this._registerUsername(username)
      this._fields.username.value = ''
    })
  }

  private _registerUsername(username: string) {
    this.dispatchEvent(
      new CustomEvent('register', {
        detail: {
          username
        }
      })
    )
  }
}

window.customElements.define('ws-user-details-modal', UserDetailsModalElement)

export default UserDetailsModalElement
