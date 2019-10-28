import { Cable } from 'action-cable-react'
import SocketDispatcher from 'dispatchers/SocketDispatcher'
import actionCable from './Cable'
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
    cable.channel('LibraryChannel').perform(action, metaData)
  },

  init () {
    if (!cable) {
      cable = new Cable({
        LibraryChannel: actionCable.subscriptions.create({ channel: 'Libraries::Channel' }),
      })
      cable.channel('LibraryChannel').on('connected', SocketDispatcher.connect)
      cable.channel('LibraryChannel').on('disconnected', SocketDispatcher.disconnect)
      cable.channel('LibraryChannel').on('rejected', SocketDispatcher.rejected)
      cable.channel('LibraryChannel').on('received', SocketDispatcher.received)
    }
  },
}
