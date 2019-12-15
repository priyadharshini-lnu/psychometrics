import { Cable } from 'action-cable-react'
import SocketDispatcher from 'dispatchers/SocketDispatcher'
import actionCable from './Cable'
import RequestsPool from './RequestsPool'

const urldata = location.pathname.match(/assessments\/(\d+)/)
const id = urldata && urldata[1]

let cable
let count = 1

export default {
  perform (action, data, onResponce) {
    count += 1
    const reqId = `${id}_${Date.now() + count}`
    const metaData = { data }
    if (onResponce) {
      RequestsPool[reqId] = onResponce
      metaData.request_id = reqId
    }
    cable.channel('AssessmentChannel').perform(action, metaData)
  },

  init () {
    if (!cable) {
      cable = new Cable({
        AssessmentChannel: actionCable.subscriptions.create({ channel: 'Assessments::Channel', assessment_id: id }),
      })
      cable.channel('AssessmentChannel').on('connected', SocketDispatcher.connect)
      cable.channel('AssessmentChannel').on('disconnected', SocketDispatcher.disconnect)
      cable.channel('AssessmentChannel').on('rejected', SocketDispatcher.rejected)
      cable.channel('AssessmentChannel').on('received', SocketDispatcher.received)
    }
  },
}
