import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const Prompt = function () {

}

Prompt.prototype = new EventEmitter()

_.extend(Prompt.prototype, {
  open (value, onSave) {
    this.value = value
    this.onSave = onSave
    this.show = true
    this.update()
  },

  save (data) {
    this.onSave(data)
    this.show = false
    this.update()
  },

  close () {
    this.show = false
    this.update()
  },

  update () {
    this.emit('change')
  },
})

export default new Prompt()
