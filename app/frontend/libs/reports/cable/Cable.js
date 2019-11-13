import { ActionCable } from 'action-cable-react'

let host = `${location.host.split(':')[0]}:${location.port}`
let protocol = 'ws:'
if (!__DEV__) {
  // eslint-disable-next-line prefer-destructuring
  host = location.host
}
if (location.protocol === 'https:') {
  protocol = 'wss:'
}

export default ActionCable.createConsumer(`${protocol}//${host}/cable`)
