import { Cable } from 'action-cable-react'
import SocketDispatcher from 'rb/dispatchers/SocketDispatcher'
import actionCable from './Cable'
import RequestsPool from './RequestsPool'

const urldata = location.pathname.match(/reports\/(\d+)/)
const id = urldata && urldata[1]

let cable
let count = 1

export default {
  perform (action, data, onResponse) {
    count += 1
    const reqId = `${id}_${Date.now() + count}`
    const metaData = { data }
    if (onResponse) {
      RequestsPool[reqId] = onResponse
      metaData.request_id = reqId
    }
    cable.channel('ReportChannel').perform(action, metaData)
  },

  RequestsPool,

  init () {
    if (!cable) {
      cable = new Cable({
        ReportChannel: actionCable.subscriptions.create({ channel: 'Reports::Channel', report_id: id }),
      })
      cable.channel('ReportChannel').on('connected', SocketDispatcher.connect)
      cable.channel('ReportChannel').on('disconnected', SocketDispatcher.disconnect)
      cable.channel('ReportChannel').on('rejected', SocketDispatcher.rejected)
      cable.channel('ReportChannel').on('received', SocketDispatcher.received)
    }
  },
}
