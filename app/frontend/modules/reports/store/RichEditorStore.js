import { EventEmitter } from 'fbemitter'

class RichEditorStore extends EventEmitter {
  constructor () {
    super()
    this.opened = false
  }

  update () {
    this.emit('change')
  }

  open () {
    this.opened = true
    this.update()
  }

  save () {
    this.opened = false
    this.update()
  }

  close () {
    this.opened = false
    this.update()
    this.emit('close')
  }
}

export default new RichEditorStore()
