import { LitElement, html } from 'lit'
import { query, customElement, property } from 'lit/decorators.js'

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
  declare userNameInput: HTMLInputElement

  constructor() {
    super()
  }

  createRenderRoot() { return this }

  render() {
    return html`
    <form @submit="${(ev) => {
        ev.preventDefault()
        const username = this.userNameInput.value
        this.dispatchEvent(
          new CustomEvent('register', {
            detail: {
              username
            }
          })
        )
      }}" class="max-w-sm mx-auto bg-gray-100 rounded-lg p-8 flex flex-col shadow-lg">
      <h2 class="text-gray-900 text-lg font-medium title-font mb-5">Register</h2>
      <div class="relative mb-4">
        <label for="full-name" class="leading-7 text-sm text-gray-600">Username</label>
        <input type="text" id="username" class="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
      </div>
      <button class="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Register</button>
    </form>
  `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ws-user-details-modal": UserDetailsModalElement
  }
}

export default UserDetailsModalElement
