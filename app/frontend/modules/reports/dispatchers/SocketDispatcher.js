import { EventEmitter } from 'fbemitter'
import AppStore from 'rb/store/AppStore'
import RequestsPool from 'rb/cable/RequestsPool'
import NotificationDispatcher from './NotificationDispatcher'

const dispatcher = new EventEmitter()

dispatcher.message = function (data) {
  if (data.action === 'report_data') {
    AppStore.init(data.data)
  }
  if (RequestsPool[data.request_id]) {
    RequestsPool[data.request_id](data.data)
  }
  dispatcher.emit(`message:${data.action}`, data.data)
}

dispatcher.connect = function () {
  dispatcher.emit('connected')
  AppStore.enable()
}

dispatcher.disconnect = function () {
  dispatcher.emit('disconnected')
  AppStore.disable()
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
