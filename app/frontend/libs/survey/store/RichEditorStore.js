import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const RichEditorStore = function () {
  this.question = null
}

RichEditorStore.prototype = new EventEmitter()

_.extend(RichEditorStore.prototype, {
  open (model, data, onChange) {
    this.model = model
    this.data = data
    this.onChange = onChange
    this.update()
  },

  save (data) {
    this.onChange(data)
    this.model = null
    this.update()
  },

  update () {
    this.emit('change')
  },
})

export default new RichEditorStore()
