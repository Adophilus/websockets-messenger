const storage = import.meta.env.PROD ? window.localStorage : window.sessionStorage

export default {
  setItem(key: string, value: string) {
    storage.setItem(key, value)
  },
  getItem(key: string) {
    return storage.getItem(key)
  },
  removeItem(key: string) {
    storage.removeItem(key)
  }
}
