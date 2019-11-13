import { EventEmitter } from 'fbemitter'
import store from 'store/UndoRedoStore'
import NotificationDispatcher from './NotificationDispatcher'

const dispatcher = new EventEmitter()

dispatcher.undo = function () {
  const action = store.undo()
  if (action) {
    NotificationDispatcher.notify({ message: `Undo '${action.name}'`, level: 'warning', timeout: 1000 })
    this.emit('undo')
  }
  this.last = 'undo'
}

dispatcher.redo = function () {
  const action = store.redo()
  if (action) {
    NotificationDispatcher.notify({ message: `Redo '${action.name}'`, level: 'warning', timeout: 1000 })
    this.emit('redo')
  }
  this.last = 'redo'
}

dispatcher.again = function () {
  this[this.last]()
}

dispatcher.newAction = function (action) {
  store.newAction(action)
}

export default dispatcher
