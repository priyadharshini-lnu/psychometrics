/* eslint-disable symbol-description */
import QuestionTransport from './QuestionChannel'
import BlockTransport from './BlockChannel'
import LibraryTransport from './LibraryChannel'
// export default AssessmentTransport

const singleton = Symbol()
const singletonEnforcer = Symbol()

const Providers = {
  QuestionTransport,
  BlockTransport,
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
