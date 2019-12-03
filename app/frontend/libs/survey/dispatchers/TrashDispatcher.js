import { EventEmitter } from 'fbemitter'
import store from 'store/TrashStore'

const dispatcher = new EventEmitter()

dispatcher.push = function (type, model) {
  store.add(type, model)
}

dispatcher.remove = function (type, model) {
  store.remove(type, model)
}

dispatcher.update = function () {
  store.update()
}

dispatcher.restore = function (type, model) {
  return store.restore(type, model)
}

export default dispatcher
