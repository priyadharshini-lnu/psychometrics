import { EventEmitter } from 'fbemitter'
import AppStore from 'store/AppStore'
import RequestsPool from 'cable/RequestsPool'
import store from 'rstore'
import NotificationDispatcher from './NotificationDispatcher'

const dispatcher = new EventEmitter()

dispatcher.message = function (data) {
  if (data.action === 'assessment_data') {
    AppStore.init(data.data)
    console.log(data)
    store.dispatch({ type: 'survey/assessment/INIT', data: data.data })
  }
  if (data.action === 'question_data') {
    AppStore.initQCenter(data.data)
  }
  if (data.action === 'block_data') {
    AppStore.initBCenter(data.data)
  }
  if (data.action === 'assessment_factors') {
    AppStore.initScoring(data.data)
  }
  if (RequestsPool[data.request_id]) {
    RequestsPool[data.request_id](data.data)
    delete RequestsPool[data.request_id]
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
