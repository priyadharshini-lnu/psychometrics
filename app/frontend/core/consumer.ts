import { createConsumer as railsCreateConsumer } from '@rails/actioncable'

let host = `${location.host.split(':')[0]}:${location.port}`
let protocol = 'ws:'
if (!__DEV__) {
  // eslint-disable-next-line prefer-destructuring
  host = location.host
}
if (location.protocol === 'https:') {
  protocol = 'wss:'
}

let consumer

const createConsumer = () => {
  if (consumer) { return consumer }
  consumer = railsCreateConsumer(`${protocol}//${host}/cable`)
  return consumer
}

export default createConsumer
