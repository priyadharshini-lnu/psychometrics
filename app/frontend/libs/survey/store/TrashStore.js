import _ from 'lodash'
import { EventEmitter } from 'fbemitter'

const TrashStore = function () {
  this.list = []
}

TrashStore.prototype = new EventEmitter()

_.extend(TrashStore.prototype, {

  add (type, model) {
    this.list.push({ type, model })
    this.emit('change')
  },

  remove (type, model) {
    const item = _.find(this.list, { type, model })
    if (model.id) {
      item.permanentRemove = true
    } else {
      _.remove(this.list, item)
    }
    this.emit('change')
  },

  update () {
    this.emit('change')
  },

  restore (type, model) {
    const item = _.remove(this.list, { type, model })
    if (!item[0]) { return }
    this.emit('change')
    return item[0].model
  },

  empty () {
    _.each(this.list, (item) => {
      // eslint-disable-next-line no-param-reassign
      item.permanentRemove = true
    })
    this.emit('change')
  },
})

export default new TrashStore()
