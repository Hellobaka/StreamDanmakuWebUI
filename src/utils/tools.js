const md5 = require('js-md5')
const SALT = 'I AM FW'

export function md5Encrypt (msg, salt = true) {
  if (salt) msg += SALT
  return md5(msg)
}

export function readLocalStorage (name) {
  return JSON.parse(sessionStorage.getItem(name))
}

export function writeLocalStorage (name, data) {
  sessionStorage.setItem(name, JSON.stringify(data))
}
const listener = []
export function addListener (name, func) {
  listener[name] = func
}

export function removeListener (event) {
  const index = listener.indexOf(event)
  if (index !== -1) listener.splice(index, 1)
}

export function emitListener (event, ...args) {
  if (listener[event]) {
    listener[event](...args)
  }
}
