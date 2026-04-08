import SocketDispatcher from '~/modules/reports/dispatchers/SocketDispatcher'
import consumer from '~/core/consumer'
import RequestsPool from './RequestsPool'

let cable
let count = 1

export default {
  perform (action, data, onResponce) {
    count += 1
    const reqId = `library_${Date.now() + count}`
    const metaData = { data }
    if (onResponce) {
      RequestsPool[reqId] = onResponce
      metaData.request_id = reqId
    }
    cable.perform(action, metaData)
  },

  init () {
    if (!cable) {
      cable = consumer().subscriptions.create({ channel: 'Libraries::Channel' }, {
        connected () {
          SocketDispatcher.connect()
        },
        disconnected () {
          SocketDispatcher.disconnect()
        },
        rejected () {
          SocketDispatcher.rejected()
        },
        received (data) {
          SocketDispatcher.received(data)
        },
      })
    }
  },
}
