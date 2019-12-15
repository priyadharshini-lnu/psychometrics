import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const RandomizationStore = function () {
  this.model = null
  this.entityName = null
  this.items = null
}

RandomizationStore.prototype = new EventEmitter()

_.extend(RandomizationStore.prototype, {
  open (model, entityName) {
    this.model = model
    this.entityName = entityName
    this.update()
  },

  close () {
    this.model = null
    this.callback = null
    this.update()
  },

  save (data) {
    this.model.props.randomization = data
    this.model.update()
    this.close()
  },

  update () {
    this.emit('change')
  },
})

export default new RandomizationStore()
