import _ from 'lodash'
import Action from 'undo'
import TrashStore from 'store/TrashStore'
import TrashDispatcher from './TrashDispatcher'

const Dispatcher = function (store) {
  this.store = store
}

_.extend(Dispatcher.prototype, {

  clickRemove (model) {
    this.remove(model)
  },

  remove (model) {
    this.store.destroy(model)
    Action('QuestionRemove', this, model)
    TrashDispatcher.push('Question', model)
  },

  permanentRemove (model) {
    this.store.destroy(model)
    TrashDispatcher.push('Question', model)
    TrashStore.remove('Question', model)
  },

  restore (model) {
    const question = TrashDispatcher.restore('Question', model)
    if (!question) { return }
    this.store.restore(question)
  },

  clickRestore (model) {
    Action('QuestionRestore', this, model)
    this.restore(model)
  },

  rename (model, val) {
    Action('QuestionRename', model, { oldValue: model.name, newValue: val })
  },

  moveDown (model) {
    if (this.store.moveDown(model)) {
      Action('QuestionMoveDown', this.store, model)
    }
  },

  moveUp (model) {
    if (this.store.moveUp(model)) {
      Action('QuestionMoveUp', this.store, model)
    }
  },

  copy (model) {
    this.store.copy(model)
  },

  saveAsTemplate (model) {
    this.store.saveAsTemplate(model)
  },

  unlinkTemplate (model) {
    this.store.unlinkTemplate(model)
  },
})

export default Dispatcher
