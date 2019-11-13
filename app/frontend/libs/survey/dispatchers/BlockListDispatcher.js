import _ from 'lodash'
import { EventEmitter } from 'fbemitter'
import store from 'store/BlockList'
import Action from 'undo'
import TrashDispatcher from './TrashDispatcher'

const dispatcher = new EventEmitter()

_.extend(dispatcher, {
  create (data) {
    store.create(data)
  },

  destroy (model) {
    store.destroy(model)
  },

  clickRemove (model) {
    this.remove(model)
    Action('BlockRemove', this, model)
  },

  remove (model) {
    store.destroy(model)
    TrashDispatcher.push('Block', model)
  },

  restore (model) {
    const block = TrashDispatcher.restore('Block', model)
    store.restore(block)
  },

  clickRestore (model) {
    this.restore(model)
    Action('BlockRestore', this, model)
  },

  moveDown (model) {
    if (store.moveDown(model)) {
      Action('BlockMoveDown', store, model)
    }
  },

  moveUp (model) {
    if (store.moveUp(model)) {
      Action('BlockMoveUp', store, model)
    }
  },

  clone (model, name) {
    store.clone(_.cloneDeep(model), name)
  },
})

export default dispatcher
