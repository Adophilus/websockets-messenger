import { LitElement, html } from 'lit'
import { query, customElement, state } from 'lit/decorators.js'
import { StatusCodes } from 'http-status-codes'
import RefreshSvg from '../assets/refresh.svg'
import './error-modal.component'
import './success-modal.component'

export type TLoginEvent = {
  username: string,
  token: string
}

declare global {
  interface ElementEventMap {
    login: CustomEvent<TLoginEvent>
  }
}

@customElement('ws-user-details-modal')
class UserDetailsModalElement extends LitElement {
  @state()
  errorMessage = ""

  @state()
  successMessage = ""

  @query('#username')
  declare usernameInput: HTMLInputElement

  @query('#password')
  declare passwordInput: HTMLInputElement

  @query('#loginOrRegister')
  declare loginOrRegister: HTMLInputElement

  @query('#submitBtn')
  declare submitBtn: HTMLButtonElement

  constructor() {
    super()
  }

  createRenderRoot() { return this }

  render() {
    return html`
    <form @submit="${this.formSubmitted}" class="max-w-sm mx-auto bg-gray-100 rounded-lg p-8 flex flex-col shadow-lg">
      <div class="flex flex-col gap-4">
        ${this.errorMessage ? html`<ws-error-modal @close="${() => this.errorMessage = ""}" message="${this.errorMessage}"></ws-error-modal>` : null}
        ${this.successMessage ? html`<ws-success-modal @close="${() => this.successMessage = ""}" message="${this.successMessage}"></ws-success-modal>` : null}
        <div>
          <h2 class="text-gray-900 text-lg font-medium title-font mb-5">Register/Login</h2>
          <div class="relative mb-4">
            <label for="username" class="leading-7 text-sm text-gray-600">Username</label>
            <input type="text" name="username" id="username" class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
          </div>
          <div class="relative mb-4">
            <label for="password" class="leading-7 text-sm text-gray-600">Password</label>
            <input type="password" name="password" id="password" class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
          </div>
          <div class="flex gap-x-2">
            <button type="submit" id="submitBtn" class="grow text-white bg-indigo-500 border-0 py-2 px-8 hover:bg-indigo-600 rounded text-lg">
              <input class="peer appearance-none" type="checkbox" id="loginOrRegister" />
              <span class="peer-checked:hidden">Login</span>
              <span class="hidden peer-checked:inline">Register</span>
            </button>
            <label for="loginOrRegister" class="inline-flex items-center">
              <span role="button" style="pointer-events: fill" class="p-2 w-12 h-12 rounded-full cursor-pointer bg-indigo-500 transition-transform ease-in-out duration-150 hover:bg-indigo-600 hover:rotate-180">
                <img class="filter invert select-none" src="${RefreshSvg}" />
              </span>
            </label>
          </div>
        </div>
      </div>
    </form>
  `
  }

  async formSubmitted(ev: SubmitEvent) {
    ev.preventDefault()
    this.submitBtn.disabled = true

    try {
      const username = this.usernameInput.value
      const password = this.passwordInput.value
      const loginOrRegister = this.loginOrRegister.checked

      let endpoint = '/api/auth/login'
      if (loginOrRegister)
        endpoint = '/api/auth/register'

      const res = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          username,
          password
        })
      })
      const json = await res.json()
      if (loginOrRegister) {
        if (res.status !== StatusCodes.CREATED) {
          if (res.status === StatusCodes.CONFLICT) {
            this.errorMessage = "Username taken!"
          }
        }
        else {
          this.successMessage = "Account created"
        }
      }
      else {
        if (res.status === StatusCodes.OK) {
          const token = json.token
          this.dispatchEvent(
            new CustomEvent<TLoginEvent>('login', {
              detail: {
                username,
                token
              }
            })
          )
          this.successMessage = "Login successful!"
        }
      }
    } catch (err) {
      this.errorMessage = "Sorry, an error occurred 😢"
      console.log(err)
    } finally {
      this.submitBtn.disabled = false
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ws-user-details-modal": UserDetailsModalElement
  }
}

export default UserDetailsModalElement
