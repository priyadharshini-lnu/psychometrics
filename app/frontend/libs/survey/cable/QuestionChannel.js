import { Cable } from 'action-cable-react'
import SocketDispatcher from 'dispatchers/SocketDispatcher'
import actionCable from './Cable'
import RequestsPool from './RequestsPool'

const urldata = location.pathname.match(/questions\/(\d+)/)
const id = urldata && urldata[1]

let cable
let count = 1

export default {
  perform (action, data, onResponce) {
    count += 1
    const reqId = `question_${id}_${Date.now() + count}`
    const metaData = { data }
    if (onResponce) {
      RequestsPool[reqId] = onResponce
      metaData.request_id = reqId
    }
    cable.channel('QuestionChannel').perform(action, metaData)
  },

  init () {
    if (!cable) {
      cable = new Cable({
        QuestionChannel: actionCable.subscriptions.create({ channel: 'Questions::Channel', question_id: id }),
      })
      cable.channel('QuestionChannel').on('connected', SocketDispatcher.connect)
      cable.channel('QuestionChannel').on('disconnected', SocketDispatcher.disconnect)
      cable.channel('QuestionChannel').on('rejected', SocketDispatcher.rejected)
      cable.channel('QuestionChannel').on('received', SocketDispatcher.received)
    }
  },
}
