import { EventEmitter } from 'fbemitter'
import NotificationDispatcher from './NotificationDispatcher'
import AppStore from '../store/AppStore'
import Socket from '../cable'

const dispatcher = new EventEmitter()

dispatcher.message = function (data) {
  AppStore.init(data.data)
  if (Socket.library().RequestsPool[data.request_id]) {
    Socket.library().RequestsPool[data.request_id](data.data)
  }
  dispatcher.emit(`message:${data.action}`, data.data)
}

dispatcher.connect = function () {
  dispatcher.emit('connected')
  AppStore.enable()
  NotificationDispatcher.notify({ level: 'success', message: 'Connection established' })
}

dispatcher.disconnect = function () {
  dispatcher.emit('disconnected')
  AppStore.disable()
  NotificationDispatcher.notify({ level: 'error', message: 'Connection lost' })
}

dispatcher.rejected = function () {
  dispatcher.emit('rejected')
}

dispatcher.received = function (data) {
  if (data.notification) {
    NotificationDispatcher.notify(data.notification)
  }
  dispatcher.message(data)
}

export default dispatcher
