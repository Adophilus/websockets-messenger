import { LitElement, html } from 'lit'
import { query, customElement } from 'lit/decorators.js'
import { StatusCodes } from 'http-status-codes'
import RefreshSvg from '../assets/refresh.svg'

export interface IUserRegistrationEvent {
  username: string
}

declare global {
  interface ElementEventMap {
    register: CustomEvent<IUserRegistrationEvent>
  }
}

@customElement('ws-user-details-modal')
class UserDetailsModalElement extends LitElement {
  @query('#username')
  declare usernameInput: HTMLInputElement

  @query('#password')
  declare passwordInput: HTMLInputElement

  @query('#loginOrRegister')
  declare loginOrRegister: HTMLInputElement

  constructor() {
    super()
  }

  createRenderRoot() { return this }

  render() {
    return html`
    <form @submit="${this.formSubmitted}" class="max-w-sm mx-auto bg-gray-100 rounded-lg p-8 flex flex-col shadow-lg">
      <h2 class="text-gray-900 text-lg font-medium title-font mb-5">Register</h2>
      <div class="relative mb-4">
        <label for="username" class="leading-7 text-sm text-gray-600">Username</label>
        <input type="text" name="username" id="username" class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
      </div>
      <div class="relative mb-4">
        <label for="password" class="leading-7 text-sm text-gray-600">Password</label>
        <input type="password" name="password" id="password" class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
      </div>
      <div class="flex gap-x-2">
        <button type="submit" class="grow text-white bg-indigo-500 border-0 py-2 px-8 hover:bg-indigo-600 rounded text-lg">
          <input class="peer" type="checkbox" id="loginOrRegister" />
          <span class="peer-checked:hidden">Login<span>
        </button>
        <label for="loginOrRegister" class="inline-flex items-center">
          <button class="p-2 w-12 h-12 rounded-full cursor-pointer bg-indigo-500 transition-transform ease-in-out duration-150 hover:bg-indigo-600 focus:rotate-180">
            <img class="filter invert" src="${RefreshSvg}" />
          </button>
        </label>
      </div>
    </form>
  `
  }

  async formSubmitted(ev: SubmitEvent) {
    ev.preventDefault()
    const username = this.usernameInput.value
    const password = this.passwordInput.value
    const loginOrRegister = this.loginOrRegister.checked

    let endpoint = '/auth/login'
    if (loginOrRegister)
      endpoint = '/auth/register'

    const res = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      })
    })
    const json = await res.json()
    const token = json.token
    if (res.status === StatusCodes.OK)
      this.dispatchEvent(
        new CustomEvent('login', {
          detail: {
            token
          }
        })
      )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ws-user-details-modal": UserDetailsModalElement
  }
}

export default UserDetailsModalElement
