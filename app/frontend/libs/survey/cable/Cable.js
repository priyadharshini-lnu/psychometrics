/* eslint-disable prefer-destructuring */
import { ActionCable } from 'action-cable-react'

let host = `${location.host.split(':')[0]}:${location.port}`
let protocol = 'ws:'
if (!__DEV__) {
  host = location.host
}
if (location.protocol === 'https:') {
  protocol = 'wss:'
}

export default ActionCable.createConsumer(`${protocol}//${host}/cable`)
