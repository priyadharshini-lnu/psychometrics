import LibraryTransport from './LibraryChannel'

const singleton = Symbol('singleton')
const singletonEnforcer = Symbol('singletonEnforcer')

const Providers = {
  LibraryTransport,
}

class Socket {
  constructor (enforcer) {
    if (enforcer !== singletonEnforcer) throw new Error('Cannot construct singleton')
  }

  setProvider (name) {
    this.provider = name
    Providers[`${this.provider}Transport`].init()
  }

  socket () {
    return Providers[`${this.provider}Transport`]
  }

  library () {
    LibraryTransport.init()
    return LibraryTransport
  }

  static get instance () {
    if (!this[singleton]) {
      this[singleton] = new Socket(singletonEnforcer)
    }
    return this[singleton]
  }
}

export default Socket.instance
