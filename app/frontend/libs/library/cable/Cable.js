import { ActionCable } from 'action-cable-react'

let host = `${location.host.split(':')[0]}:3000`
let protocol = 'ws:'
if (!__DEV__) {
  // eslint-disable-next-line prefer-destructuring
  host = location.host // staging: 'psychometrics.demo.sumatosoft.com'
}
if (location.protocol === 'https:') {
  protocol = 'wss:'
}

export default ActionCable.createConsumer(`${protocol}//${host}/cable`)
