import { Cable } from 'action-cable-react'
import SocketDispatcher from 'dispatchers/SocketDispatcher'
import actionCable from './Cable'
import RequestsPool from './RequestsPool'

const urldata = location.pathname.match(/blocks\/(\d+)/)
const id = urldata && urldata[1]

let cable
let count = 1

export default {
  perform (action, data, onResponce) {
    count += 1
    const reqId = `block_${id}_${Date.now() + count}`
    const metaData = { data }
    if (onResponce) {
      RequestsPool[reqId] = onResponce
      metaData.request_id = reqId
    }
    cable.channel('BlockChannel').perform(action, metaData)
  },

  init () {
    if (!cable) {
      cable = new Cable({
        BlockChannel: actionCable.subscriptions.create({ channel: 'Blocks::Channel', block_id: id }),
      })
      cable.channel('BlockChannel').on('connected', SocketDispatcher.connect)
      cable.channel('BlockChannel').on('disconnected', SocketDispatcher.disconnect)
      cable.channel('BlockChannel').on('rejected', SocketDispatcher.rejected)
      cable.channel('BlockChannel').on('received', SocketDispatcher.received)
    }
  },
}
